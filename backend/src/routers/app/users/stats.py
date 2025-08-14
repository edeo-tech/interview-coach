from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional
import logging

from crud._generic import _db_actions
from models.interviews.attempts import InterviewFeedback, InterviewAttempt
from models.interviews.interviews import Interview
from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator

logger = logging.getLogger(__name__)

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
    logger.info(f"[AVERAGE_SCORE] Starting calculation for user_id: {user_id}")
    
    # Get all interview feedbacks for this user
    # We need to find feedbacks where the attempt belongs to an interview created by this user
    
    # First, get all interviews for this user
    logger.info(f"[AVERAGE_SCORE] Step 1: Fetching interviews for user {user_id}")
    user_interviews = await _db_actions.getMultipleDocuments(
        req=req,
        collection_name='interviews',
        BaseModel=Interview,
        user_id=user_id
    )
    
    logger.info(f"[AVERAGE_SCORE] Found {len(user_interviews) if user_interviews else 0} interviews")
    if user_interviews:
        for i, interview in enumerate(user_interviews):
            logger.info(f"[AVERAGE_SCORE] Interview {i+1}: id={interview.id}, role={getattr(interview, 'role_title', 'N/A')}")
    
    if not user_interviews:
        logger.info("[AVERAGE_SCORE] No interviews found - returning N/A")
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(UserStatsResponse(average_score=None, total_attempts=0))
        )
    
    # Get all interview IDs for this user
    interview_ids = [interview.id for interview in user_interviews]
    logger.info(f"[AVERAGE_SCORE] Step 2: Looking for attempts in interview_ids: {interview_ids}")
    
    # Get all attempts for these interviews
    all_attempts = []
    for interview_id in interview_ids:
        logger.info(f"[AVERAGE_SCORE] Fetching attempts for interview {interview_id}")
        attempts = await _db_actions.getMultipleDocuments(
            req=req,
            collection_name='interview_attempts',
            BaseModel=InterviewAttempt,
            interview_id=interview_id
        )
        logger.info(f"[AVERAGE_SCORE] Found {len(attempts) if attempts else 0} attempts for interview {interview_id}")
        if attempts:
            for j, attempt in enumerate(attempts):
                logger.info(f"[AVERAGE_SCORE] Attempt {j+1}: id={attempt.id}, status={getattr(attempt, 'status', 'N/A')}")
            all_attempts.extend(attempts)
    
    logger.info(f"[AVERAGE_SCORE] Total attempts found: {len(all_attempts)}")
    
    if not all_attempts:
        logger.info("[AVERAGE_SCORE] No attempts found - returning N/A")
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(UserStatsResponse(average_score=None, total_attempts=0))
        )
    
    # Get feedbacks for all these attempts
    attempt_ids = [attempt.id for attempt in all_attempts]
    logger.info(f"[AVERAGE_SCORE] Step 3: Looking for feedbacks for attempt_ids: {attempt_ids}")
    all_feedbacks = []
    
    for attempt_id in attempt_ids:
        logger.info(f"[AVERAGE_SCORE] Fetching feedbacks for attempt {attempt_id}")
        feedbacks = await _db_actions.getMultipleDocuments(
            req=req,
            collection_name='interview_feedback',
            BaseModel=InterviewFeedback,
            attempt_id=attempt_id
        )
        logger.info(f"[AVERAGE_SCORE] Found {len(feedbacks) if feedbacks else 0} feedbacks for attempt {attempt_id}")
        if feedbacks:
            for k, feedback in enumerate(feedbacks):
                logger.info(f"[AVERAGE_SCORE] Feedback {k+1}: id={feedback.id}, overall_score={getattr(feedback, 'overall_score', 'N/A')}")
            all_feedbacks.extend(feedbacks)
    
    logger.info(f"[AVERAGE_SCORE] Total feedbacks found: {len(all_feedbacks)}")
    
    if not all_feedbacks:
        logger.warning(f"[AVERAGE_SCORE] No feedbacks found for {len(all_attempts)} attempts - returning N/A")
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(UserStatsResponse(average_score=None, total_attempts=len(all_attempts)))
        )
    
    # Calculate average score
    scores = [feedback.overall_score for feedback in all_feedbacks]
    logger.info(f"[AVERAGE_SCORE] Individual scores: {scores}")
    total_score = sum(scores)
    average_score = total_score / len(all_feedbacks)
    
    logger.info(f"[AVERAGE_SCORE] Calculation: {total_score} / {len(all_feedbacks)} = {average_score}")
    
    final_result = UserStatsResponse(
        average_score=round(average_score, 1),
        total_attempts=len(all_attempts)
    )
    
    logger.info(f"[AVERAGE_SCORE] Final result: {final_result}")
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(final_result)
    )