from fastapi import APIRouter, Depends, Request, HTTPException
from typing import List
import logging

from models.users.users import User
from crud._generic import _db_actions
from utils.referral_codes import generate_unique_referral_code
from authentication import Authorization

router = APIRouter()
auth = Authorization()
logger = logging.getLogger(__name__)

@router.post("/generate-referral-codes")
async def generate_referral_codes_for_existing_users(
    req: Request,
    # user_id: str = Depends(auth.auth_wrapper)
):
    """
    Generate referral codes for all existing users who don't have one.
    Internal route for migration purposes.
    """
    
    # Get all users without referral codes
    users_without_codes = await req.app.mongodb['users'].find({
        "$or": [
            {"referral_code": ""},
            {"referral_code": {"$exists": False}}
        ]
    }).to_list(length=None)
    
    if not users_without_codes:
        return {
            "message": "All users already have referral codes",
            "users_updated": 0
        }
    
    updated_count = 0
    failed_count = 0
    
    for user_doc in users_without_codes:
        try:
            # Generate unique referral code
            referral_code = await generate_unique_referral_code(req)
            
            if referral_code:
                # Update user with referral code
                await req.app.mongodb['users'].update_one(
                    {"_id": user_doc["_id"]},
                    {"$set": {"referral_code": referral_code}}
                )
                updated_count += 1
                logger.info(f"Generated referral code {referral_code} for user {user_doc['_id']}")
            else:
                failed_count += 1
                logger.error(f"Failed to generate referral code for user {user_doc['_id']}")
                
        except Exception as e:
            failed_count += 1
            logger.error(f"Error updating user {user_doc['_id']}: {e}")
    
    return {
        "message": f"Referral code generation complete",
        "users_updated": updated_count,
        "users_failed": failed_count,
        "total_users_processed": len(users_without_codes)
    }