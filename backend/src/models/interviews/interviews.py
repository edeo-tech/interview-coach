from models._base import MongoBaseModel
from typing import List, Dict, Optional, Any
from models.interviews.interview_types import InterviewType


class Interview(MongoBaseModel):
    user_id: str
    
    # Core interview information
    interview_type: InterviewType = InterviewType.GENERAL_INTERVIEW  # Default to general interview
    status: str = "pending"  # pending/active/completed
    
    # Company and role information
    company: str
    role_title: str
    company_logo_url: Optional[str] = None
    brandfetch_identifier_type: Optional[str] = None  # "domain" or "brandId"
    brandfetch_identifier_value: Optional[str] = None
    location: Optional[str] = ""
    employment_type: Optional[str] = "full-time"
    experience_level: Optional[str] = "mid"  # junior/mid/senior
    salary_range: Optional[str] = ""
    
    # Job description data
    jd_raw: Optional[str] = ""  # Raw job description text
    job_description: Optional[Dict[str, Any]] = {}  # Full structured JD from OpenAI
    
    # Source information
    source_type: Optional[str] = "file"  # url/file
    source_url: Optional[str] = None  # If from URL
    
    # Interview-specific configuration
    difficulty: str = "mid"  # easy/mid/hard
    focus_areas: List[str] = []  # Interview-specific focus areas
    
    # Metadata
    total_attempts: int = 0
    best_score: int = 0  # Track highest score achieved across all attempts
    average_score: Optional[float] = None  # Average score across all attempts
    last_attempt_date: Optional[str] = None
    
    # Legacy fields - can be removed after data migration
    job_id: Optional[str] = None  # No longer needed
    stage_order: Optional[int] = None  # No longer needed
    jd_structured: Optional[Dict] = None