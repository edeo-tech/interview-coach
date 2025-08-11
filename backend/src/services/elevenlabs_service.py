import httpx
import json
from typing import Dict, Optional
from decouple import config

from crud.interviews.interviews import get_interview
from crud.interviews.cv_profiles import get_user_cv
from crud.users.auth.users import get_user_by_id

# Environment variables - these need to be set
ELEVENLABS_API_KEY = config('ELEVENLABS_API_KEY', default='', cast=str)
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

class ElevenLabsService:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=ELEVENLABS_BASE_URL,
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            timeout=30.0
        )
    
    async def create_interview_agent(self, interview_id: str, user_id: str) -> str:
        """Create an ElevenLabs agent for the interview session"""
        # Get interview and CV data
        from fastapi import Request
        from backend.src.main import app
        
        # This is a workaround - in practice, you'd pass the request object
        # For now, we'll create a mock request to access the database
        # In production, refactor to pass database connection directly
        
        try:
            # Get interview, CV, and user data
            # Note: This needs to be refactored to work with actual database connection
            interview = await self._get_interview_data(interview_id)
            cv = await self._get_cv_data(user_id)
            user = await self._get_user_data(user_id)
            
            # Build system prompt with context
            system_prompt = self._build_interview_prompt(interview, cv, user)
            
            agent_config = {
                "name": f"Interview-{interview['company']}-{interview_id[:8]}",
                "tags": ["interview", "temporary"],
                "conversational_config": {
                    "agent": {
                        "prompt": {
                            "prompt": system_prompt
                        }
                    }
                }
            }
            
            response = await self.client.post("/convai/agents", json=agent_config)
            response.raise_for_status()
            
            agent_data = response.json()
            return agent_data.get("agent_id")
            
        except Exception as e:
            print(f"Error creating ElevenLabs agent: {e}")
            raise
    
    async def delete_agent(self, agent_id: str):
        """Delete an ElevenLabs agent"""
        try:
            response = await self.client.delete(f"/convai/agents/{agent_id}")
            response.raise_for_status()
        except Exception as e:
            print(f"Error deleting ElevenLabs agent {agent_id}: {e}")
            # Don't raise here as cleanup is not critical
    
    def _build_interview_prompt(self, interview: Dict, cv: Dict, user: Dict) -> str:
        """Build the system prompt for the interview agent"""
        
        # Extract key information
        role = interview.get('role_title', 'Software Engineer')
        company = interview.get('company', 'the company')
        difficulty = interview.get('difficulty', 'mid')
        interview_type = interview.get('interview_type', 'technical')
        
        skills = cv.get('skills', []) if cv else []
        experience_years = cv.get('experience_years', 0) if cv else 0
        
        user_name = user.get('name', 'Candidate')
        
        # Get job requirements
        jd_structured = interview.get('jd_structured', {})
        requirements = jd_structured.get('requirements', '')
        focus_areas = interview.get('focus_areas', [])
        
        prompt = f"""You are conducting a {interview_type} interview for a {role} position at {company}.

CANDIDATE INFORMATION:
- Name: {user_name}
- Experience Level: {experience_years} years
- Key Skills: {', '.join(skills[:10]) if skills else 'Not specified'}
- Interview Difficulty: {difficulty.title()} level

JOB REQUIREMENTS:
{requirements[:500] if requirements else 'Standard requirements for this role.'}

FOCUS AREAS: {', '.join(focus_areas) if focus_areas else 'General technical skills'}

INTERVIEW GUIDELINES:
1. Conduct a professional, supportive interview
2. Ask 8-10 relevant questions based on the role and candidate's background
3. Ask ONE question at a time and wait for the candidate's response
4. Adapt your questions based on their answers and experience level
5. Focus on {interview_type} aspects - technical skills, problem-solving, communication
6. Be encouraging but thorough in your evaluation
7. If they struggle, provide gentle guidance or move to an easier question
8. After covering key areas, provide a brief summary of the interview

CONVERSATION FLOW:
- Start with a warm greeting: "Hello {user_name}, I'm excited to interview you for the {role} position at {company}."
- Ask about their background briefly if relevant
- Progress through technical/behavioral questions appropriate for {difficulty} level
- End gracefully: "Thank you for your time today. We'll be in touch soon about next steps."

Remember: Be conversational, professional, and adapt to the candidate's responses. This is a practice interview to help them improve."""

        return prompt
    
    async def _get_interview_data(self, interview_id: str) -> Dict:
        """Get interview data - placeholder for database access"""
        # This would need to be refactored to work with actual database
        # For now, return mock data
        return {
            "company": "TechCorp",
            "role_title": "Software Engineer",
            "difficulty": "mid",
            "interview_type": "technical",
            "jd_structured": {
                "requirements": "3+ years Python experience, React knowledge, API development"
            },
            "focus_areas": ["backend", "frontend"]
        }
    
    async def _get_cv_data(self, user_id: str) -> Dict:
        """Get CV data - placeholder for database access"""
        # This would need to be refactored to work with actual database
        return {
            "skills": ["Python", "JavaScript", "React", "FastAPI", "MongoDB"],
            "experience_years": 3
        }
    
    async def _get_user_data(self, user_id: str) -> Dict:
        """Get user data - placeholder for database access"""
        # This would need to be refactored to work with actual database
        return {
            "name": "John Doe"
        }

# Global service instance
elevenlabs_service = ElevenLabsService()

async def create_interview_agent(interview_id: str, user_id: str) -> str:
    """Create an interview agent"""
    return await elevenlabs_service.create_interview_agent(interview_id, user_id)

async def cleanup_agent(agent_id: str):
    """Clean up an interview agent"""
    await elevenlabs_service.delete_agent(agent_id)