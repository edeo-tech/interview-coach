from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
from decouple import config
from typing import Optional

from authentication import Authorization
from utils.__errors__.error_decorator_routes import error_decorator
from crud.interviews.interviews import get_interview
from models.interviews.interview_types import InterviewType

router = APIRouter()
auth = Authorization()

# ElevenLabs configuration
ELEVENLABS_API_KEY = config('ELEVENLABS_API_KEY', default='', cast=str)
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

# Agent IDs stored securely in environment variables
AGENT_IDS = {
    InterviewType.GENERAL_INTERVIEW: config('AGENT_ID_NIAMH_MORISSEY', default=''),
    InterviewType.PHONE_SCREEN: config('AGENT_ID_PHONE_SCREEN', default=''),
    InterviewType.INITIAL_HR_INTERVIEW: config('AGENT_ID_HR_INTERVIEW', default=''),
    InterviewType.MOCK_SALES_CALL: config('AGENT_ID_SALES_CALL', default=''),
    InterviewType.PRESENTATION_PITCH: config('AGENT_ID_PRESENTATION_PITCH', default=''),
    InterviewType.TECHNICAL_SCREENING_CALL: config('AGENT_ID_TECHNICAL_SCREENING', default=''),
    InterviewType.SYSTEM_DESIGN_INTERVIEW: config('AGENT_ID_SYSTEM_DESIGN', default=''),
    InterviewType.PORTFOLIO_REVIEW: config('AGENT_ID_PORTFOLIO_REVIEW', default=''),
    InterviewType.CASE_STUDY: config('AGENT_ID_CASE_STUDY', default=''),
    InterviewType.BEHAVIORAL_INTERVIEW: config('AGENT_ID_BEHAVIORAL', default=''),
    InterviewType.VALUES_INTERVIEW: config('AGENT_ID_VALUES', default=''),
    InterviewType.TEAM_FIT_INTERVIEW: config('AGENT_ID_TEAM_FIT', default=''),
    InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER: config('AGENT_ID_STAKEHOLDER', default=''),
    InterviewType.EXECUTIVE_LEADERSHIP_ROUND: config('AGENT_ID_EXECUTIVE', default=''),
}

# Agent metadata (names and avatars) - safe to store in code
AGENT_METADATA = {
    InterviewType.GENERAL_INTERVIEW: {
        "name": "Niamh Morissey",
        "profile_picture": "https://res.cloudinary.com/dphekriyz/image/upload/v1756311206/niamh_pp_fcl0dj.png"
    },
    InterviewType.PHONE_SCREEN: {
        "name": "Niamh Morissey",
        "profile_picture": "https://res.cloudinary.com/dphekriyz/image/upload/v1756311206/niamh_pp_fcl0dj.png"
    },
    InterviewType.INITIAL_HR_INTERVIEW: {
        "name": "Sam Tyldesley",
        "profile_picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.MOCK_SALES_CALL: {
        "name": "Jane Smith",
        "profile_picture": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.PRESENTATION_PITCH: {
        "name": "Paddy Beaumont",
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.TECHNICAL_SCREENING_CALL: {
        "name": "Louise O'Brien",
        "profile_picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.SYSTEM_DESIGN_INTERVIEW: {
        "name": "Daniel Jones",
        "profile_picture": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.PORTFOLIO_REVIEW: {
        "name": "Ruby Galloway",
        "profile_picture": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.CASE_STUDY: {
        "name": "Conor Duffy",
        "profile_picture": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.BEHAVIORAL_INTERVIEW: {
        "name": "Brenda Newman",
        "profile_picture": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.VALUES_INTERVIEW: {
        "name": "Victor Phelps",
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.TEAM_FIT_INTERVIEW: {
        "name": "Fran Haines",
        "profile_picture": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER: {
        "name": "John McGrath",
        "profile_picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    InterviewType.EXECUTIVE_LEADERSHIP_ROUND: {
        "name": "Ethan Ford",
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
    }
}


class ConversationTokenRequest(BaseModel):
    interview_type: str


class ConversationTokenResponse(BaseModel):
    conversation_token: str
    agent_metadata: dict


@router.post("/{interview_id}/conversation-token")
@error_decorator
async def get_conversation_token(
    req: Request,
    interview_id: str,
    request: ConversationTokenRequest,
    user_id: str = Depends(auth.auth_wrapper)
) -> ConversationTokenResponse:
    """Get a conversation token for ElevenLabs private agent"""
    
    # Verify interview exists and belongs to user
    interview = await get_interview(req, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Map interview type to agent ID
    interview_type_enum = InterviewType(request.interview_type)
    agent_id = AGENT_IDS.get(interview_type_enum)
    
    if not agent_id:
        raise HTTPException(
            status_code=400, 
            detail=f"No agent configured for interview type: {request.interview_type}"
        )
    
    # Get agent metadata
    agent_metadata = AGENT_METADATA.get(interview_type_enum, {
        "name": "Interview Agent",
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
    })
    
    # Fetch conversation token from ElevenLabs
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ELEVENLABS_BASE_URL}/convai/conversation/token",
                params={"agent_id": agent_id},
                headers={"xi-api-key": ELEVENLABS_API_KEY},
                timeout=10.0
            )
            
            if response.status_code != 200:
                print(f"❌ ElevenLabs API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to obtain conversation token"
                )
            
            data = response.json()
            conversation_token = data.get("token")
            
            if not conversation_token:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid response from ElevenLabs API"
                )
            
            print(f"✅ Obtained conversation token for interview {interview_id}, type: {request.interview_type}")
            
            return JSONResponse(
                status_code=200,
                content={
                    "conversation_token": conversation_token,
                    "agent_metadata": agent_metadata
                }
            )
            
    except httpx.RequestError as e:
        print(f"❌ Network error calling ElevenLabs API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Network error obtaining conversation token"
        )
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error obtaining conversation token"
        )
