from pydantic import Field, BaseModel, field_validator
import re
from datetime import datetime, timezone

from models._base import MongoBaseModel

E164_REGEX = re.compile(r'^\+[1-9]\d{1,14}$')

class User(MongoBaseModel):
    username:str = Field(
        ...,
        description='The username of the user'
    )
    phone_number:str = Field(
        ...,
        description='The phone number of the user'
    )
    password:str = Field(
        ...,
        description='The password of the user'
    )
    profile_picture:str = Field(
        default='',
        description='The profile picture of the user URL'
    )
    xp_earned:int = Field(
        default=0,
        description='The amount of XP the user has earned'
    )
    profile_qrcode:str = Field(
        default='',
        description='The profile QR code of the user URL'
    )
    expo_notification_token:str = Field(
        default='',
        description='The Expo notification token of the user'
    )
    radius:int = Field(
        default=1,
        description='The radius within which the user will be notified of new airplanes. Default is one mile.'
    )
    last_lat:float = Field(
        ...,
        description='The latitude of the user'
    )
    last_long:float = Field(
        ...,
        description='The longitude of the user'
    )
    device_os:str = Field(
        ...,
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

    @field_validator('phone_number')
    def must_be_e164(cls, v):
        if not E164_REGEX.fullmatch(v):
            raise ValueError(
                'phone_number must be in E.164 format, e.g. "+447911123456"'
            )
        return v

class LoginUser(BaseModel):
    username:str = Field(
        ...,
        description='The username of the user'
    )
    password:str = Field(
        ...,
        description='The password of the user'
    )
