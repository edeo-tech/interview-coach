from fastapi import APIRouter, Depends, Request, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from authentication import Authorization
from utils.errors.error_decorator_routes import error_decorator
from crud.interviews.interviews import (
    create_interview_from_url as create_interview_from_url_crud,
    create_interview_from_file as create_interview_from_file_crud,
    get_interview, get_user_interviews
)
from crud.interviews.attempts import (
    create_attempt, get_attempt, get_interview_attempts, 
    update_attempt, add_transcript_turn, finish_attempt
)

router = APIRouter()
auth = Authorization()

class CreateInterviewFromURLRequest(BaseModel):
    job_url: str
    interview_type: str = "technical"  # technical, behavioral, leadership

class CreateInterviewFromFileRequest(BaseModel):
    interview_type: str = "technical"  # technical, behavioral, leadership

class StartAttemptResponse(BaseModel):
    attempt_id: str
    agent_id: str

class TranscriptTurn(BaseModel):
    speaker: str  # user or agent
    text: str
    timestamp: Optional[datetime] = None

class FinishAttemptRequest(BaseModel):
    attempt_id: str
    duration_seconds: Optional[int] = None

@router.post("/create/url")
@error_decorator
async def create_interview_from_url(
    req: Request,
    request: CreateInterviewFromURLRequest,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Create a new interview from job posting URL"""
    interview = await create_interview_from_url_crud(
        req=req,
        user_id=user_id,
        job_url=request.job_url,
        interview_type=request.interview_type
    )
    
    # Ensure the _id is included in the response
    interview_dict = interview.model_dump()
    interview_dict['_id'] = str(interview.id)
    
    return JSONResponse(
        status_code=201,
        content=jsonable_encoder(interview_dict)
    )

@router.post("/create/file")
@error_decorator
async def create_interview_from_file(
    req: Request,
    file: UploadFile = File(...),
    interview_type: str = "technical",
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
    
    interview = await create_interview_from_file_crud(
        req=req,
        user_id=user_id,
        file_content=content,
        content_type=file.content_type,
        filename=filename,
        interview_type=interview_type
    )
    
    # Ensure the _id is included in the response
    interview_dict = interview.model_dump()
    interview_dict['_id'] = str(interview.id)
    
    return JSONResponse(
        status_code=201,
        content=jsonable_encoder(interview_dict)
    )

@router.get("/")
@error_decorator
async def list_user_interviews(
    req: Request,
    user_id: str = Depends(auth.auth_wrapper),
    limit: int = 10
):
    """Get all interviews for the current user"""
    interviews = await get_user_interviews(req, user_id, limit)
    
    # Ensure _id is included in the response for each interview
    interviews_data = []
    for interview in interviews:
        interview_dict = interview.model_dump()
        interview_dict['_id'] = str(interview.id)
        interviews_data.append(interview_dict)
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder(interviews_data)
    )

@router.get("/{interview_id}")
@error_decorator
async def get_interview_details(
    req: Request,
    interview_id: str,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Get details of a specific interview"""
    interview = await get_interview(req, interview_id)
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all attempts for this interview
    attempts = await get_interview_attempts(req, interview_id)
    
    # Ensure _id is included in the response
    interview_dict = interview.model_dump()
    interview_dict['_id'] = str(interview.id)
    
    attempts_data = []
    for attempt in attempts:
        attempt_dict = attempt.model_dump()
        attempt_dict['_id'] = str(attempt.id)
        attempts_data.append(attempt_dict)
    
    return JSONResponse(
        status_code=200,
        content=jsonable_encoder({
            "interview": interview_dict,
            "attempts": attempts_data
        })
    )

@router.post("/{interview_id}/start")
@error_decorator
async def start_interview_attempt(
    req: Request,
    interview_id: str,
    user_id: str = Depends(auth.auth_wrapper)
) -> StartAttemptResponse:
    """Start a new interview attempt"""
    # Verify interview exists and belongs to user
    interview = await get_interview(req, interview_id)
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create attempt record
    attempt = await create_attempt(req, interview_id)
    
    # Initialize ElevenLabs agent
    from services.elevenlabs_service import create_interview_agent
    agent_id = await create_interview_agent(interview_id, user_id)
    
    # Update attempt with agent_id
    await update_attempt(req, attempt.id, agent_id=agent_id)
    
    return JSONResponse(
        status_code=200,
        content={"attempt_id": attempt.id, "agent_id": agent_id}
    )

@router.post("/{interview_id}/transcript")
@error_decorator
async def add_transcript(
    req: Request,
    interview_id: str,
    turn: TranscriptTurn,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Add a turn to the interview transcript"""
    # Get the active attempt for this interview
    attempts = await get_interview_attempts(req, interview_id)
    active_attempt = next((a for a in attempts if a.status == "active"), None)
    
    if not active_attempt:
        raise HTTPException(status_code=400, detail="No active attempt found")
    
    # Verify ownership through interview
    interview = await get_interview(req, interview_id)
    if not interview or interview.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated_attempt = await add_transcript_turn(
        req, active_attempt.id, turn.speaker, turn.text, turn.timestamp
    )
    
    if not updated_attempt:
        raise HTTPException(status_code=400, detail="Failed to add transcript turn")
    
    return JSONResponse(
        status_code=200,
        content={"message": "Transcript updated successfully"}
    )

@router.post("/{interview_id}/finish")
@error_decorator
async def finish_interview_attempt(
    req: Request,
    interview_id: str,
    finish_request: FinishAttemptRequest,
    user_id: str = Depends(auth.auth_wrapper)
):
    """Finish an interview attempt and trigger grading"""
    # Verify ownership
    interview = await get_interview(req, interview_id)
    if not interview or interview.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify attempt exists and is active
    attempt = await get_attempt(req, finish_request.attempt_id)
    if not attempt or attempt.interview_id != interview_id:
        raise HTTPException(status_code=400, detail="Invalid attempt")
    
    if attempt.status != "active":
        raise HTTPException(status_code=400, detail="Attempt is not active")
    
    # Mark attempt complete
    completed_attempt = await finish_attempt(
        req, finish_request.attempt_id, finish_request.duration_seconds
    )
    
    # Trigger grading (async task)
    from services.grading_service import trigger_interview_grading
    await trigger_interview_grading(finish_request.attempt_id)
    
    # Cleanup ElevenLabs agent
    if attempt.agent_id:
        from services.elevenlabs_service import cleanup_agent
        await cleanup_agent(attempt.agent_id)
    
    return JSONResponse(
        status_code=200,
        content={
            "status": "completed",
            "attempt": jsonable_encoder(completed_attempt.model_dump())
        }
    )