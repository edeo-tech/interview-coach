from models._base import MongoBaseModel
from typing import List, Dict, Optional, Any

class Interview(MongoBaseModel):
    user_id: str
    
    # Company and role information
    company: str
    role_title: str
    company_logo_url: Optional[str] = None
    location: str = ""
    employment_type: str = "full-time"
    experience_level: str = "mid"  # junior/mid/senior/lead/principal
    salary_range: str = ""
    
    # Job description data
    jd_raw: str = ""  # Raw job description text
    job_description: Dict[str, Any] = {}  # Full structured JD from OpenAI
    
    # Interview configuration
    difficulty: str = "mid"  # Computed from experience_level
    interview_type: str = "technical"  # technical/behavioral/leadership
    focus_areas: List[str] = []  # Extracted from tech_stack
    
    # Source information
    source_type: str = "file"  # url/file
    source_url: Optional[str] = None  # If from URL
    
    # Legacy field for backward compatibility
    jd_structured: Dict = {}  # Alias for job_description