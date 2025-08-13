from fastapi import APIRouter, Depends, Request, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator
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

class TranscriptTurn(BaseModel):
    role: str  # user or agent
    message: str
    time_in_call_secs: Optional[int] = None

class FinishAttemptRequest(BaseModel):
    attempt_id: str
    duration_seconds: Optional[int] = None
    conversation_id: Optional[str] = None

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
    print(f"\n▶️  [API] Received start interview request:")
    print(f"   - Interview ID: {interview_id}")
    print(f"   - User ID: {user_id}")
    
    # Verify interview exists and belongs to user
    interview = await get_interview(req, interview_id)
    
    if not interview:
        print(f"   ❌ ERROR: Interview {interview_id} not found")
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview.user_id != user_id:
        print(f"   ❌ ERROR: Access denied - interview belongs to {interview.user_id}, not {user_id}")
        raise HTTPException(status_code=403, detail="Access denied")
    
    print(f"   - Interview details: {interview.role_title} at {interview.company}")
    
    # Create attempt record (frontend handles ElevenLabs entirely)
    attempt = await create_attempt(req, interview_id)

    print(f"   ✅ SUCCESS: Started attempt with ID: {attempt.id}")
    return JSONResponse(
        status_code=200,
        content={"attempt_id": attempt.id}
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
    print(f"\n📡 [API] Received transcript turn request:")
    print(f"   - Interview ID: {interview_id}")
    print(f"   - Role: {turn.role}")
    print(f"   - Message preview: {turn.message[:100]}..." if len(turn.message) > 100 else f"   - Message: {turn.message}")
    
    # Get the active attempt for this interview
    attempts = await get_interview_attempts(req, interview_id)
    active_attempt = next((a for a in attempts if a.status == "active"), None)
    
    if not active_attempt:
        print(f"   ❌ ERROR: No active attempt found for interview {interview_id}")
        raise HTTPException(status_code=400, detail="No active attempt found")
    
    print(f"   - Active attempt ID: {active_attempt.id}")
    
    # Verify ownership through interview
    interview = await get_interview(req, interview_id)
    if not interview or interview.user_id != user_id:
        print(f"   ❌ ERROR: Access denied for user {user_id}")
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated_attempt = await add_transcript_turn(
        req, active_attempt.id, turn.role, turn.message, turn.time_in_call_secs
    )
    
    if not updated_attempt:
        print(f"   ❌ ERROR: Failed to add transcript turn")
        raise HTTPException(status_code=400, detail="Failed to add transcript turn")
    
    print(f"   ✅ SUCCESS: Transcript turn added successfully")
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
    print(f"\n🔚 [API] Received finish interview request:")
    print(f"   - Interview ID: {interview_id}")
    print(f"   - Attempt ID: {finish_request.attempt_id}")
    print(f"   - Duration: {finish_request.duration_seconds} seconds")
    print(f"   - Conversation ID: {finish_request.conversation_id}")
    
    # Verify ownership
    interview = await get_interview(req, interview_id)
    if not interview or interview.user_id != user_id:
        print(f"   ❌ ERROR: Access denied for user {user_id}")
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify attempt exists and is active
    attempt = await get_attempt(req, finish_request.attempt_id)
    if not attempt or attempt.interview_id != interview_id:
        print(f"   ❌ ERROR: Invalid attempt")
        raise HTTPException(status_code=400, detail="Invalid attempt")
    
    if attempt.status != "active":
        print(f"   ❌ ERROR: Attempt status is {attempt.status}, not active")
        raise HTTPException(status_code=400, detail="Attempt is not active")
    
    print(f"   - Current transcript length: {len(attempt.transcript)}")
    
    # Mark attempt complete and store conversation_id
    update_data = {
        "status": "completed",
        "ended_at": datetime.now(timezone.utc)
    }
    
    if finish_request.duration_seconds:
        update_data["duration_seconds"] = finish_request.duration_seconds
        
    if finish_request.conversation_id:
        update_data["conversation_id"] = finish_request.conversation_id
        print(f"   - Storing conversation_id: {finish_request.conversation_id}")
    
    from crud.interviews.attempts import update_attempt
    completed_attempt = await update_attempt(req, finish_request.attempt_id, **update_data)
    
    # Note: Transcript retrieval and grading are now handled by the ElevenLabs webhook
    # This provides much faster processing (1-2 seconds vs 20+ seconds)
    print(f"   - Waiting for ElevenLabs webhook to process transcript and trigger grading...")
    print(f"   ✅ SUCCESS: Interview finished - webhook will handle transcript and grading")
    
    return JSONResponse(
        status_code=200,
        content={
            "status": "completed",
            "attempt": jsonable_encoder(completed_attempt.model_dump())
        }
    )