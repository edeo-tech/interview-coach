from models._base import MongoBaseModel
from typing import List, Dict, Optional
from datetime import datetime

class InterviewAttempt(MongoBaseModel):
    interview_id: str
    status: str  # active, completed, graded
    agent_id: Optional[str] = None
    transcript: List[Dict] = []  # [{speaker, text, timestamp}]
    duration_seconds: int = 0
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class InterviewFeedback(MongoBaseModel):
    attempt_id: str
    overall_score: int  # 0-100
    strengths: List[str] = []
    improvement_areas: List[str] = []
    detailed_feedback: str
    rubric_scores: Dict = {}  # {category: score}