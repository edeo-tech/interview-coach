from fastapi import APIRouter

from routers.internal.migrations import router as migrations_router

router = APIRouter()

router.include_router(migrations_router, prefix='/migrations', tags=['migrations'])