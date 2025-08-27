from fastapi import APIRouter

from routers.app.users.auth.users import router as auth_router
from routers.app.users.auth.refresh import router as refresh_router
from routers.app.users.stats import router as stats_router
from routers.app.users.referrals import router as referrals_router

router = APIRouter()

router.include_router(auth_router, prefix='/auth', tags=['auth'])
router.include_router(refresh_router, prefix='/refresh', tags=['refresh'])
router.include_router(stats_router, prefix='/stats', tags=['user_stats'])
router.include_router(referrals_router, prefix='/referrals', tags=['referrals'])
