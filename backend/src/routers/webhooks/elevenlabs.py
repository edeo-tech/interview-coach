import time
import hmac
import json
from hashlib import sha256
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from decouple import config

from crud.interviews.attempts import update_attempt_with_webhook_data, update_attempt_with_webhook_data_by_attempt_id, get_latest_active_attempt_for_agent
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
        
        # Extract attempt_id from userId
        attempt_id = None
        if user_id:
            # userId should now just be the attemptId directly
            attempt_id = user_id
            print(f"   ✅ Using userId as attempt_id: {attempt_id}")
        else:
            print(f"   ⚠️ No user_id in webhook data")
            # Log all available fields to debug
            print(f"   📋 Available data fields: {list(data.keys())}")
            print(f"   📋 Metadata content: {metadata}")
            
            # Check if there's conversation_initiation_client_data
            client_data = data.get("conversation_initiation_client_data", {})
            if client_data:
                print(f"   📋 Client data: {client_data}")
                # Try to extract userId from client data
                if isinstance(client_data, dict):
                    user_id_from_client = client_data.get("user_id") or client_data.get("userId")
                    if user_id_from_client:
                        attempt_id = user_id_from_client
                        print(f"   ✅ Found userId in client data: {attempt_id}")
        
        print(f"\n🎣 [WEBHOOK] Received post-call webhook:")
        print(f"   - Conversation ID: {conversation_id}")
        print(f"   - Agent ID: {agent_id}")
        print(f"   - Transcript turns: {len(transcript)}")
        print(f"   - Has analysis: {bool(analysis)}")
        print(f"   - User ID: {user_id}")
        print(f"   - Attempt ID extracted: {attempt_id}")
        
        # Try multiple approaches to find the attempt
        attempt = None
        
        # Approach 1: Try to update using attempt_id from userId
        if attempt_id:
            print(f"   ✅ Trying approach 1: Using attempt_id from userId: {attempt_id}")
            attempt = await update_attempt_with_webhook_data_by_attempt_id(
                request,
                attempt_id,
                conversation_id,
                transcript,
                analysis
            )
        
        # Approach 2: Try to find by conversation_id
        if not attempt and conversation_id:
            print(f"   ⚠️ Trying approach 2: Looking up by conversation_id: {conversation_id}")
            attempt = await update_attempt_with_webhook_data(
                request, 
                conversation_id, 
                transcript, 
                analysis
            )
        
        # Approach 3: Last resort - find latest active attempt for this agent
        if not attempt and agent_id:
            print(f"   ⚠️ Trying approach 3: Finding latest active attempt for agent: {agent_id}")
            latest_attempt = await get_latest_active_attempt_for_agent(request, agent_id)
            if latest_attempt:
                print(f"   🔄 Updating latest active attempt: {latest_attempt.id}")
                # Update it with the webhook data
                attempt = await update_attempt_with_webhook_data_by_attempt_id(
                    request,
                    str(latest_attempt.id),
                    conversation_id,
                    transcript,
                    analysis
                )
        
        if not attempt:
            print(f"❌ Could not find attempt using any approach")
            print(f"   - UserId/AttemptId: {attempt_id}")
            print(f"   - ConversationId: {conversation_id}")
            print(f"   - AgentId: {agent_id}")
            raise HTTPException(status_code=404, detail="Attempt not found")
        
        print(f"✅ Updated attempt: {attempt.id}")
        
        # Send real-time transcript update to frontend
        print(f"\n📡 [WEBSOCKET] Preparing to broadcast transcript update:")
        print(f"   - Attempt ID: {attempt.id}")
        print(f"   - Attempt ID (stringified): {str(attempt.id)}")
        print(f"   - Transcript length: {len(attempt.transcript)}")
        print(f"   - First turn preview: {attempt.transcript[0] if attempt.transcript else 'No transcript'}")
        
        await websocket_manager.broadcast_transcript_update(
            str(attempt.id), 
            attempt.transcript
        )
        
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