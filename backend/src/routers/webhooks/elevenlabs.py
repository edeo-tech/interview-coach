import time
import hmac
import json
from hashlib import sha256
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from decouple import config

from crud.interviews.attempts import update_attempt_with_webhook_data, update_attempt_with_webhook_data_by_attempt_id
from services.grading_service import trigger_interview_grading
from services.websocket_service import websocket_manager

router = APIRouter()

ELEVENLABS_WEBHOOK_SECRET = config("ELEVENLABS_WEBHOOK_SECRET", cast=str, default="")

def validate_elevenlabs_signature(payload: bytes, signature_header: str) -> bool:
    """Validate ElevenLabs webhook signature using HMAC"""
    if not signature_header or not ELEVENLABS_WEBHOOK_SECRET:
        print(f"❌ Missing signature header or webhook secret")
        return False
    
    try:
        # Parse signature header: "t=timestamp,v0=hash"
        parts = signature_header.split(",")
        timestamp = None
        hash_value = None
        
        for part in parts:
            if part.startswith("t="):
                timestamp = part[2:]
            elif part.startswith("v0="):
                hash_value = part[3:]
        
        if not timestamp or not hash_value:
            print(f"❌ Could not parse timestamp or hash from signature header")
            return False
        
        # Validate timestamp (reject if older than 30 minutes)
        tolerance = int(time.time()) - 30 * 60
        if int(timestamp) < tolerance:
            print(f"❌ Timestamp too old: {timestamp}")
            return False
        
        # Validate signature
        full_payload_to_sign = f"{timestamp}.{payload.decode('utf-8')}"
        mac = hmac.new(
            key=ELEVENLABS_WEBHOOK_SECRET.encode("utf-8"),
            msg=full_payload_to_sign.encode("utf-8"),
            digestmod=sha256,
        )
        expected_hash = mac.hexdigest()
        
        # Debug logging
        print(f"🔍 Signature validation debug:")
        print(f"   - Timestamp: {timestamp}")
        print(f"   - Received hash: {hash_value}")
        print(f"   - Expected hash: {expected_hash}")
        print(f"   - Secret length: {len(ELEVENLABS_WEBHOOK_SECRET)}")
        
        # Compare the hashes directly (hash_value already has v0= stripped)
        return hmac.compare_digest(hash_value, expected_hash)
    
    except Exception as e:
        print(f"❌ Webhook signature validation error: {e}")
        import traceback
        traceback.print_exc()
        return False

@router.post("/post-call")
async def handle_post_call_webhook(request: Request):
    """Handle ElevenLabs post-call webhook for transcription data"""
    print(f"\n🎣 [WEBHOOK] Received post-call webhook:")
    print(f"   - Headers: {dict(request.headers)}")
    
    # Get raw payload and signature
    payload = await request.body()
    signature_header = request.headers.get("elevenlabs-signature", "")
    
    # Log signature header for debugging
    print(f"   - Signature header: {signature_header}")
    print(f"   - Payload length: {len(payload)} bytes")
    
    # Skip signature validation if secret is not configured (for testing)
    if not ELEVENLABS_WEBHOOK_SECRET:
        print("⚠️  WARNING: ELEVENLABS_WEBHOOK_SECRET not configured, skipping signature validation")
    else:
        # Validate signature
        if not validate_elevenlabs_signature(payload, signature_header):
            print("❌ Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        # Parse webhook payload
        webhook_data = json.loads(payload.decode('utf-8'))
        
        # Ensure this is a transcription webhook
        if webhook_data.get("type") != "post_call_transcription":
            print(f"⚠️ Ignoring webhook type: {webhook_data.get('type')}")
            return {"status": "ignored"}
        
        data = webhook_data.get("data", {})
        conversation_id = data.get("conversation_id")
        agent_id = data.get("agent_id")
        transcript = data.get("transcript", [])
        analysis = data.get("analysis", {})
        metadata = data.get("metadata", {})
        user_id = data.get("user_id")
        
        # Log the full webhook data structure to understand where custom metadata is
        print(f"\n🔍 Full webhook data keys: {list(webhook_data.keys())}")
        print(f"🔍 Data object keys: {list(data.keys())}")
        print(f"🔍 User ID from webhook: {user_id}")
        
        # Extract attempt_id from multiple possible locations
        attempt_id = None
        
        # Log available fields for debugging
        print(f"   📋 Available data fields: {list(data.keys())}")
        
        # Check conversation_initiation_client_data which contains dynamic_variables
        client_data = data.get("conversation_initiation_client_data", {})
        dynamic_vars = {}
        if isinstance(client_data, dict):
            dynamic_vars = client_data.get("dynamic_variables", {})
            print(f"   📋 Dynamic variables keys: {list(dynamic_vars.keys()) if dynamic_vars else 'None'}")
        
        # Try multiple locations in order of reliability (based on ElevenLabs docs)
        attempt_id = (
            # 1. Check dynamic_variables (most reliable according to ElevenLabs docs)
            dynamic_vars.get("user_id")
            # 2. Check metadata.user_id (sometimes mirrored by ElevenLabs)
            or (metadata or {}).get("user_id")
            # 3. Check top-level user_id (less reliable with public agents)
            or user_id
            # 4. Additional fallback checks
            or client_data.get("user_id")
            or client_data.get("userId")
            or dynamic_vars.get("attempt_id")
            or dynamic_vars.get("userId")
        )
        
        if attempt_id:
            print(f"   ✅ Found attempt_id: {attempt_id}")
        else:
            print(f"   ⚠️ No attempt_id found in any location")
            print(f"   📋 Metadata content: {metadata}")
            print(f"   📋 Client data keys: {list(client_data.keys()) if client_data else 'None'}")
            print(f"   📋 Dynamic variables: {dynamic_vars}")
        
        print(f"\n🎣 [WEBHOOK] Post-call webhook summary:")
        print(f"   - Conversation ID: {conversation_id}")
        print(f"   - Agent ID: {agent_id}")
        print(f"   - Transcript turns: {len(transcript)}")
        print(f"   - Has analysis: {bool(analysis)}")
        print(f"   - Attempt ID found: {attempt_id}")
        
        # Update the attempt with webhook data
        attempt = None
        
        if attempt_id:
            print(f"   ✅ Updating attempt using attempt_id: {attempt_id}")
            attempt = await update_attempt_with_webhook_data_by_attempt_id(
                request,
                attempt_id,
                conversation_id,
                transcript,
                analysis
            )
        else:
            # Fallback to conversation_id lookup
            print(f"   ⚠️ No attempt_id found, trying conversation_id lookup: {conversation_id}")
            if conversation_id:
                attempt = await update_attempt_with_webhook_data(
                    request, 
                    conversation_id, 
                    transcript, 
                    analysis
                )
            else:
                print(f"❌ No conversation_id either, cannot process webhook")
                raise HTTPException(status_code=400, detail="No attempt_id or conversation_id found")
        
        if not attempt:
            print(f"❌ Could not find or update attempt")
            raise HTTPException(status_code=404, detail="Attempt not found")
        
        print(f"✅ Updated attempt: {attempt.id}")
        
        # Transcript is now stored in database only - no WebSocket broadcast needed
        print(f"\n💾 [TRANSCRIPT] Transcript stored in database:")
        print(f"   - Attempt ID: {attempt.id}")
        print(f"   - Transcript length: {len(attempt.transcript)}")
        print(f"   - First turn preview: {attempt.transcript[0] if attempt.transcript else 'No transcript'}")
        
        # Start grading process immediately
        print("\n🎯 Starting grading process...")
        print(f"   - Broadcasting grading_started for attempt: {str(attempt.id)}")
        await websocket_manager.broadcast_grading_started(str(attempt.id))
        
        try:
            feedback_data = await trigger_interview_grading(request, str(attempt.id))
            print("✅ Grading completed successfully")
            
            # Notify frontend that grading is complete
            if feedback_data:
                # Get the feedback document from database to get the ID
                from crud.interviews.attempts import get_attempt_feedback
                feedback = await get_attempt_feedback(request, str(attempt.id))
                print(f"\n📡 [WEBSOCKET] Preparing to broadcast grading_completed:")
                print(f"   - Attempt ID: {str(attempt.id)}")
                print(f"   - Feedback found: {feedback is not None}")
                if feedback:
                    print(f"   - Feedback ID: {str(feedback.id)}")
                    print(f"   - Overall score: {feedback.overall_score}")
                    await websocket_manager.broadcast_grading_completed(
                        str(attempt.id), 
                        str(feedback.id)
                    )
                else:
                    print(f"   - WARNING: No feedback document found in database!")
        except Exception as grade_error:
            print(f"❌ Grading failed: {grade_error}")
            await websocket_manager.broadcast_error(
                str(attempt.id),
                f"Grading failed: {str(grade_error)}"
            )
        
        return {"status": "success", "attempt_id": str(attempt.id)}
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        print(f"❌ Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")