from models._base import MongoBaseModel
from typing import List, Dict, Optional, Any
from models.interviews.interview_types import InterviewType


class Job(MongoBaseModel):
    user_id: str
    
    # Company and role information
    company: str
    role_title: str
    company_logo_url: Optional[str] = None
    brandfetch_identifier_type: Optional[str] = None  # "domain" or "brandId"
    brandfetch_identifier_value: Optional[str] = None
    location: str = ""
    employment_type: str = "full-time"
    experience_level: str = "mid"  # junior/mid/senior/lead/principal
    salary_range: str = ""
    
    # Job description data
    jd_raw: str = ""  # Raw job description text
    job_description: Dict[str, Any] = {}  # Full structured JD from OpenAI
    
    # Source information
    source_type: str = "file"  # url/file
    source_url: Optional[str] = None  # If from URL
    
    # Interview stages configuration
    interview_stages: List[InterviewType] = []  # List of interview types for this job
    stages_completed: int = 0
    status: str = "in_progress"  # in_progress/completed
    
    # Metadata
    total_attempts: int = 0  # Total attempts across all interviews
    last_attempt_date: Optional[str] = None