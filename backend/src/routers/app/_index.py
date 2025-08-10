from fastapi import APIRouter

from routers.app.users._index import router as users_router

router = APIRouter()

router.include_router(users_router, prefix='/users', tags=['users'])
