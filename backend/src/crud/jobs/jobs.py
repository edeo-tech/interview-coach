from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import Request

from models.jobs import Job
from models.interviews import Interview
from models.interviews.interview_types import InterviewType
from services.job_processing_service import JobProcessingService
from services.interview_stage_service import InterviewStageService
from crud._generic._db_actions import createDocument, getDocument, getMultipleDocuments, updateDocument, countDocuments, SortDirection
from crud.interviews.interviews import create_interview_for_job


async def create_job_from_url(
    req: Request,
    user_id: str,
    job_url: str
) -> Job:
    """Create a new job and its interview stages from a job posting URL"""
    
    # Process the job URL to extract details
    job_processor = JobProcessingService()
    try:
        job_data = await job_processor.process_job_url(job_url)
    finally:
        await job_processor.close()
    
    # Create the job record
    job = Job(
        user_id=user_id,
        company=job_data["company"],
        role_title=job_data["role_title"],
        company_logo_url=job_data.get("company_logo_url"),
        location=job_data.get("location", ""),
        employment_type=job_data.get("employment_type", "full-time"),
        experience_level=job_data.get("experience_level", "mid"),
        salary_range=job_data.get("salary_range", ""),
        jd_raw=job_data.get("jd_raw", ""),
        job_description=job_data.get("job_description", {}),
        source_type="url",
        source_url=job_url,
        created_at=datetime.now(timezone.utc)
    )
    
    # Determine interview stages
    interview_stages = InterviewStageService.determine_interview_stages(job_data)
    job.interview_stages = interview_stages
    
    # Save the job using generic CRUD
    created_job = await createDocument(req, "jobs", Job, job)
    
    # Create interview records for each stage
    for index, stage in enumerate(interview_stages):
        difficulty = InterviewStageService.get_stage_difficulty(stage, job.experience_level)
        focus_areas = InterviewStageService.get_stage_focus_areas(stage, job_data)
        
        await create_interview_for_job(
            req=req,
            job_id=str(created_job.id),
            user_id=user_id,
            interview_type=stage,
            stage_order=index,
            difficulty=difficulty,
            focus_areas=focus_areas
        )
    
    return created_job


async def create_job_from_file(
    req: Request,
    user_id: str,
    file_content: bytes,
    content_type: str,
    filename: str
) -> Job:
    """Create a new job and its interview stages from an uploaded file"""
    
    # Process the file to extract job details
    job_processor = JobProcessingService()
    try:
        job_data = await job_processor.process_job_file(
            file_content, content_type, filename
        )
    finally:
        await job_processor.close()
    
    # Create the job record
    job = Job(
        user_id=user_id,
        company=job_data["company"],
        role_title=job_data["role_title"],
        company_logo_url=job_data.get("company_logo_url"),
        location=job_data.get("location", ""),
        employment_type=job_data.get("employment_type", "full-time"),
        experience_level=job_data.get("experience_level", "mid"),
        salary_range=job_data.get("salary_range", ""),
        jd_raw=job_data.get("jd_raw", ""),
        job_description=job_data.get("job_description", {}),
        source_type="file",
        created_at=datetime.now(timezone.utc)
    )
    
    # Determine interview stages
    interview_stages = InterviewStageService.determine_interview_stages(job_data)
    job.interview_stages = interview_stages
    
    # Save the job using generic CRUD
    created_job = await createDocument(req, "jobs", Job, job)
    
    # Create interview records for each stage
    for index, stage in enumerate(interview_stages):
        difficulty = InterviewStageService.get_stage_difficulty(stage, job.experience_level)
        focus_areas = InterviewStageService.get_stage_focus_areas(stage, job_data)
        
        await create_interview_for_job(
            req=req,
            job_id=str(created_job.id),
            user_id=user_id,
            interview_type=stage,
            stage_order=index,
            difficulty=difficulty,
            focus_areas=focus_areas
        )
    
    return created_job


async def get_job(req: Request, job_id: str) -> Optional[Job]:
    """Get a job by ID"""
    return await getDocument(req, "jobs", Job, _id=job_id)


async def get_user_jobs(req: Request, user_id: str, limit: int = 10, skip: int = 0) -> Dict[str, Any]:
    """Get all jobs for a user with pagination metadata"""
    # Get the jobs
    jobs = await getMultipleDocuments(
        req, 
        "jobs", 
        Job, 
        user_id=user_id, 
        order_by="created_at",
        limit=limit,
        skip=skip
    )
    
    # Get total count to determine if there are more pages
    total_count = await countDocuments(req, "jobs", Job, user_id=user_id)
    has_more = (skip + len(jobs)) < total_count
    
    return {
        "jobs": jobs,
        "has_more": has_more,
        "total_count": total_count,
        "current_page_size": len(jobs)
    }


async def update_job(req: Request, job_id: str, **kwargs) -> Optional[Job]:
    """Update a job"""
    return await updateDocument(req, "jobs", Job, job_id, **kwargs)


async def get_job_with_interviews(req: Request, job_id: str) -> Optional[Dict[str, Any]]:
    """Get a job with all its interviews"""
    # Get the job
    job = await get_job(req, job_id)
    if not job:
        return None
    
    # Get all interviews for this job
    interviews = await getMultipleDocuments(
        req, 
        "interviews", 
        Interview, 
        job_id=job_id,
        order_by="stage_order",
        order_direction=SortDirection.ASCENDING
    )
    
    return {
        "job": job,
        "interviews": interviews
    }