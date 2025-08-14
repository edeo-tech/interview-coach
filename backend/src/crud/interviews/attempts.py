from fastapi import Request
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta

from crud._generic._db_actions import createDocument, getDocument, getMultipleDocuments, updateDocument
from models.interviews.attempts import InterviewAttempt, InterviewFeedback

async def create_attempt(req: Request, interview_id: str) -> InterviewAttempt:
    """Create a new interview attempt"""
    print(f"\n🚀 [ATTEMPT] Creating new interview attempt:")
    print(f"   - Interview ID: {interview_id}")
    
    attempt_data = InterviewAttempt(
        interview_id=interview_id,
        status="active",
        transcript=[],
        duration_seconds=0,
        started_at=datetime.now(timezone.utc)
    )
    
    result = await createDocument(req, "interview_attempts", InterviewAttempt, attempt_data)
    
    if result:
        print(f"   ✅ SUCCESS: Created attempt with ID: {result.id}")
    else:
        print(f"   ❌ ERROR: Failed to create attempt!")
    
    return result

async def get_attempt(req: Request, attempt_id: str) -> Optional[InterviewAttempt]:
    """Get a specific attempt by ID"""
    return await getDocument(req, "interview_attempts", InterviewAttempt, _id=attempt_id)

async def get_interview_attempts(req: Request, interview_id: str) -> List[InterviewAttempt]:
    """Get all attempts for a specific interview"""
    return await getMultipleDocuments(
        req, "interview_attempts", InterviewAttempt,
        interview_id=interview_id,
        order_by="started_at"
    )

async def update_attempt(req: Request, attempt_id: str, **kwargs) -> Optional[InterviewAttempt]:
    """Update an interview attempt"""
    return await updateDocument(req, "interview_attempts", InterviewAttempt, attempt_id, **kwargs)

async def add_transcript_turn(
    req: Request, 
    attempt_id: str, 
    role: str, 
    message: str, 
    time_in_call_secs: int = None
) -> Optional[InterviewAttempt]:
    """Add a new turn to the interview transcript"""
    if time_in_call_secs is None:
        # Calculate time in call from attempt start time
        attempt = await get_attempt(req, attempt_id)
        if attempt and attempt.started_at:
            time_in_call_secs = int((datetime.now(timezone.utc) - attempt.started_at).total_seconds())
        else:
            time_in_call_secs = 0
    
    print(f"\n🎤 [TRANSCRIPT] Adding transcript segment:")
    print(f"   - Attempt ID: {attempt_id}")
    print(f"   - Role: {role}")
    print(f"   - Message preview: {message[:100]}..." if len(message) > 100 else f"   - Message: {message}")
    print(f"   - Time in call: {time_in_call_secs} seconds")
    
    # Get current attempt
    attempt = await get_attempt(req, attempt_id)
    if not attempt:
        print(f"   ❌ ERROR: Attempt {attempt_id} not found!")
        return None
    
    print(f"   - Current transcript length: {len(attempt.transcript)}")
    
    # Add new turn in ElevenLabs format
    new_turn = {
        "role": role,
        "message": message,
        "time_in_call_secs": time_in_call_secs
    }
    
    updated_transcript = attempt.transcript + [new_turn]
    
    result = await update_attempt(req, attempt_id, transcript=updated_transcript)
    
    if result:
        print(f"   ✅ SUCCESS: Transcript updated! New length: {len(updated_transcript)}")
    else:
        print(f"   ❌ ERROR: Failed to update transcript!")
    
    return result

async def finish_attempt(
    req: Request, 
    attempt_id: str, 
    final_duration: int = None
) -> Optional[InterviewAttempt]:
    """Mark an attempt as completed"""
    print(f"\n🏁 [ATTEMPT] Finishing interview attempt:")
    print(f"   - Attempt ID: {attempt_id}")
    print(f"   - Duration: {final_duration} seconds" if final_duration else "   - Duration: Not specified")
    
    update_data = {
        "status": "completed",
        "ended_at": datetime.now(timezone.utc)
    }
    
    if final_duration:
        update_data["duration_seconds"] = final_duration
    
    result = await update_attempt(req, attempt_id, **update_data)
    
    if result:
        print(f"   ✅ SUCCESS: Attempt marked as completed!")
        print(f"   - Final transcript length: {len(result.transcript)}")
    else:
        print(f"   ❌ ERROR: Failed to finish attempt!")
    
    return result

async def update_attempt_with_webhook_data(
    req: Request,
    conversation_id: str,
    transcript: List[Dict],
    analysis: Dict
) -> Optional[InterviewAttempt]:
    """Update attempt with data from ElevenLabs webhook"""
    print(f"\n🎣 [WEBHOOK] Updating attempt with webhook data:")
    print(f"   - Conversation ID: {conversation_id}")
    print(f"   - Transcript turns: {len(transcript)}")
    
    # Find attempt by conversation_id
    from crud._generic._db_actions import getMultipleDocuments
    attempts = await getMultipleDocuments(
        req, "interview_attempts", InterviewAttempt,
        conversation_id=conversation_id
    )
    
    if not attempts:
        print(f"   ❌ ERROR: No attempt found with conversation_id: {conversation_id}")
        return None
    
    attempt = attempts[0]  # Should only be one
    print(f"   - Found attempt ID: {attempt.id}")
    
    # Store transcript in original ElevenLabs format
    print(f"   - Storing {len(transcript)} transcript turns in ElevenLabs format")
    
    # Calculate duration from last turn
    duration_seconds = 0
    if transcript:
        last_turn = max(transcript, key=lambda x: x.get("time_in_call_secs", 0))
        duration_seconds = last_turn.get("time_in_call_secs", 0)
    
    # Update attempt with webhook data
    update_data = {
        "transcript": transcript,  # Store original ElevenLabs format
        "status": "completed",
        "ended_at": datetime.now(timezone.utc),
        "duration_seconds": duration_seconds,
        "conversation_id": conversation_id,  # Store conversation_id for future reference
        "elevenlabs_analysis": analysis  # Store raw analysis for reference
    }
    
    result = await update_attempt(req, attempt.id, **update_data)
    
    if result:
        print(f"   ✅ SUCCESS: Updated attempt with webhook data!")
        print(f"   - Final transcript length: {len(transcript)}")
        print(f"   - Duration: {duration_seconds} seconds")
    else:
        print(f"   ❌ ERROR: Failed to update attempt with webhook data!")
    
    return result

# Feedback operations
async def create_feedback(
    req: Request,
    attempt_id: str,
    overall_score: int,
    strengths: List[str],
    improvement_areas: List[str],
    detailed_feedback: str,
    rubric_scores: Dict[str, int]
) -> InterviewFeedback:
    """Create feedback for an interview attempt"""
    print(f"\n📝 [FEEDBACK] Creating interview feedback:")
    print(f"   - Attempt ID: {attempt_id}")
    print(f"   - Overall Score: {overall_score}/100")
    print(f"   - Strengths: {len(strengths)} items")
    print(f"   - Improvement Areas: {len(improvement_areas)} items")
    print(f"   - Rubric Categories: {list(rubric_scores.keys())}")
    
    feedback_data = InterviewFeedback(
        attempt_id=attempt_id,
        overall_score=overall_score,
        strengths=strengths,
        improvement_areas=improvement_areas,
        detailed_feedback=detailed_feedback,
        rubric_scores=rubric_scores
    )
    
    result = await createDocument(req, "interview_feedback", InterviewFeedback, feedback_data)
    
    if result:
        print(f"   ✅ SUCCESS: Created feedback with ID: {result.id}")
    else:
        print(f"   ❌ ERROR: Failed to create feedback!")
    
    return result

async def get_attempt_feedback(req: Request, attempt_id: str) -> Optional[InterviewFeedback]:
    """Get feedback for a specific attempt"""
    return await getDocument(req, "interview_feedback", InterviewFeedback, attempt_id=attempt_id)

async def get_user_feedback_history(req: Request, user_id: str, limit: int = 10) -> List[Dict]:
    """Get feedback history for a user across all interviews"""
    # This would need to join across collections - simplified version
    attempts = await getMultipleDocuments(
        req, "interview_attempts", InterviewAttempt,
        limit=limit * 2  # Get more attempts to find ones with feedback
    )
    
    feedback_list = []
    for attempt in attempts:
        feedback = await get_attempt_feedback(req, attempt.id)
        if feedback:
            # Get interview details
            from .interviews import get_interview
            interview = await get_interview(req, attempt.interview_id)
            
            if interview and interview.user_id == user_id:
                feedback_list.append({
                    "feedback": feedback,
                    "attempt": attempt,
                    "interview": interview
                })
    
    return feedback_list[:limit]

async def update_attempt_with_webhook_data_by_attempt_id(
    req: Request,
    attempt_id: str,
    conversation_id: str,
    transcript: List[Dict],
    analysis: Dict
) -> Optional[InterviewAttempt]:
    """Update attempt with data from ElevenLabs webhook using attempt_id directly"""
    print(f"\n🎣 [WEBHOOK] Updating attempt with webhook data (by attempt_id):")
    print(f"   - Attempt ID: {attempt_id}")
    print(f"   - Conversation ID: {conversation_id}")
    print(f"   - Transcript turns: {len(transcript)}")
    
    # Get attempt directly by ID
    attempt = await get_attempt(req, attempt_id)
    
    if not attempt:
        print(f"   ❌ ERROR: No attempt found with ID: {attempt_id}")
        return None
    
    print(f"   - Found attempt for interview: {attempt.interview_id}")
    
    # Store transcript in original ElevenLabs format
    print(f"   - Storing {len(transcript)} transcript turns in ElevenLabs format")
    
    # Calculate duration from last turn
    duration_seconds = 0
    if transcript:
        last_turn = max(transcript, key=lambda x: x.get("time_in_call_secs", 0))
        duration_seconds = last_turn.get("time_in_call_secs", 0)
    
    # Update attempt with webhook data
    update_data = {
        "transcript": transcript,  # Store original ElevenLabs format
        "status": "completed",
        "ended_at": datetime.now(timezone.utc),
        "duration_seconds": duration_seconds,
        "conversation_id": conversation_id,  # Store conversation_id for future reference
        "elevenlabs_analysis": analysis  # Store raw analysis for reference
    }
    
    result = await update_attempt(req, attempt_id, **update_data)
    
    if result:
        print(f"   ✅ SUCCESS: Updated attempt with webhook data!")
        print(f"   - Final transcript length: {len(transcript)}")
        print(f"   - Duration: {duration_seconds} seconds")
        print(f"   - Conversation ID stored: {conversation_id}")
    else:
        print(f"   ❌ ERROR: Failed to update attempt with webhook data!")
    
    return result

async def get_latest_active_attempt_for_agent(
    req: Request,
    agent_id: str
) -> Optional[InterviewAttempt]:
    """Get the most recent active attempt that doesn't have a conversation_id yet"""
    print(f"\n🔍 [FALLBACK] Looking for latest active attempt for agent: {agent_id}")
    
    # Get all active attempts without conversation_id, ordered by start time
    attempts = await getMultipleDocuments(
        req, "interview_attempts", InterviewAttempt,
        status="active",
        conversation_id=None,
        order_by="-started_at",  # Most recent first
        limit=10  # Check recent attempts
    )
    
    if attempts:
        # Get the most recent one
        attempt = attempts[0]
        print(f"   ✅ Found active attempt without conversation_id: {attempt.id}")
        print(f"   - Interview ID: {attempt.interview_id}")
        print(f"   - Started at: {attempt.started_at}")
        
        # Double check it's recent (within last 5 minutes)
        if attempt.started_at:
            time_diff = datetime.now(timezone.utc) - attempt.started_at
            if time_diff.total_seconds() < 300:  # 5 minutes
                return attempt
            else:
                print(f"   ⚠️ Attempt is too old: {time_diff.total_seconds()} seconds ago")
    
    print(f"   ❌ No suitable active attempt found")
    return None