from fastapi import Request, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from decouple import config
from uuid import uuid4
import jwt

from datetime import datetime, timedelta, timezone

from models.auth.refresh import RefreshToken


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
    
    async def logout(self, req:Request, user_id:str):
        await req.app.mongodb['refresh_tokens'].delete_many({'user_id': user_id})
    