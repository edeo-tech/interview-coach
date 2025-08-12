from fastapi import Request
from typing import Optional, List, Dict
from datetime import datetime, timezone

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
    speaker: str, 
    text: str, 
    timestamp: datetime = None
) -> Optional[InterviewAttempt]:
    """Add a new turn to the interview transcript"""
    if timestamp is None:
        timestamp = datetime.now(timezone.utc)
    
    print(f"\n🎤 [TRANSCRIPT] Adding transcript segment:")
    print(f"   - Attempt ID: {attempt_id}")
    print(f"   - Speaker: {speaker}")
    print(f"   - Text preview: {text[:100]}..." if len(text) > 100 else f"   - Text: {text}")
    print(f"   - Timestamp: {timestamp.isoformat()}")
    
    # Get current attempt
    attempt = await get_attempt(req, attempt_id)
    if not attempt:
        print(f"   ❌ ERROR: Attempt {attempt_id} not found!")
        return None
    
    print(f"   - Current transcript length: {len(attempt.transcript)}")
    
    # Add new turn
    new_turn = {
        "speaker": speaker,
        "text": text,
        "timestamp": timestamp.isoformat()
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