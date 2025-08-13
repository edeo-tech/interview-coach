from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from decouple import config
import stripe
import logging
from datetime import datetime, timezone

# Configure Stripe
STRIPE_API_KEY = config("STRIPE_API_KEY", default="", cast=str)
STRIPE_WEBHOOK_SECRET = config("STRIPE_WEBHOOK_SECRET", default="", cast=str)

if STRIPE_API_KEY:
    stripe.api_key = STRIPE_API_KEY

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post('/stripe')
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events for subscription management.
    """
    
    if not STRIPE_WEBHOOK_SECRET:
        logger.error("Stripe webhook secret not configured")
        raise HTTPException(status_code=500, detail="Webhook not configured")

    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    try:
        if event['type'] == 'checkout.session.completed':
            await handle_checkout_session_completed(event['data']['object'], request)
        elif event['type'] == 'customer.subscription.created':
            await handle_subscription_created(event['data']['object'], request)
        elif event['type'] == 'customer.subscription.updated':
            await handle_subscription_updated(event['data']['object'], request)
        elif event['type'] == 'customer.subscription.deleted':
            await handle_subscription_deleted(event['data']['object'], request)
        elif event['type'] == 'invoice.payment_succeeded':
            await handle_payment_succeeded(event['data']['object'], request)
        elif event['type'] == 'invoice.payment_failed':
            await handle_payment_failed(event['data']['object'], request)
        else:
            logger.info(f"Unhandled event type: {event['type']}")
    except Exception as e:
        logger.error(f"Error processing webhook event {event['type']}: {e}")
        raise HTTPException(status_code=500, detail="Error processing webhook")

    return JSONResponse(content={"status": "success"})

async def handle_checkout_session_completed(session, request: Request):
    """
    Handle completed checkout session - provides 100% reliable user identification
    This is the primary method for linking payments to users
    """
    session_id = session['id']
    customer_id = session.get('customer')
    client_reference_id = session.get('client_reference_id')  # This is our user_id
    subscription_id = session.get('subscription')

    logger.info(f"Checkout session completed: {session_id}")
    logger.info(f"Customer: {customer_id}, User ID: {client_reference_id}, Subscription: {subscription_id}")

    # Primary identification method: client_reference_id (our user_id)
    if client_reference_id:
        try:
            # Find user by our internal user_id
            user = await request.app.mongodb.users.find_one({"_id": client_reference_id})

            if user:
                # Update user with premium status and Stripe IDs
                update_data = {
                    "is_premium": True,
                    "stripe_customer_id": customer_id or user.get("stripe_customer_id", ""),
                    "stripe_subscription_id": subscription_id or ""
                }

                await request.app.mongodb.users.update_one(
                    {"_id": client_reference_id},
                    {"$set": update_data}
                )

                logger.info(f"Successfully activated premium for user {client_reference_id} via checkout session")
                return
            else:
                logger.error(f"User not found with ID {client_reference_id} from checkout session")

        except Exception as e:
            logger.error(f"Error processing checkout session with client_reference_id {client_reference_id}: {e}")

    # Fallback identification method: customer_id
    if customer_id:
        try:
            user = await request.app.mongodb.users.find_one({"stripe_customer_id": customer_id})

            if user:
                update_data = {
                    "is_premium": True,
                    "stripe_subscription_id": subscription_id or ""
                }

                await request.app.mongodb.users.update_one(
                    {"stripe_customer_id": customer_id},
                    {"$set": update_data}
                )

                logger.info(f"Successfully activated premium for customer {customer_id} via checkout session (fallback method)")
                return
        except Exception as e:
            logger.error(f"Error processing checkout session with customer_id {customer_id}: {e}")

    logger.error(f"Could not identify user for checkout session {session_id}")

async def handle_subscription_created(subscription, request: Request):
    """Handle when a subscription is created"""
    customer_id = subscription['customer']
    subscription_id = subscription['id']
    status = subscription['status']

    logger.info(f"Subscription created: {subscription_id} for customer {customer_id}, status: {status}")

    # Update user premium status based on subscription status
    is_premium = status in ['active', 'trialing']

    try:
        result = await request.app.mongodb.users.update_one(
            {"stripe_customer_id": customer_id},
            {
                "$set": {
                    "is_premium": is_premium,
                    "stripe_subscription_id": subscription_id if is_premium else ""
                }
            }
        )
        
        if result.matched_count > 0:
            logger.info(f"Updated premium status for customer {customer_id}: is_premium={is_premium}")
        else:
            logger.warning(f"No user found with stripe_customer_id {customer_id}")
            
    except Exception as e:
        logger.error(f"Error updating user for subscription created: {e}")

async def handle_subscription_updated(subscription, request: Request):
    """Handle when a subscription is updated"""
    customer_id = subscription['customer']
    subscription_id = subscription['id']
    status = subscription['status']

    logger.info(f"Subscription updated: {subscription_id} for customer {customer_id}, status: {status}")

    # Update user premium status based on subscription status
    is_premium = status in ['active', 'trialing']

    try:
        result = await request.app.mongodb.users.update_one(
            {"stripe_customer_id": customer_id},
            {
                "$set": {
                    "is_premium": is_premium,
                    "stripe_subscription_id": subscription_id if is_premium else ""
                }
            }
        )
        
        if result.matched_count > 0:
            logger.info(f"Updated premium status for customer {customer_id}: is_premium={is_premium}")
        else:
            logger.warning(f"No user found with stripe_customer_id {customer_id}")
            
    except Exception as e:
        logger.error(f"Error updating user for subscription updated: {e}")

async def handle_subscription_deleted(subscription, request: Request):
    """Handle when a subscription is deleted/cancelled"""
    customer_id = subscription['customer']
    subscription_id = subscription['id']

    logger.info(f"Subscription deleted: {subscription_id} for customer {customer_id}")

    try:
        # Deactivate premium status
        result = await request.app.mongodb.users.update_one(
            {"stripe_customer_id": customer_id},
            {
                "$set": {
                    "is_premium": False,
                    "stripe_subscription_id": ""
                }
            }
        )
        
        if result.matched_count > 0:
            logger.info(f"Deactivated premium for customer {customer_id}")
        else:
            logger.warning(f"No user found with stripe_customer_id {customer_id}")
            
    except Exception as e:
        logger.error(f"Error updating user for subscription deleted: {e}")

async def handle_payment_succeeded(invoice, request: Request):
    """Handle successful payment"""
    customer_id = invoice['customer']
    subscription_id = invoice.get('subscription')
    
    logger.info(f"Payment succeeded for customer {customer_id}, subscription: {subscription_id}")
    
    # Ensure user is marked as premium (in case webhook order was wrong)
    try:
        result = await request.app.mongodb.users.update_one(
            {"stripe_customer_id": customer_id},
            {
                "$set": {
                    "is_premium": True,
                    "stripe_subscription_id": subscription_id or ""
                }
            }
        )
        
        if result.matched_count > 0:
            logger.info(f"Confirmed premium status for customer {customer_id}")
        else:
            logger.warning(f"No user found with stripe_customer_id {customer_id}")
            
    except Exception as e:
        logger.error(f"Error updating user for payment succeeded: {e}")

async def handle_payment_failed(invoice, request: Request):
    """Handle failed payment"""
    customer_id = invoice['customer']
    subscription_id = invoice.get('subscription')
    
    logger.warning(f"Payment failed for customer {customer_id}, subscription: {subscription_id}")
    
    # Note: We don't immediately deactivate premium on payment failure
    # Stripe typically retries payments and has dunning management
    # We only deactivate when subscription is actually cancelled