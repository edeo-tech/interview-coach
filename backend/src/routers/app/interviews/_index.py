from fastapi import APIRouter
from .cv import router as cv_router
from .sessions import router as sessions_router
from .feedback import router as feedback_router

router = APIRouter()

router.include_router(cv_router, prefix="/cv", tags=["cv"])
router.include_router(sessions_router, tags=["sessions"])
router.include_router(feedback_router, prefix="/feedback", tags=["feedback"])