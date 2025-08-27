from decouple import config
from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import timezone
import uvicorn

from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from routers.app._index import router as app_router
from routers.webhooks._index import router as webhook_router
from routers.websockets._index import router as websocket_router
from routers.internal._index import router as internal_router

CONNECTION_STRING_DB=config("CONNECTION_STRING_DB", cast=str)
DB_NAME=config("DB_NAME", cast=str)

middleware = [
    Middleware(
        CORSMiddleware,
        # allow_origins=allowedDomains,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*']
    )
]

class ExtendFastAPI(FastAPI):
    mongodb_client: AsyncIOMotorClient
    mongodb: AsyncIOMotorClient

@asynccontextmanager
async def lifespan(app: ExtendFastAPI):
    # startup
    app.mongodb_client = AsyncIOMotorClient(
        CONNECTION_STRING_DB,
        tz_aware = True,
        tzinfo=timezone.utc
    )

    app.mongodb = app.mongodb_client[DB_NAME]

    # shutdown
    yield
    app.mongodb_client.close()

app = ExtendFastAPI(
    lifespan=lifespan,
    middleware=middleware,
    docs_url=None,
    redoc_url=None
)

app.include_router(
    app_router, 
    prefix='/app', 
    tags=['app']
)

app.include_router(
    webhook_router, 
    prefix='/webhooks', 
    tags=['webhooks']
)

app.include_router(
    websocket_router, 
    prefix='/ws', 
    tags=['websockets']
)

app.include_router(
    internal_router, 
    prefix='/internal', 
    tags=['internal']
)

if __name__ == "__main__":
    uvicorn.run('main:app', host="0.0.0.0", port=8000, reload=True)
