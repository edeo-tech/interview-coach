from fastapi import APIRouter, Depends, Request, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional

from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator
from crud.interviews import (
    create_interview_from_url,
    create_interview_from_file
)

router = APIRouter()
auth = Authorization()


class CreateInterviewFromURLRequest(BaseModel):
    job_url: str


@router.post("/create/url")
@error_decorator
async def create_interview_url(
    req: Request,
    request: CreateInterviewFromURLRequest,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Create a new interview from job posting URL"""
    
    interview = await create_interview_from_url(
        req=req,
        user_id=user_id,
        job_url=request.job_url
    )
    
    # Ensure _id is included in the response
    interview_dict = interview.model_dump()
    interview_dict['_id'] = str(interview.id)
    
    # Ensure average_score is included (for backwards compatibility)
    if 'average_score' not in interview_dict or interview_dict['average_score'] is None:
        interview_dict['average_score'] = 0.0
    
    return JSONResponse(
        status_code=201,
        content=jsonable_encoder({
            "interview": interview_dict
        })
    )


@router.post("/create/file")
@error_decorator
async def create_interview_file(
    req: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(auth.auth_wrapper)
):
    """Create a new interview from uploaded job description file"""
    
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
    filename = file.filename or "job_description"
    
    interview = await create_interview_from_file(
        req=req,
        user_id=user_id,
        file_content=content,
        content_type=file.content_type,
        filename=filename
    )
    
    # Ensure _id is included in the response
    interview_dict = interview.model_dump()
    interview_dict['_id'] = str(interview.id)
    
    # Ensure average_score is included (for backwards compatibility)
    if 'average_score' not in interview_dict or interview_dict['average_score'] is None:
        interview_dict['average_score'] = 0.0
    
    return JSONResponse(
        status_code=201,
        content=jsonable_encoder({
            "interview": interview_dict
        })
    )