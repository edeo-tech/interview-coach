from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel, Field
import logging

from models.users.users import User
from crud._generic import _db_actions
from crud.users.auth.users import get_user_by_id
from utils.referral_codes import validate_referral_code, normalize_referral_code
from authentication import Authorization

router = APIRouter()
auth = Authorization()
logger = logging.getLogger(__name__)

class ReferralSubmission(BaseModel):
    referral_code: str = Field(..., description="The referral code to submit")

class ReferralResponse(BaseModel):
    success: bool = Field(..., description="Whether the referral was successful")
    message: str = Field(..., description="Response message")
    referrer_name: str = Field(default="", description="Name of the user who referred you")

@router.post("/submit-referral", response_model=ReferralResponse)
async def submit_referral_code(
    req: Request,
    submission: ReferralSubmission,
    user_id: str = Depends(auth.auth_wrapper)
):
    """
    Submit a referral code during onboarding.
    Awards +1 free_calls_remaining to the referrer.
    Records the referrer in the current user's referred_by field.
    """
    
    # Normalize and validate the referral code
    normalized_code = normalize_referral_code(submission.referral_code)
    
    if not validate_referral_code(normalized_code):
        raise HTTPException(
            status_code=400, 
            detail="Invalid referral code format. Must be 4 characters (letters and numbers only)."
        )
    
    # Get current user
    current_user = await get_user_by_id(req, user_id)
    if not current_user:
        raise HTTPException(status_code=404, detail="Current user not found")
    
    # Prevent self-referral
    if current_user.referral_code == normalized_code:
        raise HTTPException(
            status_code=400, 
            detail="You cannot use your own referral code"
        )
    
    # Check if user already used a referral code
    if current_user.referred_by:
        raise HTTPException(
            status_code=400, 
            detail="You have already used a referral code"
        )
    
    # Find the referrer by their referral code
    referrer = await _db_actions.getDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        referral_code=normalized_code
    )
    
    if not referrer:
        raise HTTPException(
            status_code=404, 
            detail="Referral code not found"
        )
    
    try:
        # Award +1 free call to the referrer
        await _db_actions.incrementDocumentField(
            req=req,
            collection_name='users',
            BaseModel=User,
            document_id=referrer.id,
            field_name='free_calls_remaining',
            increment_by=1
        )
        
        # Update current user with referrer information
        await _db_actions.updateDocument(
            req=req,
            collection_name='users',
            BaseModel=User,
            document_id=current_user.id,
            referred_by=normalized_code
        )
        
        logger.info(f"User {user_id} used referral code {normalized_code} from {referrer.id}")
        
        return ReferralResponse(
            success=True,
            message=f"Referral successful! {referrer.name} has been awarded a free interview.",
            referrer_name=referrer.name
        )
        
    except Exception as e:
        logger.error(f"Error processing referral code {normalized_code}: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to process referral code. Please try again."
        )