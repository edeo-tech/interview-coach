import time
import hmac
import json
from hashlib import sha256
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from decouple import config

from crud.interviews.attempts import update_attempt_with_webhook_data, update_attempt_with_webhook_data_by_attempt_id
from services.grading_service import trigger_interview_grading

router = APIRouter()

ELEVENLABS_WEBHOOK_SECRET = config("ELEVENLABS_WEBHOOK_SECRET", cast=str, default="")

def validate_elevenlabs_signature(payload: bytes, signature_header: str) -> bool:
    """Validate ElevenLabs webhook signature using HMAC"""
    print(f"\n[SIGNATURE] Starting signature validation...")
    
    if not signature_header or not ELEVENLABS_WEBHOOK_SECRET:
        print(f"[SIGNATURE] ❌ Missing required components:")
        print(f"  - Has signature header: {bool(signature_header)}")
        print(f"  - Has webhook secret: {bool(ELEVENLABS_WEBHOOK_SECRET)}")
        return False
    
    try:
        # Parse signature header: "t=timestamp,v0=hash"
        print(f"[SIGNATURE] Parsing signature header...")
        print(f"  - Raw header: {signature_header[:50]}..." if len(signature_header) > 50 else f"  - Raw header: {signature_header}")
        
        parts = signature_header.split(",")
        timestamp = None
        hash_value = None
        
        for part in parts:
            if part.startswith("t="):
                timestamp = part[2:]
            elif part.startswith("v0="):
                hash_value = part[3:]
        
        print(f"[SIGNATURE] Parsed components:")
        print(f"  - Timestamp: {timestamp}")
        print(f"  - Hash (first 10 chars): {hash_value[:10]}..." if hash_value else "  - Hash: None")
        
        if not timestamp or not hash_value:
            print(f"[SIGNATURE] ❌ Could not parse required components from header")
            return False
        
        # Validate timestamp (reject if older than 30 minutes)
        current_time = int(time.time())
        tolerance = current_time - 30 * 60
        timestamp_int = int(timestamp)
        age_seconds = current_time - timestamp_int
        
        print(f"[SIGNATURE] Timestamp validation:")
        print(f"  - Current time: {current_time}")
        print(f"  - Webhook time: {timestamp_int}")
        print(f"  - Age: {age_seconds} seconds")
        
        if timestamp_int < tolerance:
            print(f"[SIGNATURE] ❌ Timestamp too old (> 30 minutes)")
            return False
        print(f"[SIGNATURE] ✓ Timestamp is valid")
        
        # Validate signature
        print(f"[SIGNATURE] Computing expected hash...")
        full_payload_to_sign = f"{timestamp}.{payload.decode('utf-8')}"
        print(f"  - Payload length: {len(payload)} bytes")
        print(f"  - Secret length: {len(ELEVENLABS_WEBHOOK_SECRET)} chars")
        
        mac = hmac.new(
            key=ELEVENLABS_WEBHOOK_SECRET.encode("utf-8"),
            msg=full_payload_to_sign.encode("utf-8"),
            digestmod=sha256,
        )
        expected_hash = mac.hexdigest()
        
        # Compare hashes
        print(f"[SIGNATURE] Hash comparison:")
        print(f"  - Received: {hash_value[:10]}...")
        print(f"  - Expected: {expected_hash[:10]}...")
        
        # Compare the hashes directly (hash_value already has v0= stripped)
        is_valid = hmac.compare_digest(hash_value, expected_hash)
        print(f"[SIGNATURE] Result: {'✅ VALID' if is_valid else '❌ INVALID'}")
        
        return is_valid
    
    except Exception as e:
        print(f"[SIGNATURE] ❌ Validation error: {str(e)}")
        print(f"[SIGNATURE] Error type: {type(e).__name__}")
        import traceback
        print(f"[SIGNATURE] Traceback:")
        traceback.print_exc()
        return False

@router.post("/post-call")
async def handle_post_call_webhook(request: Request):
    """Handle ElevenLabs post-call webhook for transcription data"""
    print(f"\n{'='*80}")
    print(f"🎣 [ELEVENLABS-WEBHOOK] Received post-call webhook")
    print(f"{'='*80}")
    print(f"[WEBHOOK] Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}")
    print(f"[WEBHOOK] Request ID: {request.state.request_id if hasattr(request.state, 'request_id') else 'N/A'}")
    print(f"[WEBHOOK] Headers:")
    for header, value in request.headers.items():
        if 'authorization' not in header.lower() and 'signature' not in header.lower():
            print(f"  - {header}: {value}")
        else:
            print(f"  - {header}: [REDACTED]")
    
    # Get raw payload and signature
    payload = await request.body()
    signature_header = request.headers.get("elevenlabs-signature", "")
    
    # Log signature header for debugging
    print(f"\n[WEBHOOK] Security info:")
    print(f"  - Has signature header: {bool(signature_header)}")
    print(f"  - Payload length: {len(payload)} bytes")
    print(f"  - Webhook secret configured: {bool(ELEVENLABS_WEBHOOK_SECRET)}")
    
    # Skip signature validation if secret is not configured (for testing)
    if not ELEVENLABS_WEBHOOK_SECRET:
        print(f"[WEBHOOK] ⚠️  WARNING: ELEVENLABS_WEBHOOK_SECRET not configured, skipping signature validation")
    else:
        # Validate signature
        print(f"[WEBHOOK] Validating webhook signature...")
        if not validate_elevenlabs_signature(payload, signature_header):
            print(f"[WEBHOOK] ❌ Invalid webhook signature - rejecting request")
            print(f"{'='*80}\n")
            raise HTTPException(status_code=401, detail="Invalid signature")
        print(f"[WEBHOOK] ✅ Signature validated successfully")
    
    try:
        # Parse webhook payload
        print(f"\n[WEBHOOK] Parsing payload...")
        webhook_data = json.loads(payload.decode('utf-8'))
        print(f"[WEBHOOK] ✅ Payload parsed successfully")
        
        # Log webhook type
        webhook_type = webhook_data.get("type")
        print(f"[WEBHOOK] Webhook type: {webhook_type}")
        
        # Ensure this is a transcription webhook
        if webhook_type != "post_call_transcription":
            print(f"[WEBHOOK] ⚠️ Ignoring non-transcription webhook type: {webhook_type}")
            print(f"{'='*80}\n")
            return {"status": "ignored"}
        
        print(f"\n[WEBHOOK] Extracting webhook data...")
        data = webhook_data.get("data", {})
        conversation_id = data.get("conversation_id")
        agent_id = data.get("agent_id")
        transcript = data.get("transcript", [])
        analysis = data.get("analysis", {})
        metadata = data.get("metadata", {})
        user_id = data.get("user_id")
        
        # Log the full webhook data structure
        print(f"[WEBHOOK] Data structure:")
        print(f"  - Root keys: {list(webhook_data.keys())}")
        print(f"  - Data keys: {list(data.keys())}")
        print(f"  - Conversation ID: {conversation_id}")
        print(f"  - Agent ID: {agent_id}")
        print(f"  - User ID (top-level): {user_id}")
        print(f"  - Transcript entries: {len(transcript)}")
        print(f"  - Has analysis: {bool(analysis)}")
        print(f"  - Metadata keys: {list(metadata.keys()) if metadata else 'None'}")
        
        # Extract attempt_id from multiple possible locations
        print(f"\n[WEBHOOK] Searching for attempt_id in webhook data...")
        attempt_id = None
        
        # Check conversation_initiation_client_data which contains dynamic_variables
        client_data = data.get("conversation_initiation_client_data", {})
        dynamic_vars = {}
        if isinstance(client_data, dict):
            dynamic_vars = client_data.get("dynamic_variables", {})
            print(f"[WEBHOOK] Client data structure:")
            print(f"  - Client data keys: {list(client_data.keys()) if client_data else 'None'}")
            print(f"  - Dynamic variables keys: {list(dynamic_vars.keys()) if dynamic_vars else 'None'}")
            if dynamic_vars:
                print(f"  - Dynamic variables content: {dynamic_vars}")
        
        # Try multiple locations in order of reliability (based on ElevenLabs docs)
        print(f"[WEBHOOK] Checking multiple locations for attempt_id...")
        locations_checked = []
        
        # 1. Check dynamic_variables (most reliable according to ElevenLabs docs)
        if dynamic_vars.get("user_id"):
            attempt_id = dynamic_vars.get("user_id")
            locations_checked.append("dynamic_vars.user_id")
        # 2. Check metadata.user_id (sometimes mirrored by ElevenLabs)
        elif (metadata or {}).get("user_id"):
            attempt_id = metadata.get("user_id")
            locations_checked.append("metadata.user_id")
        # 3. Check top-level user_id (less reliable with public agents)
        elif user_id:
            attempt_id = user_id
            locations_checked.append("data.user_id")
        # 4. Additional fallback checks
        elif client_data.get("user_id"):
            attempt_id = client_data.get("user_id")
            locations_checked.append("client_data.user_id")
        elif client_data.get("userId"):
            attempt_id = client_data.get("userId")
            locations_checked.append("client_data.userId")
        elif dynamic_vars.get("attempt_id"):
            attempt_id = dynamic_vars.get("attempt_id")
            locations_checked.append("dynamic_vars.attempt_id")
        elif dynamic_vars.get("userId"):
            attempt_id = dynamic_vars.get("userId")
            locations_checked.append("dynamic_vars.userId")
        
        if attempt_id:
            print(f"[WEBHOOK] ✅ Found attempt_id: {attempt_id}")
            print(f"[WEBHOOK] Location: {locations_checked[-1] if locations_checked else 'unknown'}")
        else:
            print(f"[WEBHOOK] ⚠️  No attempt_id found in any location")
            print(f"[WEBHOOK] Locations checked: {locations_checked or 'all standard locations'}")
            print(f"[WEBHOOK] Full metadata content: {metadata}")
            print(f"[WEBHOOK] Full dynamic variables: {dynamic_vars}")
        
        print(f"\n[WEBHOOK] Summary of extracted data:")
        print(f"  - Conversation ID: {conversation_id}")
        print(f"  - Agent ID: {agent_id}")
        print(f"  - Transcript turns: {len(transcript)}")
        print(f"  - Has analysis: {bool(analysis)}")
        print(f"  - Attempt ID: {attempt_id or 'NOT FOUND'}")
        
        # Update the attempt with webhook data
        print(f"\n[WEBHOOK] Step 1: Updating attempt with webhook data...")
        attempt = None
        
        if attempt_id:
            print(f"[WEBHOOK] Using attempt_id for update: {attempt_id}")
            attempt = await update_attempt_with_webhook_data_by_attempt_id(
                request,
                attempt_id,
                conversation_id,
                transcript,
                analysis
            )
        else:
            # Fallback to conversation_id lookup
            print(f"[WEBHOOK] ⚠️  No attempt_id found, falling back to conversation_id lookup")
            if conversation_id:
                print(f"[WEBHOOK] Using conversation_id for update: {conversation_id}")
                attempt = await update_attempt_with_webhook_data(
                    request, 
                    conversation_id, 
                    transcript, 
                    analysis
                )
            else:
                print(f"[WEBHOOK] ❌ ERROR: No attempt_id or conversation_id found")
                print(f"{'='*80}\n")
                raise HTTPException(status_code=400, detail="No attempt_id or conversation_id found")
        
        if not attempt:
            print(f"[WEBHOOK] ❌ ERROR: Could not find or update attempt")
            print(f"{'='*80}\n")
            raise HTTPException(status_code=404, detail="Attempt not found")
        
        print(f"[WEBHOOK] ✅ Attempt updated successfully")
        print(f"  - Attempt ID: {attempt.id}")
        print(f"  - Status: {attempt.status}")
        print(f"  - Interview ID: {attempt.interview_id}")
        
        # Transcript is now stored in database only
        print(f"\n[WEBHOOK] Step 2: Transcript storage confirmed")
        print(f"  - Attempt ID: {attempt.id}")
        print(f"  - Transcript entries: {len(attempt.transcript)}")
        if attempt.transcript:
            first_turn = attempt.transcript[0]
            print(f"  - First turn preview:")
            print(f"    - Role: {first_turn.get('role', 'N/A')}")
            print(f"    - Message: {first_turn.get('message', '')[:100]}...")
        
        # Start grading process immediately
        print(f"\n[WEBHOOK] Step 3: Starting grading process...")
        print(f"  - Attempt ID: {str(attempt.id)}")
        
        try:
            print(f"[WEBHOOK] Triggering interview grading...")
            feedback_data = await trigger_interview_grading(request, str(attempt.id))
            print(f"[WEBHOOK] ✅ Grading completed successfully")
            print(f"  - Feedback exists: {feedback_data is not None}")
            if feedback_data:
                print(f"  - Overall score: {feedback_data.get('overall_score', 'N/A')}")
            
            # Notify frontend that grading is complete
            if feedback_data:
                # Get the feedback document from database to get the ID
                from crud.interviews.attempts import get_attempt_feedback
                print(f"\n[WEBHOOK] Step 4: Retrieving saved feedback from database...")
                feedback = await get_attempt_feedback(request, str(attempt.id))
                print(f"[WEBHOOK] Feedback retrieval result:")
                print(f"  - Feedback found: {feedback is not None}")
                if feedback:
                    print(f"  - Feedback ID: {str(feedback.id)}")
                    print(f"  - Overall score: {feedback.overall_score}")
                    print(f"  - Strengths count: {len(feedback.strengths)}")
                    print(f"  - Improvement areas count: {len(feedback.improvement_areas)}")
                    
                    print(f"[WEBHOOK] ✅ Feedback successfully saved and available")
                else:
                    print(f"[WEBHOOK] ⚠️  WARNING: No feedback document found in database!")
        except Exception as grade_error:
            print(f"\n[WEBHOOK] ❌ ERROR: Grading failed")
            print(f"[WEBHOOK] Error: {str(grade_error)}")
            print(f"[WEBHOOK] Error type: {type(grade_error).__name__}")
            import traceback
            print(f"[WEBHOOK] Traceback:")
            traceback.print_exc()
            
            print(f"[WEBHOOK] Note: Frontend will need to poll for grading status")
        
        print(f"\n[WEBHOOK] ✅ Webhook processing complete")
        print(f"[WEBHOOK] Response: {{\"status\": \"success\", \"attempt_id\": \"{str(attempt.id)}\"}}")
        print(f"{'='*80}\n")
        return {"status": "success", "attempt_id": str(attempt.id)}
        
    except json.JSONDecodeError as e:
        print(f"\n[WEBHOOK] ❌ ERROR: Invalid JSON in webhook payload")
        print(f"[WEBHOOK] Error: {str(e)}")
        print(f"{'='*80}\n")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        print(f"\n[WEBHOOK] ❌ ERROR: Webhook processing error")
        print(f"[WEBHOOK] Error: {str(e)}")
        print(f"[WEBHOOK] Error type: {type(e).__name__}")
        import traceback
        print(f"[WEBHOOK] Traceback:")
        traceback.print_exc()
        print(f"{'='*80}\n")
        raise HTTPException(status_code=500, detail="Internal server error")