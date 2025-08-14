from fastapi import Request, HTTPException
from fastapi.encoders import jsonable_encoder
from datetime import datetime, timezone, date
from decouple import config
import stripe
import logging

from models.users.users import User, UpdateUserProfile, SubscriptionDetails
from models.users.authenticated_user import AuthenticatedUser
from crud._generic import _db_actions

from authentication import Authorization

# Configure Stripe
STRIPE_API_KEY = config("STRIPE_API_KEY", default="", cast=str)
if STRIPE_API_KEY:
    stripe.api_key = STRIPE_API_KEY

logger = logging.getLogger(__name__)

# from utils.qr_codes.profiles.generate import generateQRCode

auth = Authorization()


async def create_user(req:Request, user:User):
    ## check that email is not already taken
    if await check_if_email_is_taken(req, user.email):
        raise HTTPException(status_code=400, detail='Email already exists')

    ## create user
    user = await _db_actions.createDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        new_document=user
    )

    ## create Stripe customer for reliable payment identification
    stripe_customer_id = ""
    if STRIPE_API_KEY:
        try:
            stripe_customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={
                    "user_id": str(user.id),
                    "username": user.name
                }
            )
            stripe_customer_id = stripe_customer.id
            logger.info(f"Created Stripe customer {stripe_customer_id} for user {user.id}")

            # Update user with Stripe customer ID
            await _db_actions.updateDocument(
                req=req,
                collection_name='users',
                BaseModel=User,
                document_id=user.id,
                stripe_customer_id=stripe_customer_id
            )
        except Exception as e:
            logger.error(f"Failed to create Stripe customer for user {user.id}: {e}")
            # Don't fail user registration if Stripe customer creation fails

    return user


def calculate_streak_update(current_streak: int, streak_record: int, last_login: datetime = None) -> dict:
    """Calculate new streak values based on last login date"""
    today = date.today()
    now_utc = datetime.now(timezone.utc)
    
    # If no previous login date, this is first login
    if last_login is None:
        return {
            'streak': 1,
            'streak_record': max(1, streak_record),
            'last_login': now_utc
        }
    
    # Convert last login to date for comparison
    last_login_local_date = last_login.date()
    
    # If logged in today already, no change
    if last_login_local_date == today:
        return {
            'last_login': now_utc  # Update time but keep streak same
        }
    
    # If logged in yesterday, increment streak
    elif last_login_local_date == date.fromordinal(today.toordinal() - 1):
        new_streak = current_streak + 1
        new_record = max(new_streak, streak_record)
        return {
            'streak': new_streak,
            'streak_record': new_record,
            'last_login': now_utc
        }
    
    # If logged in before yesterday, reset streak to 1
    else:
        return {
            'streak': 1,
            'streak_record': max(1, streak_record),
            'last_login': now_utc
        }

async def update_user_last_active_at(req:Request, user_id:str):
    # Get current user to calculate streak
    user:User = await get_user_by_id(req, user_id)
    if not user:
        return
    
    # Calculate streak updates
    streak_updates = calculate_streak_update(
        current_streak=user.streak,
        streak_record=user.streak_record,
        last_login=user.last_login
    )
    
    # Update user with new streak values and last login
    await _db_actions.updateDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        document_id=user_id,
        last_login=datetime.now(timezone.utc),
        **streak_updates
    )

async def handle_login(req:Request, user:User):
    await update_user_last_active_at(req, user.id)

    access_token = auth.encode_short_lived_token(user.id)
    refresh_token = await auth.encode_refresh_token(req, user.id)
    
    # Convert user to dict, excluding sensitive fields
    user_dict = user.model_dump(
        exclude={'password', 'expo_notification_token', 'device_os', 'stripe_customer_id', 'stripe_subscription_id'},
        exclude_none=True,
        by_alias=False
    )
    
    # Create AuthenticatedUser instance
    authenticated_user = AuthenticatedUser(**user_dict)
    user_important_info = authenticated_user.model_dump(
        exclude_none=True,
        by_alias=False
    )

    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_important_info
    }


async def check_if_email_is_taken(req:Request, email:str):
    user = await _db_actions.getDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        email=email
    )
    return user is not None

async def get_user_by_id(req:Request, user_id:str):
    user = await _db_actions.getDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        _id=user_id
    )
    return user

async def update_user_profile(req:Request, user_id:str, profile_data:UpdateUserProfile):
    """Update user profile information (name, email)"""
    update_fields = {}
    
    if profile_data.name is not None:
        update_fields['name'] = profile_data.name
        
    if profile_data.email is not None:
        # Check if new email is already taken
        if await check_if_email_is_taken(req, profile_data.email):
            raise HTTPException(status_code=400, detail='Email already exists')
        update_fields['email'] = profile_data.email
    
    if not update_fields:
        raise HTTPException(status_code=400, detail='No fields to update')
    
    # Update user document
    updated_user = await _db_actions.updateDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        document_id=user_id,
        **update_fields
    )
    
    # Update Stripe customer if email or name changed and we have a customer ID
    if STRIPE_API_KEY and updated_user and updated_user.stripe_customer_id:
        try:
            stripe_update_data = {}
            if profile_data.email:
                stripe_update_data['email'] = profile_data.email
            if profile_data.name:
                stripe_update_data['name'] = profile_data.name
                
            if stripe_update_data:
                stripe.Customer.modify(
                    updated_user.stripe_customer_id,
                    **stripe_update_data
                )
                logger.info(f"Updated Stripe customer {updated_user.stripe_customer_id} for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to update Stripe customer for user {user_id}: {e}")
            # Don't fail the request if Stripe update fails
    
    return updated_user

async def delete_user_account(req:Request, user_id:str):
    """Delete user account and all associated data"""
    user = await get_user_by_id(req, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    try:
        # Cancel Stripe subscription if exists
        if STRIPE_API_KEY and user.stripe_subscription_id:
            try:
                stripe.Subscription.cancel(user.stripe_subscription_id)
                logger.info(f"Cancelled Stripe subscription {user.stripe_subscription_id} for user {user_id}")
            except Exception as e:
                logger.error(f"Failed to cancel Stripe subscription for user {user_id}: {e}")
        
        # Delete user interviews and related data
        await _db_actions.deleteDocuments(
            req=req,
            collection_name='interviews',
            user_id=user_id
        )
        
        # Delete user CV profiles
        await _db_actions.deleteDocuments(
            req=req,
            collection_name='cv_profiles',
            user_id=user_id
        )
        
        # Delete user interview attempts
        await _db_actions.deleteDocuments(
            req=req,
            collection_name='interview_attempts',
            user_id=user_id
        )
        
        # Finally delete the user
        await _db_actions.deleteDocument(
            req=req,
            collection_name='users',
            BaseModel=User,
            document_id=user_id
        )
        
        logger.info(f"Successfully deleted user account {user_id} and all associated data")
        return True
        
    except Exception as e:
        logger.error(f"Failed to delete user account {user_id}: {e}")
        raise HTTPException(status_code=500, detail='Failed to delete account')

async def get_subscription_details(req:Request, user_id:str) -> SubscriptionDetails:
    """Get user subscription details from Stripe"""
    user = await get_user_by_id(req, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Default response for users without premium
    subscription_details = SubscriptionDetails(
        is_premium=user.is_premium,
        plan_name="Free Plan",
        status="free",
        current_period_end=None,
        stripe_portal_url=None
    )
    
    # If user has Stripe customer ID, get detailed subscription info
    if STRIPE_API_KEY and user.stripe_customer_id:
        try:
            # Create customer portal session
            portal_session = stripe.billing_portal.Session.create(
                customer=user.stripe_customer_id,
                return_url=config("FRONTEND_URL", default="https://interviewguideai.cc", cast=str)
            )
            subscription_details.stripe_portal_url = portal_session.url
            
            # Get subscription details if user has active subscription
            if user.stripe_subscription_id:
                subscription = stripe.Subscription.retrieve(user.stripe_subscription_id)
                
                subscription_details.plan_name = "Premium Plan"
                subscription_details.status = subscription.status
                subscription_details.current_period_end = datetime.fromtimestamp(
                    subscription.current_period_end, 
                    tz=timezone.utc
                )
                
        except Exception as e:
            logger.error(f"Failed to get Stripe subscription details for user {user_id}: {e}")
            # Return basic details if Stripe fails
    
    return subscription_details
