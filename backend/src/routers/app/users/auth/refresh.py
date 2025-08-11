from fastapi import APIRouter, Request, Depends, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from authentication import Authorization
from utils.__errors__error_decorator_routes import error_decorator

router = APIRouter()
auth = Authorization()

@router.get('/', response_description='Refresh a user\'s access token')
@error_decorator
async def refresh(req:Request, refresh_token:dict=Depends(auth.refresh_wrapper)) -> JSONResponse:
    user_id = refresh_token['sub']
    current_refresh_token_id = refresh_token['jti']

    new_access_token, new_refresh_token = await auth.refresh_access_token(req, user_id, current_refresh_token_id)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=jsonable_encoder({
            'access_token': new_access_token,
            'refresh_token': new_refresh_token
        })
    )
