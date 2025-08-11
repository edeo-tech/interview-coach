from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import List

from authentication import Authorization
from utils.errors.error_decorator_routes import error_decorator
from crud.interviews.attempts import get_attempt_feedback, get_user_feedback_history
from crud.interviews.interviews import get_interview

router = APIRouter()
auth = Authorization()

@router.get("/{attempt_id}")
@error_decorator
async def get_interview_feedback(
    req: Request,
    attempt_id: str,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Get feedback for a specific interview attempt"""
    # Get the feedback
    feedback = await get_attempt_feedback(req, attempt_id)
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Verify ownership by checking the attempt's interview
    from crud.interviews.attempts import get_attempt
    attempt = await get_attempt(req, attempt_id)
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    interview = await get_interview(req, attempt.interview_id)
    
    if not interview or interview.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(feedback.model_dump())
    )

@router.get("/")
@error_decorator
async def get_user_feedback_history_endpoint(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper),
    limit: int = 10
):
    """Get feedback history for the current user"""
    history = await get_user_feedback_history(req, user_id, limit)
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(history)
    )

@router.get("/stats/{user_id}")
@error_decorator
async def get_user_interview_stats(
    req: Request,
    target_user_id: str,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Get interview statistics for a user"""
    # Only allow users to see their own stats
    if target_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    history = await get_user_feedback_history(req, user_id, limit=100)
    
    if not history:
        return JSONResponse(
            status_code=200,
            content={
                "total_interviews": 0,
                "average_score": 0,
                "improvement_trend": [],
                "top_strengths": [],
                "common_weaknesses": []
            }
        )
    
    # Calculate statistics
    scores = [item["feedback"].overall_score for item in history]
    
    # Count strengths and weaknesses
    all_strengths = []
    all_weaknesses = []
    
    for item in history:
        all_strengths.extend(item["feedback"].strengths)
        all_weaknesses.extend(item["feedback"].improvement_areas)
    
    # Count frequency
    strength_counts = {}
    weakness_counts = {}
    
    for strength in all_strengths:
        strength_counts[strength] = strength_counts.get(strength, 0) + 1
    
    for weakness in all_weaknesses:
        weakness_counts[weakness] = weakness_counts.get(weakness, 0) + 1
    
    # Get top items
    top_strengths = sorted(strength_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    common_weaknesses = sorted(weakness_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    stats = {
        "total_interviews": len(history),
        "average_score": sum(scores) / len(scores) if scores else 0,
        "latest_score": scores[0] if scores else 0,
        "improvement_trend": scores[-10:] if len(scores) >= 10 else scores,  # Last 10 scores
        "top_strengths": [{"skill": k, "count": v} for k, v in top_strengths],
        "common_weaknesses": [{"area": k, "count": v} for k, v in common_weaknesses],
        "score_distribution": {
            "excellent": len([s for s in scores if s >= 90]),
            "good": len([s for s in scores if 80 <= s < 90]),
            "fair": len([s for s in scores if 70 <= s < 80]),
            "needs_improvement": len([s for s in scores if s < 70])
        }
    }
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(stats)
    )