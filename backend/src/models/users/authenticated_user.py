from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class AuthenticatedUser(BaseModel):
    id: str = Field(..., description="The unique identifier of the user")
    name: str = Field(..., description="The full name of the user")
    age: Optional[int] = Field(None, description="The age of the user")
    industry: Optional[str] = Field(None, description="The industry the user works in")
    email: EmailStr = Field(..., description="The email address of the user")
    profile_picture: Optional[str] = Field('', description="The profile picture URL of the user")
    profile_qrcode: Optional[str] = Field('', description="The profile QR code URL of the user")
    is_banned: bool = Field(..., description="Whether the user is banned")
    last_login: Optional[datetime] = Field(None, description="The last time the user logged in")
    # Premium status now handled by RevenueCat on frontend
    # is_premium: bool = Field(default=False, description="Whether the user has an active premium subscription")
    created_at: datetime = Field(..., description="When the user account was created")
    streak: int = Field(default=0, description="Current login streak in days")
    streak_record: int = Field(default=0, description="Highest login streak ever achieved") 
