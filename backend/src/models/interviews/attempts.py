from models._base import MongoBaseModel
from typing import List, Dict, Optional
from datetime import datetime

class InterviewAttempt(MongoBaseModel):
    interview_id: str
    status: str  # active, completed, graded
    agent_id: Optional[str] = None
    conversation_id: Optional[str] = None  # ElevenLabs conversation ID
    transcript: List[Dict] = []  # ElevenLabs format: [{role, message, time_in_call_secs, tool_calls, tool_results, feedback, conversation_turn_metrics}]
    duration_seconds: int = 0
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    elevenlabs_analysis: Optional[Dict] = None  # Raw analysis from ElevenLabs webhook

class InterviewFeedback(MongoBaseModel):
    attempt_id: str
    overall_score: int  # 0-100
    strengths: List[str] = []
    improvement_areas: List[str] = []
    detailed_feedback: str
    rubric_scores: Dict = {}  # {category: score}