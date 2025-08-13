from fastapi import APIRouter

from .elevenlabs import router as elevenlabs_router

router = APIRouter()

router.include_router(
    elevenlabs_router, 
    prefix='/elevenlabs', 
    tags=['webhooks-elevenlabs']
)