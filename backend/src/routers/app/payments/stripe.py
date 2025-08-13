from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from decouple import config
import stripe
import logging

from authentication import Authorization
from crud._generic import _db_actions
from models.users.users import User
from utils.__errors__.error_decorator_routes import error_decorator

# Configure Stripe
STRIPE_API_KEY = config("STRIPE_API_KEY", default="", cast=str)
STRIPE_PRICE_ID = config("STRIPE_PRICE_ID", default="", cast=str)

if STRIPE_API_KEY:
    stripe.api_key = STRIPE_API_KEY

logger = logging.getLogger(__name__)
router = APIRouter()
auth = Authorization()

class CreateCheckoutSessionRequest(BaseModel):
    success_url: str
    cancel_url: str

@router.post('/create-checkout-session')
@error_decorator
async def create_checkout_session(
    request: Request,
    body: CreateCheckoutSessionRequest,
    user_id: str = Depends(auth.auth_wrapper)
):
    """
    Create a Stripe checkout session with proper user identification.
    This ensures 100% reliable user identification in webhooks.
    """
    
    if not STRIPE_API_KEY or not STRIPE_PRICE_ID:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        # Get user from database
        user = await _db_actions.getDocument(
            request,
            collection_name="users",
            BaseModel=User,
            _id=user_id
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Ensure user has a Stripe customer ID
        if not user.stripe_customer_id:
            # Create Stripe customer if missing (for existing users)
            stripe_customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={
                    "user_id": str(user.id),
                    "username": user.name
                }
            )

            # Update user with Stripe customer ID
            await _db_actions.updateDocument(
                request,
                collection_name="users",
                BaseModel=User,
                document_id=user_id,
                stripe_customer_id=stripe_customer.id
            )

            customer_id = stripe_customer.id
        else:
            customer_id = user.stripe_customer_id

        # Create checkout session with multiple identification methods
        session = stripe.checkout.Session.create(
            customer=customer_id,
            client_reference_id=str(user_id),  # Critical for webhook identification
            payment_method_types=["card"],
            line_items=[{
                "price": STRIPE_PRICE_ID,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=body.success_url,
            cancel_url=body.cancel_url,
            subscription_data={
                "metadata": {
                    "user_id": str(user_id),
                    "username": user.name,
                    "plan": "premium_monthly"
                }
            },
            metadata={
                "user_id": str(user_id),
                "username": user.name
            }
        )

        return JSONResponse(content={
            "checkout_url": session.url,
            "session_id": session.id
        })

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout session: {e}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.get('/customer-portal')
@error_decorator
async def create_customer_portal_session(
    request: Request,
    return_url: str,
    user_id: str = Depends(auth.auth_wrapper)
):
    """
    Create a Stripe customer portal session for subscription management.
    """
    
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
        
    try:
        # Get user from database
        user = await _db_actions.getDocument(
            request,
            collection_name="users",
            BaseModel=User,
            _id=user_id
        )

        if not user or not user.stripe_customer_id:
            raise HTTPException(status_code=404, detail="User not found or no Stripe customer")

        # Create customer portal session
        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url,
        )

        return JSONResponse(content={
            "portal_url": session.url
        })

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating portal session: {e}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating portal session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create portal session")