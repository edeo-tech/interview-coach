from datetime import datetime, timezone
from typing import Optional

from pydantic import Field

from models._base import MongoBaseModel


class OnboardingAnswers(MongoBaseModel):
    user_id: str = Field(..., description='The ID of the user who submitted these answers')
    industry: str = Field(..., description='The industry the user is interested in')
    has_failed: bool = Field(..., description='Whether the user has failed interviews before')
    preparation_rating: int = Field(..., ge=1, le=5, description='Self-assessment of preparation skills (1-5)')
    communication_rating: int = Field(..., ge=1, le=5, description='Self-assessment of communication skills (1-5)')
    nerves_rating: int = Field(..., ge=1, le=5, description='Self-assessment of nervousness level (1-5)')
    
    # Metadata
    submitted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description='When the onboarding answers were submitted'
    )