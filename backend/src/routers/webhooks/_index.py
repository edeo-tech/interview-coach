from fastapi import APIRouter

from .elevenlabs import router as elevenlabs_router
from .stripe import router as stripe_router

router = APIRouter()

router.include_router(
    elevenlabs_router, 
    prefix='/elevenlabs', 
    tags=['webhooks-elevenlabs']
)

router.include_router(
    stripe_router, 
    prefix='', 
    tags=['webhooks-stripe']
)