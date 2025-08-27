from fastapi import APIRouter

from routers.internal.migrations import router as migrations_router
from routers.internal.referrals import router as referrals_router

router = APIRouter()

router.include_router(migrations_router, prefix='/migrations', tags=['migrations'])
router.include_router(referrals_router, prefix='/referrals', tags=['referrals'])