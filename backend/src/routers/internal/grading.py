from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional
import logging

from utils.__errors__.error_decorator_routes import error_decorator
from services.grading_service import trigger_interview_grading

router = APIRouter()

# Configure logging
logger = logging.getLogger(__name__)


@router.post("/test-grading")
@error_decorator
async def test_grading(
    req: Request,
    attempt_id: str = "68b865df1c19a5e844d9d1d0"
):
    """
    Test endpoint for the grading service.
    Uses a hardcoded attempt ID by default: 68b865df1c19a5e844d9d1d0
    
    This endpoint allows testing the grading service without requiring 
    a full interview flow.
    """
    
    try:
        logger.info(f"Testing grading service with attempt_id: {attempt_id}")
        
        # Call the grading service
        feedback_data = await trigger_interview_grading(req, attempt_id)
        
        if feedback_data:
            logger.info(f"Grading successful for attempt_id: {attempt_id}")
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "attempt_id": attempt_id,
                    "feedback": jsonable_encoder(feedback_data)
                }
            )
        else:
            logger.error(f"Grading failed for attempt_id: {attempt_id}")
            
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "attempt_id": attempt_id,
                    "error": "Grading service returned None"
                }
            )
            
    except Exception as e:
        logger.error(f"Test grading failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "attempt_id": attempt_id,
                "error": str(e)
            }
        )

@router.get("/test-grading/health")
@error_decorator
async def grading_health_check(req: Request):
    """
    Health check endpoint for the grading service
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "grading",
            "default_test_attempt_id": "68b865df1c19a5e844d9d1d0"
        }
    )