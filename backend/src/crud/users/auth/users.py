from fastapi import Request, HTTPException
from fastapi.encoders import jsonable_encoder
from datetime import datetime, timezone


from models.users.users import User
from models.users.authenticated_user import AuthenticatedUser
from crud._generic import _db_actions

from authentication import Authorization

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

    return user


async def update_user_last_active_at(req:Request, user_id:str):
    await _db_actions.updateDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        document_id=user_id,
        last_login=datetime.now(timezone.utc)
    )

async def handle_login(req:Request, user:User):
    await update_user_last_active_at(req, user.id)

    access_token = auth.encode_short_lived_token(user.id)
    refresh_token = await auth.encode_refresh_token(req, user.id)
    
    # Convert user to dict, excluding sensitive fields
    user_dict = user.model_dump(
        exclude={'password', 'expo_notification_token', 'device_os'},
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
