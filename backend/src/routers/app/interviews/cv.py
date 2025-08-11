from fastapi import APIRouter, Depends, UploadFile, File, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from authentication import Authorization
from utils.errors.error_decorator_routes import error_decorator
from crud.interviews.cv_profiles import create_cv_profile, get_user_cv, update_cv_profile

router = APIRouter()
auth = Authorization()

@router.post("/")
@error_decorator
async def upload_cv(
    req: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(auth.auth_wrapper)
):
    """Upload and process a CV file using OpenAI"""
    # Validate file type
    allowed_types = ['application/pdf', 'text/plain', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files."
        )
    
    # Read file content
    content = await file.read()
    filename = file.filename or "unknown"
    
    try:
        # Check if user already has a CV
        existing_cv = await get_user_cv(req, user_id)
        
        if existing_cv:
            # Update existing CV using OpenAI processing
            cv_profile = await update_cv_profile(req, existing_cv.id, content, file.content_type, filename)
        else:
            # Create new CV profile using OpenAI processing
            cv_profile = await create_cv_profile(req, user_id, content, file.content_type, filename)
        
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(cv_profile.model_dump())
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (already have proper status codes)
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error processing CV: {str(e)}"
        )

@router.get("/")
@error_decorator
async def get_cv(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Get user's current CV profile"""
    cv = await get_user_cv(req, user_id)
    
    if not cv:
        raise HTTPException(status_code=404, detail="No CV found for user")
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(cv.model_dump())
    )

@router.delete("/")
@error_decorator
async def delete_cv(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Delete user's CV profile"""
    from crud._generic._db_actions import deleteDocument
    from models.interviews.cv_profile import CVProfile
    
    cv = await get_user_cv(req, user_id)
    if not cv:
        raise HTTPException(status_code=404, detail="No CV found for user")
    
    await deleteDocument(req, "cv_profiles", CVProfile, _id=cv.id)
    
    return JSONResponse(
        status_code=200,
        content={"message": "CV deleted successfully"}
    )

# Legacy text extraction function removed - now using OpenAI processing