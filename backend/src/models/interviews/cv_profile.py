from models._base import MongoBaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class CVProfile(MongoBaseModel):
    user_id: str
    raw_text: str
    
    # Enhanced structured data from OpenAI
    personal_info: Dict[str, Any] = {}
    professional_summary: str = ""
    
    # Skills breakdown
    technical_skills: List[str] = []
    programming_languages: List[str] = []
    frameworks: List[str] = []
    tools: List[str] = []
    soft_skills: List[str] = []
    spoken_languages: List[str] = []
    
    # Experience and education
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    
    # Additional information
    additional_info: Dict[str, Any] = {}
    
    # Metadata and computed fields
    total_experience_years: int = 0
    current_level: str = "junior"  # junior/mid/senior
    primary_field: str = ""
    confidence_score: float = 0.0
    
    # Legacy fields for backward compatibility
    skills: List[str] = []  # Combined technical skills
    experience_years: int = 0  # Alias for total_experience_years
    
    # Processing metadata
    parsed_at: datetime
    processing_method: str = "openai"  # openai/legacy