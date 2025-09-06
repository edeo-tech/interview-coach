from fastapi import APIRouter, Depends, HTTPException
from models.users.authenticated_user import AuthenticatedUser
from services.anam_service import create_session_token
from utils.__errors__.error_decorator_routes import error_decorator

from authentication import Authorization

router = APIRouter()
auth = Authorization()

@router.post("/session-token")
@error_decorator
async def get_anam_session_token(
    user_id: str = Depends(auth.auth_wrapper)
):
    """
    Get a session token for Anam AI video calls.
    """
    try:
        session_token = await create_session_token()
        return {"sessionToken": session_token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
