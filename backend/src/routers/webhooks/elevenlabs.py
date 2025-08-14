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
        
        # Extract attempt_id from userId (which contains our JSON-encoded custom data)
        attempt_id = None
        if user_id:
            try:
                # Parse the JSON-encoded userId
                custom_data = json.loads(user_id)
                attempt_id = custom_data.get("attemptId")
                interview_id = custom_data.get("interviewId")
                actual_user_id = custom_data.get("actualUserId")
                print(f"   ✅ Parsed custom data from userId: attemptId={attempt_id}, interviewId={interview_id}, actualUserId={actual_user_id}")
            except json.JSONDecodeError:
                print(f"   ⚠️ userId is not JSON-encoded, treating as regular user ID: {user_id}")
        
        print(f"\n🎣 [WEBHOOK] Received post-call webhook:")
        print(f"   - Conversation ID: {conversation_id}")
        print(f"   - Agent ID: {agent_id}")
        print(f"   - Transcript turns: {len(transcript)}")
        print(f"   - Has analysis: {bool(analysis)}")
        print(f"   - User ID: {user_id}")
        print(f"   - Attempt ID extracted: {attempt_id}")
        
        # Try to update attempt using attempt_id from metadata first
        if attempt_id:
            print(f"   ✅ Using attempt_id from metadata: {attempt_id}")
            attempt = await update_attempt_with_webhook_data_by_attempt_id(
                request,
                attempt_id,
                conversation_id,
                transcript,
                analysis
            )
        else:
            # Fallback to conversation_id lookup
            print(f"   ⚠️ No attempt_id in metadata, falling back to conversation_id lookup")
            if not conversation_id:
                print("❌ No conversation_id in webhook data")
                raise HTTPException(status_code=400, detail="Missing conversation_id")
            
            attempt = await update_attempt_with_webhook_data(
                request, 
                conversation_id, 
                transcript, 
                analysis
            )
        
        if not attempt:
            print(f"❌ No attempt found for conversation_id: {conversation_id}")
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