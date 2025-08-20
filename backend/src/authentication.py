from fastapi import Request, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from decouple import config
from uuid import uuid4
import jwt
import time
import json
import requests as reqs

from jwt import algorithms
RSAAlgorithm = algorithms.RSAAlgorithm
from cryptography.hazmat.primitives import serialization

from google.oauth2 import id_token
from google.auth.transport import requests

from datetime import datetime, timedelta, timezone

from models.auth.refresh import RefreshToken

CLIENT_ID_IOS = config('CLIENT_ID_IOS', cast=str)
CLIENT_ID_ANDROID = config('CLIENT_ID_ANDROID', cast=str)
CLIENT_ID_WEB = config('CLIENT_ID_WEB', cast=str)

APPLE_PUBLIC_KEY_URL = config('APPLE_PUBLIC_KEY_URL', cast=str)
APPLE_BUNDLE_ID = config('APPLE_BUNDLE_ID', cast=str)

class Authorization:
    security = HTTPBearer()

    def __init__(self):
        self.password_context = CryptContext(schemes=['argon2'], deprecated='auto')
        self.SECRET_KEY = config('SECRET_KEY', cast=str)
        self.ENVIRONMENT = config('ENVIRONMENT', cast=str)
        self.ALGORITHM = 'RS256' if self.ENVIRONMENT == 'production' else 'HS256'
        self.PUBLIC_KEY = self.load_public_key()
        self.PRIVATE_KEY = self.load_private_key()

    def load_public_key(self) -> str:
        if self.ENVIRONMENT == 'production':
            with open('/etc/secrets/public_key.pem', 'r') as file:
                return file.read()
        else:
            return self.SECRET_KEY

    def load_private_key(self) -> str:
        if self.ENVIRONMENT == 'production':
            with open('/etc/secrets/private_key.pem', 'r') as file:
                return file.read()
        else:
            return self.SECRET_KEY
    
    def hash_password(self, password:str) -> str:
        return self.password_context.hash(password)
    
    def verify_password(self, password:str, hashed_password:str) -> bool:
        try:
            return self.password_context.verify(password, hashed_password)
        except UnknownHashError:
            return False
        
    def encode_short_lived_token(self, user_id:str, minutes:int=60*60*24*4) -> str:
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(minutes=minutes),
            'iat': datetime.now(timezone.utc),
            'sub': user_id
        }
        return jwt.encode(payload, self.PRIVATE_KEY, algorithm=self.ALGORITHM)
    
    async def encode_refresh_token(self, req:Request, user_id:str, days:int=50) -> str:
        refresh_token_id = str(uuid4())
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(days=days),
            'iat': datetime.now(timezone.utc),
            'sub': user_id,
            'jti': refresh_token_id
        }

        token = jwt.encode(payload, self.PRIVATE_KEY, algorithm=self.ALGORITHM)

        refresh_token = RefreshToken(
            user_id=user_id,
            token_id=refresh_token_id,
            issued_at=payload['iat'],
            expires_at=payload['exp']
        )

        await req.app.mongodb['refresh_tokens'].insert_one(refresh_token.model_dump(by_alias=True, exclude_none=True))

        return token

    def decode_token(self, token:str) -> dict:
        try:
            return jwt.decode(jwt=token, key=self.PUBLIC_KEY, algorithms=[self.ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token has expired')
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

    def auth_wrapper(self, auth:HTTPAuthorizationCredentials=Security(security)):
        return self.decode_token(auth.credentials)['sub']
    
    def refresh_wrapper(self, auth:HTTPAuthorizationCredentials=Security(security)):
        decoded_token = self.decode_token(auth.credentials)

        if 'jti' not in decoded_token:
            print(f"WARNING: REFRESH TOKEN IS INVALID - JTI NOT IN DECODED TOKEN (USER ID {decoded_token['sub']})")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token')
        
        return decoded_token
    
    async def refresh_access_token(self, req:Request, user_id:str, refresh_token_jti:str) -> tuple[str, str]:
        refresh_token_document = await req.app.mongodb['refresh_tokens'].find_one({
            'token_id': refresh_token_jti,
            'expires_at': {'$gt': datetime.now(timezone.utc)}
        })
        if not refresh_token_document:
            print(f"WARNING: REFRESH TOKEN IS INVALID - REFRESH TOKEN DOCUMENT NOT FOUND (USER ID {user_id} - REFRESH TOKEN JTI {refresh_token_jti})")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token')

        # delete refresh token from database
        # await req.app.mongodb['refresh_tokens'].delete_one({'token_id': refresh_token_jti})

        new_refresh_token = await self.encode_refresh_token(req, user_id)
        new_access_token = self.encode_short_lived_token(user_id=user_id)
        return new_access_token, new_refresh_token
    
    async def verify_google_signin_token(self, token:str):
        # Small time delay to prevent early token usage
        time.sleep(1)
        idInfo = id_token.verify_oauth2_token(token, requests.Request())
        if idInfo['aud'] not in [CLIENT_ID_ANDROID, CLIENT_ID_IOS, CLIENT_ID_WEB]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='An Unknown Error Occured'
            )
        
        return idInfo
    
    async def verify_apple_signin_token(self, user_token:str):
        apple_public_key_payload = reqs.get(APPLE_PUBLIC_KEY_URL).json()
        unverified_header = jwt.get_unverified_header(user_token)
        for key in apple_public_key_payload["keys"]:
            if key['kid'] == unverified_header['kid']:
                correct_public_key_info = key
                break
        apple_public_key = RSAAlgorithm.from_jwk(json.dumps(correct_public_key_info))
        apple_public_key_as_string = apple_public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        try:
            verified_payload = jwt.decode(
                user_token, apple_public_key_as_string, audience=APPLE_BUNDLE_ID, algorithms=[correct_public_key_info['alg']]
            )
        except jwt.exceptions.ExpiredSignatureError as e:
            print(e)
            raise HTTPException(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                detail='An unexpected error occured - 7w5v3i'
            )
        except jwt.exceptions.InvalidAudienceError as e:
            print(e)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='An unexpected error occured - 7w5v3j'
            )
        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='An unexpected error occured - 7w5v3k'
            )
        return verified_payload
    
    async def logout(self, req:Request, user_id:str):
        await req.app.mongodb['refresh_tokens'].delete_many({'user_id': user_id})
    