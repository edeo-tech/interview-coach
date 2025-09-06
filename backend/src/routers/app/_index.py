from fastapi import APIRouter

from routers.app.users._index import router as users_router
from routers.app.interviews._index import router as interviews_router
from routers.app.payments.stripe import router as payments_router
from routers.app.jobs import router as jobs_router
from routers.app.onboarding._index import router as onboarding_router
from routers.app.anam._index import router as anam_router

router = APIRouter()

router.include_router(users_router, prefix='/users', tags=['users'])
router.include_router(jobs_router, prefix='/jobs', tags=['jobs'])
router.include_router(interviews_router, prefix='/interviews', tags=['interviews'])
router.include_router(payments_router, prefix='/payments', tags=['payments'])
router.include_router(onboarding_router, prefix='/onboarding', tags=['onboarding'])
router.include_router(anam_router, prefix='/anam', tags=['anam'])
