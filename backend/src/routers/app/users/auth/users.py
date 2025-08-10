from fastapi import Request, HTTPException, APIRouter, Depends
from fastapi.responses import JSONResponse, Response
from fastapi.encoders import jsonable_encoder

from models.users.users import User, LoginUser
from crud.users.auth.users import (
    create_user,
    handle_login,
    update_user_last_active_at,
    get_user_by_id
)
from crud._generic import _db_actions
from models.users.authenticated_user import AuthenticatedUser
from utils.errors.error_decorator_routes import error_decorator
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
        username=login_user.username
    )

    if user is None:
        raise HTTPException(status_code=401, detail='Invalid username or password')

    if not auth.verify_password(login_user.password, user.password):
        raise HTTPException(status_code=401, detail='Invalid username or password')

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


    current_user = AuthenticatedUser(**jsonable_encoder(
        user
    )).model_dump(exclude_none=True)
    current_user['id'] = user_id

    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(current_user)
    )

@router.post('/logout', response_description='Logout a user')
@error_decorator
async def logout(
    req:Request,
    user_id:str=Depends(auth.auth_wrapper)
) -> JSONResponse:
    
    await auth.logout(req, user_id)
    return Response(status_code=204)
