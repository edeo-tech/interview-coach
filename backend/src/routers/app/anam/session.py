from fastapi import APIRouter, Depends, HTTPException, Request
from models.users.authenticated_user import AuthenticatedUser
from models.interviews.interviews import Interview
from models.users.users import User
from models.interviews.cv_profile import CVProfile
from services.anam_service import create_session_token
from utils.__errors__.error_decorator_routes import error_decorator
from crud._generic._db_actions import getDocument
import httpx
from decouple import config

from authentication import Authorization

router = APIRouter()
auth = Authorization()

# Configure OpenAI
OPENAI_API_KEY = config('OPENAI_API_KEY', default='', cast=str)

@router.post("/session-token")
@error_decorator
async def get_anam_session_token(
    request: Request,
    interview_id: str,
    user_id: str = Depends(auth.auth_wrapper)
):
    """
    Get a session token for Anam AI video calls.
    """
    try:
        # Get interview document
        interview = await getDocument(
            req=request,
            collection_name="interviews",
            BaseModel=Interview,
            _id=interview_id
        )

        print(f"Interview: {interview}")
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Get user document to get name
        user = await getDocument(
            req=request,
            collection_name="users", 
            BaseModel=User,
            _id=user_id
        )

        print(f"User: {user}")
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_name = user.name if hasattr(user, 'name') else f"User {user_id}"
        
        # Get user's CV profile
        cv_profile = await getDocument(
            req=request,
            collection_name="cv_profiles",
            BaseModel=CVProfile,
            user_id=user_id
        )
        
        print(f"CV profile: {cv_profile}")
        
        cv_content = ""
        if cv_profile:
            cv_content = cv_profile.content if hasattr(cv_profile, 'content') else ""
        
        # Generate interview outline using OpenAI
        outline_prompt = f"""
        Based on the following interview details and user's CV, create a structured interview outline with specific questions to be asked by an AI interviewer.

        Interview Details:
        - Title: {interview.title if hasattr(interview, 'title') else 'N/A'}
        - Description: {interview.description if hasattr(interview, 'description') else 'N/A'}
        - Company: {interview.company_name if hasattr(interview, 'company_name') else 'N/A'}
        - Interview Type: {interview.interview_type if hasattr(interview, 'interview_type') else 'N/A'}

        User's CV/Resume Content:
        {cv_content[:2000] if cv_content else 'No CV content available'}

        Please create a structured interview outline as a simple numbered list of questions that an AI interviewer should ask. Focus on:
        1. Opening questions about their background
        2. Technical/role-specific questions based on the interview type
        3. Behavioral questions
        4. Questions about their experience from their CV
        5. Closing questions

        Keep it concise but comprehensive, around 8-12 questions total. Return only the numbered list of questions.
        """

        print(f"Interview outline prompt: {outline_prompt}")
        
        # Create OpenAI client
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {"role": "system", "content": "You are an expert interview coach creating structured interview outlines."},
                        {"role": "user", "content": outline_prompt}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"OpenAI API error: {response.status_code}")
            
            response_data = response.json()
            interview_outline = response_data['choices'][0]['message']['content'].strip()
        
        # Create session token with user name and interview outline
        session_token = await create_session_token(user_name, interview_outline)
        return {"sessionToken": session_token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
