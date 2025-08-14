from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional

from crud._generic import _db_actions
from models.interviews.attempts import InterviewFeedback
from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator

router = APIRouter()
auth = Authorization()

class UserStatsResponse(BaseModel):
    average_score: Optional[float] = None
    total_attempts: int = 0

@router.get('/average-score', response_description='Get user average interview score')
@error_decorator
async def get_user_average_score(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper)
) -> JSONResponse:
    # Get all interview feedbacks for this user
    # We need to find feedbacks where the attempt belongs to an interview created by this user
    
    # First, get all interviews for this user
    user_interviews = await _db_actions.getDocuments(
        req=req,
        collection_name='interviews',
        user_id=user_id
    )
    
    if not user_interviews:
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(UserStatsResponse(average_score=None, total_attempts=0))
        )
    
    # Get all interview IDs for this user
    interview_ids = [interview.id for interview in user_interviews]
    
    # Get all attempts for these interviews
    all_attempts = []
    for interview_id in interview_ids:
        attempts = await _db_actions.getDocuments(
            req=req,
            collection_name='interview_attempts',
            interview_id=interview_id
        )
        if attempts:
            all_attempts.extend(attempts)
    
    if not all_attempts:
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(UserStatsResponse(average_score=None, total_attempts=0))
        )
    
    # Get feedbacks for all these attempts
    attempt_ids = [attempt.id for attempt in all_attempts]
    all_feedbacks = []
    
    for attempt_id in attempt_ids:
        feedbacks = await _db_actions.getDocuments(
            req=req,
            collection_name='interview_feedback',
            attempt_id=attempt_id
        )
        if feedbacks:
            all_feedbacks.extend(feedbacks)
    
    if not all_feedbacks:
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(UserStatsResponse(average_score=None, total_attempts=len(all_attempts)))
        )
    
    # Calculate average score
    total_score = sum(feedback.overall_score for feedback in all_feedbacks)
    average_score = total_score / len(all_feedbacks)
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(UserStatsResponse(
            average_score=round(average_score, 1),
            total_attempts=len(all_attempts)
        ))
    )