from models._base import MongoBaseModel
from typing import List, Dict, Optional, Any
from models.interviews.interview_types import InterviewType


class Interview(MongoBaseModel):
    job_id: str  # Links to parent job
    user_id: str
    
    # Interview stage information
    interview_type: InterviewType
    stage_order: int  # Position in the interview sequence (0-based)
    status: str = "pending"  # pending/active/completed
    
    # Interview-specific configuration
    difficulty: str = "mid"  # easy/mid/hard
    focus_areas: List[str] = []  # Interview-specific focus areas
    
    # Metadata
    total_attempts: int = 0
    best_score: int = 0  # Track highest score achieved across all attempts
    last_attempt_date: Optional[str] = None
    
    # Legacy fields for backward compatibility during migration
    company: Optional[str] = None
    role_title: Optional[str] = None
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_range: Optional[str] = None
    jd_raw: Optional[str] = None
    job_description: Optional[Dict[str, Any]] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    jd_structured: Optional[Dict] = None