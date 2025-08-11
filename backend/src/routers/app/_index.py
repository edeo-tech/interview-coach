from fastapi import APIRouter

from routers.app.users._index import router as users_router
from routers.app.interviews._index import router as interviews_router

router = APIRouter()

router.include_router(users_router, prefix='/users', tags=['users'])
router.include_router(interviews_router, prefix='/interviews', tags=['interviews'])
