from pydantic import Field, BaseModel, field_validator, EmailStr
import re
from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from models._base import MongoBaseModel

class SignUpType(str, Enum):
    EMAIL = 'email'
    GOOGLE = 'google'
    APPLE = 'apple'

class User(MongoBaseModel):
    name:str = Field(
        default='',
        description='The full name of the user'
    )
    age:int = Field(
        default=0,
        description='The age of the user'
    )
    industry:Optional[str] = Field(
        default=None,
        description='The industry the user works in'
    )
    email:EmailStr = Field(
        ...,
        description='The email address of the user'
    )
    password:str = Field(
        ...,
        description='The password of the user'
    )
    profile_picture:str = Field(
        default='',
        description='The profile picture of the user URL'
    )
    profile_qrcode:str = Field(
        default='',
        description='The profile QR code of the user URL'
    )
    expo_notification_token:str = Field(
        default='',
        description='The Expo notification token of the user'
    )
    device_os:str = Field(
        default='',
        description='The operating system of the user'
    )
    last_login:datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description='The last time the user logged in'
    )
    is_banned:bool = Field(
        default=False,
        description='Whether the user is banned'
    )
    # Premium status now handled by RevenueCat on frontend
    # is_premium:bool = Field(
    #     default=False,
    #     description='Whether the user has an active premium subscription'
    # )
    # stripe_customer_id:str = Field(
    #     default='',
    #     description='The Stripe customer ID for this user'
    # )
    # stripe_subscription_id:str = Field(
    #     default='',
    #     description='The current active Stripe subscription ID'
    # )
    accepted_terms:bool = Field(
        default=True,
        description='Whether the user has accepted the terms of service'
    )
    streak:int = Field(
        default=0,
        description='Current login streak in days'
    )
    streak_record:int = Field(
        default=0,
        description='Highest login streak ever achieved'
    )
    sign_up_type:SignUpType = Field(
        default=SignUpType.EMAIL,
        description='The type of sign up used by the user'
    )

class LoginUser(BaseModel):
    email:EmailStr = Field(
        ...,
        description='The email address of the user'
    )
    password:str = Field(
        ...,
        description='The password of the user'
    )

class UpdateUserProfile(BaseModel):
    name:Optional[str] = Field(
        default=None,
        description='The updated name of the user'
    )
    age:Optional[int] = Field(
        default=None,
        description='The updated age of the user'
    )
    industry:Optional[str] = Field(
        default=None,
        description='The updated industry of the user'
    )
    email:Optional[EmailStr] = Field(
        default=None,
        description='The updated email address of the user'
    )

class SubscriptionDetails(BaseModel):
    is_premium:bool = Field(
        ...,
        description='Whether the user has an active premium subscription'
    )
    plan_name:str = Field(
        ...,
        description='The name of the subscription plan'
    )
    status:str = Field(
        ...,
        description='The status of the subscription (active, canceled, etc.)'
    )
    current_period_end:Optional[datetime] = Field(
        default=None,
        description='When the current billing period ends'
    )
    stripe_portal_url:Optional[str] = Field(
        default=None,
        description='URL to Stripe customer portal for managing subscription'
    )
