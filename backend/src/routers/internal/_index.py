from fastapi import APIRouter

from routers.internal.migrations import router as migrations_router
from routers.internal.grading import router as grading_router

router = APIRouter()

router.include_router(migrations_router, prefix='/migrations', tags=['migrations'])
router.include_router(grading_router, prefix='/grading', tags=['grading'])