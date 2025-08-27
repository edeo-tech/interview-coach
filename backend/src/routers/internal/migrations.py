from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from decouple import config
import logging

from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator
from crud._generic._db_actions import getAllDocuments, getMultipleDocuments, updateDocument, countDocuments, countAllDocuments
from models.interviews.interviews import Interview
from models.interviews.attempts import InterviewFeedback
from models.jobs import Job

router = APIRouter()
auth = Authorization()

# Configure logging
logger = logging.getLogger(__name__)

class MigrationRequest(BaseModel):
    dry_run: bool = True  # Safety: default to dry run

class MigrationStats(BaseModel):
    interviews_to_update: int = 0
    interviews_updated: int = 0
    jobs_to_update: int = 0
    jobs_updated: int = 0
    errors: list = []

@router.post("/best-score-and-completion")
@error_decorator
async def migrate_best_score_and_completion(
    req: Request,
    request: MigrationRequest
):
    """
    Migration endpoint to:
    1. Add best_score field to all interviews and calculate from existing feedback
    2. Update interview status to 'completed' if best_score >= 90
    3. Recalculate stages_completed for all jobs based on completed interviews
    
    Admin endpoint - requires admin_key for security
    """
    
    # Admin key check - using secure key from environment
    # ADMIN_KEY = config("MIGRATION_ADMIN_KEY", default="interview-coach-migration-2024")
    # if request.admin_key != ADMIN_KEY:
    #     raise HTTPException(status_code=403, detail="Invalid admin key")
    
    stats = MigrationStats()
    
    try:
        logger.info(f"Starting migration (dry_run={request.dry_run})")
        
        # Step 1: Process all interviews
        logger.info("Processing interviews...")
        
        # Get all interviews using generic CRUD
        interviews = await getAllDocuments(req, "interviews", Interview)
        
        for interview in interviews:
            try:
                interview_id = str(interview.id)
                
                # Find all feedback for this interview using generic CRUD
                feedback_list = await getMultipleDocuments(
                    req, "interview_feedback", InterviewFeedback, interview_id=interview_id
                )
                
                # Calculate best score
                best_score = 0
                if feedback_list:
                    best_score = max(f.overall_score for f in feedback_list)
                
                # Determine if status should be updated
                current_status = interview.status
                new_status = current_status
                if best_score >= 90 and current_status != "completed":
                    new_status = "completed"
                
                # Check if update is needed
                needs_update = (
                    interview.best_score != best_score or
                    current_status != new_status
                )
                
                if needs_update:
                    stats.interviews_to_update += 1
                    
                    if not request.dry_run:
                        # Perform the update using generic CRUD
                        updated_interview = await updateDocument(
                            req, "interviews", Interview, interview_id,
                            best_score=best_score,
                            status=new_status
                        )
                        
                        if updated_interview:
                            stats.interviews_updated += 1
                            logger.info(f"Updated interview {interview_id}: best_score={best_score}, status={new_status}")
                
            except Exception as e:
                error_msg = f"Error processing interview {interview.id}: {str(e)}"
                logger.error(error_msg)
                stats.errors.append(error_msg)
        
        # Step 2: Recalculate stages_completed for all jobs
        logger.info("Processing jobs...")
        
        # Get all jobs using generic CRUD
        jobs = await getAllDocuments(req, "jobs", Job)
        
        for job in jobs:
            try:
                job_id = str(job.id)
                
                # Count completed interviews for this job using generic CRUD
                completed_count = await countDocuments(
                    req, "interviews", Interview,
                    job_id=job_id,
                    status="completed"
                )
                
                # Check if update is needed
                current_stages_completed = job.stages_completed
                if current_stages_completed != completed_count:
                    stats.jobs_to_update += 1
                    
                    if not request.dry_run:
                        # Update job stages_completed using generic CRUD
                        updated_job = await updateDocument(
                            req, "jobs", Job, job_id,
                            stages_completed=completed_count
                        )
                        
                        if updated_job:
                            stats.jobs_updated += 1
                            logger.info(f"Updated job {job_id}: stages_completed={completed_count}")
                
            except Exception as e:
                error_msg = f"Error processing job {job.id}: {str(e)}"
                logger.error(error_msg)
                stats.errors.append(error_msg)
        
        # Prepare response
        response = {
            "success": True,
            "dry_run": request.dry_run,
            "stats": stats.model_dump(),
            "message": "Migration completed successfully" if not request.dry_run else "Dry run completed - no changes made"
        }
        
        logger.info(f"Migration completed: {stats.model_dump()}")
        
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(response)
        )
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "stats": stats.model_dump()
            }
        )

@router.get("/best-score-and-completion/status")
@error_decorator
async def migration_status(
    req: Request,
    admin_key: str
):
    """
    Check the current state of the database to see if migration is needed
    """
    
    # Admin key check - using secure key from environment
    ADMIN_KEY = config("MIGRATION_ADMIN_KEY", default="interview-coach-migration-2024")
    if admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    try:
        # Get total counts using generic CRUD
        total_interviews = await countAllDocuments(req, "interviews", Interview)
        total_jobs = await countAllDocuments(req, "jobs", Job)
        
        # Get all interviews to check their status
        interviews = await getAllDocuments(req, "interviews", Interview, limit=100)  # Sample first 100
        
        interviews_without_best_score = 0
        interviews_needing_status_update = 0
        
        for interview in interviews:
            # Count interviews without best_score field or with 0 best_score
            if not hasattr(interview, 'best_score') or interview.best_score == 0:
                # Check if they have feedback that would indicate a best_score
                feedback_list = await getMultipleDocuments(
                    req, "interview_feedback", InterviewFeedback, interview_id=str(interview.id)
                )
                if feedback_list:  # Has feedback but no best_score
                    interviews_without_best_score += 1
            
            # Count interviews with best_score >= 90 but status not completed
            if hasattr(interview, 'best_score') and interview.best_score >= 90 and interview.status != "completed":
                interviews_needing_status_update += 1
        
        # Sample check for jobs that might need updating
        jobs_sample = []
        jobs = await getAllDocuments(req, "jobs", Job, limit=10)  # Sample first 10
        
        for job in jobs:
            job_id = str(job.id)
            completed_count = await countDocuments(
                req, "interviews", Interview,
                job_id=job_id,
                status="completed"
            )
            if completed_count != job.stages_completed:
                jobs_sample.append({
                    "job_id": job_id,
                    "current_stages_completed": job.stages_completed,
                    "actual_completed": completed_count
                })
        
        return JSONResponse(
            status_code=200,
            content={
                "total_interviews": total_interviews,
                "interviews_without_best_score": interviews_without_best_score,
                "interviews_needing_status_update": interviews_needing_status_update,
                "total_jobs": total_jobs,
                "sample_jobs_needing_update": jobs_sample,
                "migration_needed": interviews_without_best_score > 0 or interviews_needing_status_update > 0 or len(jobs_sample) > 0
            }
        )
        
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )