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
        try:
            # Get interview, CV, and user data
            interview = await self._get_interview_data(interview_id)
            cv = await self._get_cv_data(user_id)
            user = await self._get_user_data(user_id)
            
            # Check if this is a sales interview
            interview_type = interview.get('interview_type', 'technical')
            
            if interview_type == "sales":
                # Use predefined sales agent
                return "agent_9101k2qdcg74f6bteqwe4y2se5ct"
            
            # Build system prompt with context for non-sales interviews
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
        
        interview_type = interview.get('interview_type', 'technical')
        
        if interview_type == "sales":
            return self._build_sales_call_prompt(interview, cv, user)
        else:
            return self._build_standard_interview_prompt(interview, cv, user)
    
    def _build_sales_call_prompt(self, interview: Dict, cv: Dict, user: Dict) -> str:
        """Build the system prompt for the sales call simulation agent"""
        
        # Extract key information
        role = interview.get('role_title', 'Sales Development Representative')
        company = interview.get('company', 'the company')
        difficulty = interview.get('difficulty', 'mid')
        
        user_name = user.get('name', 'Salesperson')
        
        # Get target customer profile from job requirements
        jd_structured = interview.get('jd_structured', {})
        requirements = jd_structured.get('requirements', '')
        focus_areas = interview.get('focus_areas', [])
        
        # Determine industry and company size from job description
        target_industry = "Technology"
        target_company_size = "Mid-market (100-1000 employees)"
        
        if any(keyword in requirements.lower() for keyword in ['enterprise', 'large company', 'fortune']):
            target_company_size = "Enterprise (1000+ employees)"
        elif any(keyword in requirements.lower() for keyword in ['startup', 'small business', 'smb']):
            target_company_size = "Small business (10-100 employees)"
        
        # Adjust difficulty-based behavior
        if difficulty == "junior":
            objection_level = "Be relatively easy-going with 1-2 mild objections. Show interest if they demonstrate basic sales skills."
            personality_note = "Be patient and give them opportunities to recover from mistakes."
        elif difficulty == "senior":
            objection_level = "Be challenging with 3-4 strong objections. Require excellent handling before showing interest."
            personality_note = "Be skeptical and demand high-level sales expertise."
        else:  # mid
            objection_level = "Present 2-3 realistic objections. Reward good sales technique with gradual interest."
            personality_note = "Be professionally skeptical but fair."
        
        prompt = f"""You are playing the role of a PROSPECT in a sales call simulation for {role} training.

PROSPECT PROFILE:
- Role: Director of Operations at TechFlow Solutions
- Company: {target_company_size} {target_industry} company
- Pain Points: Manual processes, inefficient workflows, scaling challenges, budget constraints
- Personality: Busy, {personality_note.lower()}
- Buying Authority: Can influence decisions, but needs to consult with leadership for final approval
- Current Situation: Evaluating solutions but not in a rush to buy

YOUR BEHAVIOR AS A PROSPECT:
1. **Don't volunteer information** - Make {user_name} ask good discovery questions
2. **Be realistically skeptical** - Don't be immediately interested or hostile  
3. **Have objections ready**: {objection_level}
4. **Show buying signals gradually** if they demonstrate good sales skills
5. **Respond naturally** - like a real busy executive would
6. **Challenge them appropriately** for {difficulty} level difficulty

CONVERSATION GUIDELINES:
- Start with: "Hi, I have about 10 minutes. What's this about?"
- Don't lead the conversation - let {user_name} drive it
- Ask clarifying questions if their pitch is vague: "Can you be more specific?"
- Bring up objections naturally during the conversation
- If they handle objections well, show some interest
- End the call after 8-12 minutes with next steps (or lack thereof)

OBJECTIONS TO USE (pick 2-3 based on conversation flow and difficulty):
- "We're already using [competitor solution] and it works fine"
- "This isn't the right time, maybe next quarter"  
- "I'd need to see a detailed ROI analysis first"
- "Our budget for this type of solution is very limited"
- "I'll need buy-in from several other departments"
- "How do I know this isn't just another sales pitch?"
- "We've been burned by vendors before"

EVALUATION CRITERIA (respond positively if they demonstrate):
- Good discovery questions about pain points and current situation
- Active listening and building on your responses
- Handling objections with empathy and solutions
- Creating appropriate urgency without being pushy
- Asking for specific next steps
- Professional rapport building

FOCUS AREAS FOR THIS ROLE: {', '.join(focus_areas) if focus_areas else 'Discovery, objection handling, closing'}

Remember: You're a realistic prospect, not an interviewer. Be challenging but fair, and reward good sales technique with engagement. This is practice for {user_name} to improve their sales skills."""

        return prompt
    
    def _build_standard_interview_prompt(self, interview: Dict, cv: Dict, user: Dict) -> str:
        """Build the system prompt for standard interview types"""
        
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
        # For now, return mock data - could be sales or technical
        return {
            "company": "SalesForce",
            "role_title": "Sales Development Representative",
            "difficulty": "mid",
            "interview_type": "sales",
            "jd_structured": {
                "requirements": "2+ years B2B sales experience, SaaS background, cold calling, lead generation, CRM experience"
            },
            "focus_areas": ["prospecting", "discovery", "objection_handling", "closing"]
        }
    
    async def _get_cv_data(self, user_id: str) -> Dict:
        """Get CV data - placeholder for database access"""
        # This would need to be refactored to work with actual database
        return {
            "skills": ["B2B Sales", "Cold Calling", "CRM", "Lead Generation", "SaaS"],
            "experience_years": 2
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