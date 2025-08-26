from fastapi import Request, HTTPException, APIRouter, Depends, status
from fastapi.responses import JSONResponse, Response
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field

from models.users.users import User, LoginUser, UpdateUserProfile, SignUpType
from crud.users.auth.users import (
    create_user,
    handle_login,
    update_user_last_active_at,
    get_user_by_id,
    update_user_profile,
    delete_user_account,
    get_subscription_details,
    check_if_email_is_taken,
    get_user_by_email
)
from crud._generic import _db_actions
from models.users.authenticated_user import AuthenticatedUser
from utils.__errors__.error_decorator_routes import error_decorator
from authentication import Authorization

router = APIRouter()
auth = Authorization()

@router.post('/register')
@error_decorator
async def register(req:Request, user:User):
    user.password = auth.hash_password(user.password)
    return await create_user(req, user)


@router.post('/login')
@error_decorator
async def login(req:Request, login_user:LoginUser):
    user: User | None = await _db_actions.getDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        email=login_user.email
    )

    if user is None:
        raise HTTPException(status_code=401, detail='Invalid email or password')

    if not auth.verify_password(login_user.password, user.password):
        raise HTTPException(status_code=401, detail='Invalid email or password')

    authenticated_user_and_tokens = await handle_login(req, user)

    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(
            {
                'user': authenticated_user_and_tokens['user'],
                'tokens': {
                    'access_token': authenticated_user_and_tokens['access_token'],
                    'refresh_token': authenticated_user_and_tokens['refresh_token']
                }
            }
        )
    )

async def handle_third_party_login(
        req:Request,
        third_party:SignUpType,
        payload:dict,
        device_os:str
    ) -> JSONResponse:

    print(f"🔑 GOOGLE/APPLE LOGIN: Starting third party login for email: {payload.get('email')}")
    print(f"🔑 GOOGLE/APPLE LOGIN: Payload: {payload}")
    print(f"🔑 GOOGLE/APPLE LOGIN: Device OS: {device_os}")

    # Check if email provided is already linked to an existing account log in
    if (await check_if_email_is_taken(req, payload['email'])):
        print(f"🔑 GOOGLE/APPLE LOGIN: Email {payload['email']} already exists - logging in existing user")
        user = await get_user_by_email(req, payload['email'])
        await update_user_last_active_at(req, user.id)

        encoded_user = user.model_dump(by_alias=False, exclude_none=True)

        encoded_user = jsonable_encoder(
            AuthenticatedUser(**encoded_user),
            by_alias=False,
            exclude_none=True,
        )

        access_token = auth.encode_short_lived_token(user.id)
        refresh_token = await auth.encode_refresh_token(req, user.id)

        response_data = {
            'user': encoded_user,
            'tokens': {
                'access_token': access_token,
                'refresh_token': refresh_token
            },
            'sign_up': False
        }
        
        print(f"🔑 GOOGLE/APPLE LOGIN: Existing user login successful - Response structure: {list(response_data.keys())}")
        print(f"🔑 GOOGLE/APPLE LOGIN: User ID: {user.id}")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=jsonable_encoder(response_data)
        )
    
    # Otherwise create a new account for the user's information provided
    print(f"🔑 GOOGLE/APPLE LOGIN: Email {payload['email']} not found - creating new user")
    new_user = User(
        name=payload.get('name', payload['email'].split('@')[0]),
        email=payload['email'],
        password='',
        sign_up_type=third_party,
        device_os=device_os
    )

    print(f"🔑 GOOGLE/APPLE LOGIN: Creating user with data: {new_user.model_dump(exclude={'password'})}")
    created_user = await create_user(req, new_user)
    print(f"🔑 GOOGLE/APPLE LOGIN: User created successfully with ID: {created_user.id}")

    access_token = auth.encode_short_lived_token(created_user.id)
    refresh_token = await auth.encode_refresh_token(req, created_user.id)

    # Ensure created_user has the same structure as the existing user response
    # Convert to AuthenticatedUser with catches count (same as existing user flow)
    user_data = created_user.model_dump(by_alias=False, exclude_none=True)

    # Create AuthenticatedUser object to match existing user response structure
    authenticated_user_data = jsonable_encoder(
        AuthenticatedUser(**user_data),
        by_alias=False,
        exclude_none=True,
    )

    response_data = {
        'user': authenticated_user_data,
        'tokens': {
            'access_token': access_token,
            'refresh_token': refresh_token
        },
        'sign_up': True
    }
    
    print(f"🔑 GOOGLE/APPLE LOGIN: New user creation successful - Response structure: {list(response_data.keys())}")
    print(f"🔑 GOOGLE/APPLE LOGIN: User data type: {type(authenticated_user_data)}")
    print(f"🔑 GOOGLE/APPLE LOGIN: User data keys: {list(authenticated_user_data.keys()) if isinstance(authenticated_user_data, dict) else 'Not a dict'}")
    print(f"🔑 GOOGLE/APPLE LOGIN: Catches count: {user_data.get('catches', 'N/A')}")

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=jsonable_encoder(response_data)
    )

class googleLoginBody(BaseModel):
    token:str = Field(...)
    device_os:str = Field(...)


@router.post('/login/google', response_description='Login a user with Google')
@error_decorator
async def login_google(req:Request, body:googleLoginBody) -> JSONResponse:

    idInfo = await auth.verify_google_signin_token(body.token)

    return await handle_third_party_login(
        req,
        SignUpType.GOOGLE,
        idInfo,
        body.device_os
    )
    
    
class appleLoginBody(BaseModel):
    user_token:str = Field(...)
    device_os:str = Field(...)

@router.post('/login/apple', response_description='Login a user with Apple')
@error_decorator
async def login_apple(req:Request, body:appleLoginBody) -> JSONResponse:
    user_token = body.user_token

    verified_payload = await auth.verify_apple_signin_token(user_token)
    
    return await handle_third_party_login(
        req, 
        SignUpType.APPLE, 
        verified_payload, 
        body.device_os
    )

@router.get('/me', response_description='Get the current user')
@error_decorator
async def checkAuth(
    req:Request, 
    user_id:str=Depends(auth.auth_wrapper)
) -> JSONResponse:
    user = await get_user_by_id(req, user_id)

    if user is None:
        print(f"WARNING: USER WITH ID {user_id} NOT FOUND")
        raise HTTPException(
            status_code=401,
            detail='Invalid details'
        )
    
    await update_user_last_active_at(req, user_id)

    print(f"USER: {user}")
    # Convert the User model to dict, excluding sensitive fields
    user_dict = user.model_dump(
        exclude={'password', 'expo_notification_token', 'device_os'},
        exclude_none=True
    )
    
    # Create AuthenticatedUser from the user data
    authenticated_user = AuthenticatedUser(**user_dict)
    current_user_dict = authenticated_user.model_dump(exclude_none=True)

    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(current_user_dict)
    )

@router.post('/logout', response_description='Logout a user')
@error_decorator
async def logout(
    req:Request,
    user_id:str=Depends(auth.auth_wrapper)
) -> JSONResponse:
    
    await auth.logout(req, user_id)
    return Response(status_code=204)

@router.patch('/profile', response_description='Update user profile')
@error_decorator
async def update_profile(
    req:Request,
    profile_data:UpdateUserProfile,
    user_id:str=Depends(auth.auth_wrapper)
) -> JSONResponse:
    updated_user = await update_user_profile(req, user_id, profile_data)
    
    if updated_user is None:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Return updated user data (excluding sensitive fields)
    user_dict = updated_user.model_dump(
        exclude={'password', 'expo_notification_token', 'device_os'}, # 'stripe_customer_id', 'stripe_subscription_id'},
        exclude_none=True
    )
    
    authenticated_user = AuthenticatedUser(**user_dict)
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(authenticated_user.model_dump(exclude_none=True))
    )

@router.delete('/account', response_description='Delete user account')
@error_decorator
async def delete_account(
    req:Request,
    user_id:str=Depends(auth.auth_wrapper)
) -> JSONResponse:
    success = await delete_user_account(req, user_id)
    
    if success:
        return JSONResponse(
            status_code=200,
            content={"message": "Account successfully deleted"}
        )
    else:
        raise HTTPException(status_code=500, detail='Failed to delete account')

class UpdatePushTokenBody(BaseModel):
    expo_push_token: str = Field(..., description='The Expo push token for notifications')

@router.patch('/push-token', response_description='Update user push notification token')
@error_decorator
async def update_push_token(
    req: Request,
    body: UpdatePushTokenBody,
    user_id: str = Depends(auth.auth_wrapper)
) -> JSONResponse:
    """Update the user's Expo push notification token"""
    
    # Update the push token in the database
    updated_user = await _db_actions.updateDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        document_id=user_id,
        expo_notification_token=body.expo_push_token
    )
    
    if updated_user is None:
        raise HTTPException(status_code=404, detail='User not found')
    
    return JSONResponse(
        status_code=200,
        content={"message": "Push token updated successfully"}
    )

@router.get('/subscription', response_description='Get user subscription details')
@error_decorator
async def get_user_subscription(
    req:Request,
    user_id:str=Depends(auth.auth_wrapper)
) -> JSONResponse:
    subscription_details = await get_subscription_details(req, user_id)
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(subscription_details.model_dump())
    )
