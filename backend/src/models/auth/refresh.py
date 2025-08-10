from pydantic import Field
from datetime import datetime, timezone, timedelta

from models._base import MongoBaseModel

class RefreshToken(MongoBaseModel):
    user_id:str = Field(
        ...,
        description='The ID of the user that the refresh token belongs to'
    )
    token_id:str = Field(
        ...,
        description='The UUID of the refresh token'
    )
    issued_at:datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description='The time the refresh token was issued'
    )
    expires_at:datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=50),
        description='The time the refresh token expires'
    )
