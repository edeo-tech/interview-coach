from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class AuthenticatedUser(BaseModel):
    id: str = Field(..., description="The unique identifier of the user")
    name: str = Field(..., description="The full name of the user")
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
    referral_code: str = Field(default='', description="Unique 4-character referral code for this user")
    free_calls_remaining: int = Field(default=1, description="Number of free interview calls remaining for this user") 
