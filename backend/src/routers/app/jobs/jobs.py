from fastapi import APIRouter, Depends, Request, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional

from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator
from crud.jobs import (
    create_job_from_url,
    create_job_from_file,
    get_job,
    get_user_jobs,
    get_job_with_interviews
)
from crud.interviews.attempts import create_attempt, get_attempt
from crud.interviews.interviews import get_interview, update_interview_status

router = APIRouter()
auth = Authorization()


class CreateJobFromURLRequest(BaseModel):
    job_url: str


@router.post("/create/url")
@error_decorator
async def create_job_url(
    req: Request,
    request: CreateJobFromURLRequest,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Create a new job and its interview stages from job posting URL"""
    
    job = await create_job_from_url(
        req=req,
        user_id=user_id,
        job_url=request.job_url
    )
    
    # Get the created interviews for the response
    job_with_interviews = await get_job_with_interviews(req, str(job.id))
    
    return JSONResponse(
        status_code=201,
        content=jsonable_encoder({
            "job": job_with_interviews["job"].model_dump(),
            "interviews": [i.model_dump() for i in job_with_interviews["interviews"]]
        })
    )


@router.post("/create/file")
@error_decorator
async def create_job_file(
    req: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(auth.auth_wrapper)
):
    """Create a new job and its interview stages from uploaded job description file"""
    
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
    
    job = await create_job_from_file(
        req=req,
        user_id=user_id,
        file_content=content,
        content_type=file.content_type,
        filename=filename
    )
    
    # Get the created interviews for the response
    job_with_interviews = await get_job_with_interviews(req, str(job.id))
    
    return JSONResponse(
        status_code=201,
        content=jsonable_encoder({
            "job": job_with_interviews["job"].model_dump(),
            "interviews": [i.model_dump() for i in job_with_interviews["interviews"]]
        })
    )


@router.get("/")
@error_decorator
async def list_user_jobs(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper),
    limit: int = 10
):
    """Get all jobs for the current user"""
    jobs = await get_user_jobs(req, user_id, limit)
    
    # Convert to dicts and ensure _id is included
    jobs_data = []
    for job in jobs:
        job_dict = job.model_dump()
        job_dict['_id'] = str(job.id)
        jobs_data.append(job_dict)
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(jobs_data)
    )


@router.get("/{job_id}")
@error_decorator
async def get_job_details(
    req: Request,
    job_id: str,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Get details of a specific job with all its interviews"""
    job_with_interviews = await get_job_with_interviews(req, job_id)
    
    if not job_with_interviews:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_with_interviews["job"]
    if job.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Prepare response
    job_dict = job.model_dump()
    job_dict['_id'] = str(job.id)
    
    interviews_data = []
    for interview in job_with_interviews["interviews"]:
        interview_dict = interview.model_dump()
        interview_dict['_id'] = str(interview.id)
        interviews_data.append(interview_dict)
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder({
            "job": job_dict,
            "interviews": interviews_data
        })
    )


@router.post("/{job_id}/interviews/{interview_id}/start")
@error_decorator
async def start_job_interview_attempt(
    req: Request,
    job_id: str,
    interview_id: str,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Start a new attempt for a specific interview in a job"""
    
    # Verify job exists and belongs to user
    job = await get_job(req, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify interview exists and belongs to this job
    interview = await get_interview(req, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview.job_id != job_id:
        raise HTTPException(status_code=400, detail="Interview does not belong to this job")
    
    # Update interview status to active if it's pending
    if interview.status == "pending":
        await update_interview_status(req, interview_id, "active")
    
    # Create attempt record
    attempt = await create_attempt(req, interview_id)
    
    return JSONResponse(
        status_code=200,
        content={"attempt_id": str(attempt.id)}
    )