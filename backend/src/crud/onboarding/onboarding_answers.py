from typing import Optional
from fastapi import Request, HTTPException

from models.onboarding import OnboardingAnswers
from crud._generic._db_actions import (
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument
)


async def create_onboarding_answers(
    req: Request,
    user_id: str,
    industry: str,
    has_failed: bool,
    preparation_rating: int,
    communication_rating: int,
    nerves_rating: int
) -> OnboardingAnswers:
    """
    Create or update onboarding answers for a user.
    Only one set of onboarding answers should exist per user.
    """
    # Check if answers already exist for this user
    existing = await getDocument(
        req=req,
        collection_name="user_onboarding_answers",
        BaseModel=OnboardingAnswers,
        user_id=user_id
    )
    
    if existing:
        # Update existing answers
        updated_answers = await updateDocument(
            req=req,
            collection_name="user_onboarding_answers",
            BaseModel=OnboardingAnswers,
            document_id=existing.id,
            industry=industry,
            has_failed=has_failed,
            preparation_rating=preparation_rating,
            communication_rating=communication_rating,
            nerves_rating=nerves_rating
        )
        return updated_answers
    else:
        # Create new answers
        new_answers = OnboardingAnswers(
            user_id=user_id,
            industry=industry,
            has_failed=has_failed,
            preparation_rating=preparation_rating,
            communication_rating=communication_rating,
            nerves_rating=nerves_rating
        )
        
        created_answers = await createDocument(
            req=req,
            collection_name="user_onboarding_answers",
            BaseModel=OnboardingAnswers,
            new_document=new_answers
        )
        
        return created_answers


async def get_onboarding_answers_by_user_id(
    req: Request,
    user_id: str
) -> Optional[OnboardingAnswers]:
    """
    Get onboarding answers for a specific user.
    """
    answers = await getDocument(
        req=req,
        collection_name="user_onboarding_answers",
        BaseModel=OnboardingAnswers,
        user_id=user_id
    )
    
    return answers


async def delete_onboarding_answers(
    req: Request,
    user_id: str
) -> bool:
    """
    Delete onboarding answers for a user.
    Returns True if deleted, False if not found.
    """
    try:
        deleted_document = await deleteDocument(
            req=req,
            collection_name="user_onboarding_answers",
            BaseModel=OnboardingAnswers,
            user_id=user_id
        )
        return True if deleted_document else False
    except Exception:
        # Document not found
        return False