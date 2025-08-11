from pydantic import Field, BaseModel, field_validator, EmailStr
import re
from datetime import datetime, timezone

from models._base import MongoBaseModel

class User(MongoBaseModel):
    name:str = Field(
        ...,
        description='The full name of the user'
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

class LoginUser(BaseModel):
    email:EmailStr = Field(
        ...,
        description='The email address of the user'
    )
    password:str = Field(
        ...,
        description='The password of the user'
    )
