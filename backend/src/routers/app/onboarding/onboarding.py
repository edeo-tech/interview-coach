from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field

from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator
from crud.onboarding import (
    create_onboarding_answers,
    get_onboarding_answers_by_user_id,
    delete_onboarding_answers
)

router = APIRouter()
auth = Authorization()


class OnboardingAnswersSubmission(BaseModel):
    industry: str = Field(..., description='The industry the user is interested in')
    has_failed: bool = Field(..., description='Whether the user has failed interviews before')
    preparation_rating: int = Field(..., ge=1, le=5, description='Self-assessment of preparation skills (1-5)')
    communication_rating: int = Field(..., ge=1, le=5, description='Self-assessment of communication skills (1-5)')
    nerves_rating: int = Field(..., ge=1, le=5, description='Self-assessment of nervousness level (1-5)')


@router.post("/submit")
@error_decorator
async def submit_onboarding_answers(
    req: Request,
    submission: OnboardingAnswersSubmission,
    user_id: str = Depends(auth.auth_wrapper)
):
    print("HERE")
    print(submission)
    """Submit or update onboarding answers for the authenticated user"""
    
    # Validate ratings are within range
    for rating_field in ['preparation_rating', 'communication_rating', 'nerves_rating']:
        rating_value = getattr(submission, rating_field)
        if not 1 <= rating_value <= 5:
            raise HTTPException(
                status_code=400,
                detail=f"{rating_field} must be between 1 and 5"
            )
    
    # Create or update onboarding answers
    answers = await create_onboarding_answers(
        req=req,
        user_id=user_id,
        industry=submission.industry,
        has_failed=submission.has_failed,
        preparation_rating=submission.preparation_rating,
        communication_rating=submission.communication_rating,
        nerves_rating=submission.nerves_rating
    )
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "Onboarding answers submitted successfully",
            "data": jsonable_encoder(answers)
        }
    )


@router.get("/answers")
@error_decorator
async def get_onboarding_answers(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Get onboarding answers for the authenticated user"""
    
    answers = await get_onboarding_answers_by_user_id(
        req=req,
        user_id=user_id
    )
    
    if not answers:
        raise HTTPException(
            status_code=404,
            detail="No onboarding answers found for this user"
        )
    
    return JSONResponse(
        status_code=200,
        content={
            "data": jsonable_encoder(answers)
        }
    )


@router.delete("/answers")
@error_decorator
async def delete_user_onboarding_answers(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Delete onboarding answers for the authenticated user"""
    
    deleted = await delete_onboarding_answers(
        req=req,
        user_id=user_id
    )
    
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="No onboarding answers found to delete"
        )
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "Onboarding answers deleted successfully"
        }
    )