from fastapi import APIRouter
from .onboarding import router as onboarding_router

router = APIRouter()

router.include_router(onboarding_router, prefix="/onboarding", tags=["onboarding"])