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
from crud.companies import get_or_create_company_info


async def create_job_from_url(
    req: Request,
    user_id: str,
    job_url: str
) -> Job:
    """Create a new job and its interview stages from a job posting URL"""
    
    print(f"Starting job creation from URL for user {user_id}: {job_url}")
    
    # Process the job URL to extract details
    print(f"Initializing JobProcessingService to process URL: {job_url}")
    job_processor = JobProcessingService()
    try:
        print(f"Processing job URL content...")
        job_data = await job_processor.process_job_url(job_url)
        print(f"Successfully processed job URL. Company: {job_data.get('company', 'N/A')}, Role: {job_data.get('role_title', 'N/A')}")
    except Exception as e:
        print(f"Failed to process job URL {job_url}: {str(e)}")
        raise
    finally:
        await job_processor.close()
        print("JobProcessingService client closed")
    
    # Get or create company info with Brandfetch identifiers
    # Note: We don't use the job URL as company website since job postings can be on platforms like LinkedIn
    print(f"Getting or creating company info for: {job_data['company']} (using company name only)")
    try:
        brandfetch_info = await get_or_create_company_info(
            req,
            job_data["company"],
            None  # Don't pass job URL as company website - use company name only
        )
        if brandfetch_info:
            print(f"Retrieved Brandfetch info: {brandfetch_info[0]}={brandfetch_info[1]}")
        else:
            print(f"No Brandfetch info found for company: {job_data['company']}")
    except Exception as e:
        print(f"Error getting company info for {job_data['company']}: {str(e)}")
        brandfetch_info = None
    
    # Create the job record
    print("Creating job record with extracted data")
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
    
    # Add Brandfetch identifiers if found
    if brandfetch_info:
        job.brandfetch_identifier_type = brandfetch_info[0]
        job.brandfetch_identifier_value = brandfetch_info[1]
        print(f"Added Brandfetch identifiers to job record")
    else:
        print("No Brandfetch identifiers to add - will use fallback logo handling")
    
    # Determine interview stages using AI-enhanced detection
    print("Determining interview stages for job with AI enhancement")
    try:
        # Try AI-enhanced detection first
        raw_job_content = job_data.get("jd_raw", "") + "\n" + str(job_data.get("job_description", {}))
        interview_stages, stage_metadata = await InterviewStageService.determine_interview_stages_with_ai(
            job_data=job_data,
            job_processor=job_processor,
            raw_job_content=raw_job_content
        )
        
        job.interview_stages = interview_stages
        print(f"Determined {len(interview_stages)} interview stages using {stage_metadata['detection_method']}: {[stage.value for stage in interview_stages]}")
        print(f"AI stages used: {stage_metadata['ai_stages_used']}, Fallback stages: {stage_metadata['fallback_stages_used']}, Confidence: {stage_metadata['confidence_score']}")
        
        # Store metadata in job_description for debugging/analytics
        if "metadata" not in job_data:
            job_data["metadata"] = {}
        job_data["metadata"]["stage_detection"] = stage_metadata
        
    except Exception as e:
        print(f"Error with AI-enhanced stage detection, falling back to business rules: {str(e)}")
        # Fallback to original method
        interview_stages = InterviewStageService.determine_interview_stages(job_data)
        job.interview_stages = interview_stages
        print(f"Fallback determined {len(interview_stages)} interview stages: {[stage.value for stage in interview_stages]}")
    
    # Save the job using generic CRUD
    print("Saving job to database")
    try:
        created_job = await createDocument(req, "jobs", Job, job)
        print(f"Successfully created job with ID: {created_job.id}")
    except Exception as e:
        print(f"Failed to save job to database: {str(e)}")
        raise
    
    # Create interview records for each stage
    print(f"Creating {len(interview_stages)} interview records")
    try:
        for index, stage in enumerate(interview_stages):
            print(f"Creating interview {index + 1}/{len(interview_stages)}: {stage.value}")
            
            difficulty = InterviewStageService.get_stage_difficulty(stage, job.experience_level)
            focus_areas = InterviewStageService.get_stage_focus_areas(stage, job_data)
            
            print(f"Interview {index + 1} details - Difficulty: {difficulty}, Focus areas: {focus_areas}")
            
            await create_interview_for_job(
                req=req,
                job_id=str(created_job.id),
                user_id=user_id,
                interview_type=stage,
                stage_order=index,
                difficulty=difficulty,
                focus_areas=focus_areas
            )
            
            print(f"Successfully created interview {index + 1}: {stage.value}")
        
        print(f"Successfully created all {len(interview_stages)} interview records")
    except Exception as e:
        print(f"Error creating interview records: {str(e)}")
        raise
    
    print(f"Job creation completed successfully. Job ID: {created_job.id}, Company: {job_data['company']}, Role: {job_data['role_title']}")
    return created_job


async def create_job_from_file(
    req: Request,
    user_id: str,
    file_content: bytes,
    content_type: str,
    filename: str
) -> Job:
    """Create a new job and its interview stages from an uploaded file"""
    
    print(f"Starting job creation from file for user {user_id}: {filename} ({content_type}, {len(file_content)} bytes)")
    
    # Process the file to extract job details
    print(f"Initializing JobProcessingService to process file: {filename}")
    job_processor = JobProcessingService()
    try:
        print(f"Processing file content...")
        job_data = await job_processor.process_job_file(
            file_content, content_type, filename
        )
        print(f"Successfully processed file. Company: {job_data.get('company', 'N/A')}, Role: {job_data.get('role_title', 'N/A')}")
    except Exception as e:
        print(f"Failed to process file {filename}: {str(e)}")
        raise
    finally:
        await job_processor.close()
        print("JobProcessingService client closed")
    
    # Get or create company info with Brandfetch identifiers
    # Try to extract company website from job description metadata if available
    company_website = job_data.get("job_description", {}).get("metadata", {}).get("company_website")
    if company_website:
        print(f"Getting or creating company info for: {job_data['company']} (found company website: {company_website})")
    else:
        print(f"Getting or creating company info for: {job_data['company']} (using company name only, no website found in job description)")
    
    try:
        brandfetch_info = await get_or_create_company_info(
            req,
            job_data["company"],
            company_website  # This will be None if not found in job description
        )
        if brandfetch_info:
            print(f"Retrieved Brandfetch info: {brandfetch_info[0]}={brandfetch_info[1]}")
        else:
            print(f"No Brandfetch info found for company: {job_data['company']}")
    except Exception as e:
        print(f"Error getting company info for {job_data['company']}: {str(e)}")
        brandfetch_info = None
    
    # Create the job record
    print("Creating job record with extracted data from file")
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
    
    # Add Brandfetch identifiers if found
    if brandfetch_info:
        job.brandfetch_identifier_type = brandfetch_info[0]
        job.brandfetch_identifier_value = brandfetch_info[1]
        print(f"Added Brandfetch identifiers to job record")
    else:
        print("No Brandfetch identifiers to add - will use fallback logo handling")
    
    # Determine interview stages using AI-enhanced detection
    print("Determining interview stages for job with AI enhancement")
    try:
        # Try AI-enhanced detection first
        raw_job_content = job_data.get("jd_raw", "") + "\n" + str(job_data.get("job_description", {}))
        interview_stages, stage_metadata = await InterviewStageService.determine_interview_stages_with_ai(
            job_data=job_data,
            job_processor=job_processor,
            raw_job_content=raw_job_content
        )
        
        job.interview_stages = interview_stages
        print(f"Determined {len(interview_stages)} interview stages using {stage_metadata['detection_method']}: {[stage.value for stage in interview_stages]}")
        print(f"AI stages used: {stage_metadata['ai_stages_used']}, Fallback stages: {stage_metadata['fallback_stages_used']}, Confidence: {stage_metadata['confidence_score']}")
        
        # Store metadata in job_description for debugging/analytics
        if "metadata" not in job_data:
            job_data["metadata"] = {}
        job_data["metadata"]["stage_detection"] = stage_metadata
        
    except Exception as e:
        print(f"Error with AI-enhanced stage detection, falling back to business rules: {str(e)}")
        # Fallback to original method
        interview_stages = InterviewStageService.determine_interview_stages(job_data)
        job.interview_stages = interview_stages
        print(f"Fallback determined {len(interview_stages)} interview stages: {[stage.value for stage in interview_stages]}")
    
    # Save the job using generic CRUD
    print("Saving job to database")
    try:
        created_job = await createDocument(req, "jobs", Job, job)
        print(f"Successfully created job with ID: {created_job.id}")
    except Exception as e:
        print(f"Failed to save job to database: {str(e)}")
        raise
    
    # Create interview records for each stage
    print(f"Creating {len(interview_stages)} interview records")
    try:
        for index, stage in enumerate(interview_stages):
            print(f"Creating interview {index + 1}/{len(interview_stages)}: {stage.value}")
            
            difficulty = InterviewStageService.get_stage_difficulty(stage, job.experience_level)
            focus_areas = InterviewStageService.get_stage_focus_areas(stage, job_data)
            
            print(f"Interview {index + 1} details - Difficulty: {difficulty}, Focus areas: {focus_areas}")
            
            await create_interview_for_job(
                req=req,
                job_id=str(created_job.id),
                user_id=user_id,
                interview_type=stage,
                stage_order=index,
                difficulty=difficulty,
                focus_areas=focus_areas
            )
            
            print(f"Successfully created interview {index + 1}: {stage.value}")
        
        print(f"Successfully created all {len(interview_stages)} interview records")
    except Exception as e:
        print(f"Error creating interview records: {str(e)}")
        raise
    
    print(f"Job creation from file completed successfully. Job ID: {created_job.id}, Company: {job_data['company']}, Role: {job_data['role_title']}")
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