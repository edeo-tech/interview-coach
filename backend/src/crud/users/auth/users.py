from fastapi import Request, HTTPException
from fastapi.encoders import jsonable_encoder
from datetime import datetime, timezone


from models.users.users import User
from models.users.authenticated_user import AuthenticatedUser
from crud._generic import _db_actions

from authentication import Authorization

from utils.strings.username_sanitation import remove_invalid_username_characters
# from utils.qr_codes.profiles.generate import generateQRCode

auth = Authorization()


async def create_user(req:Request, user:User):
    ## check that username is not already taken - keep adding underscores until it is not taken
    while await check_if_username_is_taken(req, user.username):
        user.username += '_'

    ## check that phone number is not already taken
    if await check_if_phone_number_is_taken(req, user.phone_number):
        raise HTTPException(status_code=400, detail='Phone number already taken')

    ## strip username of any invalid characters
    user.username = remove_invalid_username_characters(user.username)

    ## generate profile qrcode
    # user.profile_qrcode = await generateQRCode(user.username) // not yet implemented (no web version for linking - only mobile) # needs to be after creation anyway

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
    user_important_info = jsonable_encoder(AuthenticatedUser(
        **user.model_dump(
            by_alias=False,
            exclude_none=True)
        ),
        exclude_none=True,
        by_alias=False
    )

    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_important_info
    }


async def check_if_username_is_taken(req:Request, username:str):
    user = await _db_actions.getDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        username=username
    )
    return user is not None

async def check_if_phone_number_is_taken(req:Request, phone_number:str):
    user = await _db_actions.getDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        phone_number=phone_number
    )
    return user is not None

async def get_user_by_id(req:Request, user_id:str):
    user = await _db_actions.getDocument(
        req=req,
        collection_name='users',
        BaseModel=User,
        document_id=user_id
    )
    return user
