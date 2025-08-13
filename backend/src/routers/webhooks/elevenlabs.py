import time
import hmac
import json
from hashlib import sha256
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from decouple import config

from crud.interviews.attempts import update_attempt_with_webhook_data
from services.grading_service import trigger_interview_grading
from services.websocket_service import websocket_manager

router = APIRouter()

ELEVENLABS_WEBHOOK_SECRET = config("ELEVENLABS_WEBHOOK_SECRET", cast=str, default="")

def validate_elevenlabs_signature(payload: bytes, signature_header: str) -> bool:
    """Validate ElevenLabs webhook signature using HMAC"""
    if not signature_header or not ELEVENLABS_WEBHOOK_SECRET:
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
            return False
        
        # Validate timestamp (reject if older than 30 minutes)
        tolerance = int(time.time()) - 30 * 60
        if int(timestamp) < tolerance:
            return False
        
        # Validate signature
        full_payload_to_sign = f"{timestamp}.{payload.decode('utf-8')}"
        mac = hmac.new(
            key=ELEVENLABS_WEBHOOK_SECRET.encode("utf-8"),
            msg=full_payload_to_sign.encode("utf-8"),
            digestmod=sha256,
        )
        expected_hash = 'v0=' + mac.hexdigest()
        
        return hmac.compare_digest(hash_value, expected_hash)
    
    except Exception as e:
        print(f"❌ Webhook signature validation error: {e}")
        return False

@router.post("/post-call")
async def handle_post_call_webhook(request: Request):
    """Handle ElevenLabs post-call webhook for transcription data"""
    print(f"\n🎣 [WEBHOOK] Received post-call webhook:")
    
    # Get raw payload and signature
    payload = await request.body()
    signature_header = request.headers.get("elevenlabs-signature", "")
    
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
        
        if not conversation_id:
            print("❌ No conversation_id in webhook data")
            raise HTTPException(status_code=400, detail="Missing conversation_id")
        
        print(f"\n🎣 [WEBHOOK] Received post-call webhook:")
        print(f"   - Conversation ID: {conversation_id}")
        print(f"   - Agent ID: {agent_id}")
        print(f"   - Transcript turns: {len(transcript)}")
        print(f"   - Has analysis: {bool(analysis)}")
        
        # Find the attempt by conversation_id and update with webhook data
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
        await websocket_manager.broadcast_transcript_update(
            str(attempt.id), 
            attempt.transcript
        )
        
        # Start grading process immediately
        print("🎯 Starting grading process...")
        await websocket_manager.broadcast_grading_started(str(attempt.id))
        
        try:
            feedback_data = await trigger_interview_grading(request, str(attempt.id))
            print("✅ Grading completed successfully")
            
            # Notify frontend that grading is complete
            if feedback_data:
                # Get the feedback document from database to get the ID
                from crud.interviews.attempts import get_attempt_feedback
                feedback = await get_attempt_feedback(request, str(attempt.id))
                if feedback:
                    await websocket_manager.broadcast_grading_completed(
                        str(attempt.id), 
                        str(feedback.id)
                    )
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