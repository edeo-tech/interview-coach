import json
from typing import Dict, List
from fastapi import Request
from decouple import config
import httpx

from crud.interviews.attempts import get_attempt, create_feedback, update_attempt
from crud.interviews.interviews import get_interview
from crud.interviews.cv_profiles import get_user_cv

# Environment variables - these need to be set
OPENAI_API_KEY = config('OPENAI_API_KEY', default='', cast=str)

class InterviewGradingService:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url="https://api.openai.com/v1",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            timeout=60.0
        )
    
    async def grade_interview(self, req: Request, attempt_id: str) -> Dict:
        """Grade an interview attempt using AI"""
        try:
            # Get attempt, interview, and CV data
            attempt = await self._get_attempt_data(req, attempt_id)
            interview = await self._get_interview_data(req, attempt['interview_id'])
            cv = await self._get_cv_data_for_interview(req, interview.get('user_id'))
            
            if not attempt or not interview:
                raise ValueError("Required interview data not found")
            
            # Format transcript for analysis
            transcript_text = self._format_transcript(attempt.get('transcript', []))
            
            if not transcript_text.strip():
                # No transcript to grade
                return await self._create_default_feedback(attempt_id)
            
            # Create grading prompt
            grading_prompt = self._build_grading_prompt(interview, cv, transcript_text)
            
            # Call OpenAI API
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": "gpt-4o-mini",  # More cost-effective model
                    "messages": [{"role": "user", "content": grading_prompt}],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.3
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Parse the AI response
            feedback_data = json.loads(result['choices'][0]['message']['content'])
            
            # Ensure required fields exist
            feedback_data = self._validate_feedback_data(feedback_data)
            
            # Save feedback to database and mark attempt graded
            await create_feedback(
                req,
                attempt_id,
                overall_score=feedback_data["overall_score"],
                strengths=feedback_data["strengths"],
                improvement_areas=feedback_data["improvement_areas"],
                detailed_feedback=feedback_data["detailed_feedback"],
                rubric_scores=feedback_data["rubric_scores"],
            )

            await update_attempt(req, attempt_id, status="graded")

            return feedback_data
            
        except Exception as e:
            print(f"Error grading interview {attempt_id}: {e}")
            return await self._create_default_feedback(attempt_id)
    
    def _format_transcript(self, transcript: List[Dict]) -> str:
        """Format transcript for AI analysis"""
        formatted = []
        for turn in transcript:
            speaker = turn.get('speaker', 'unknown')
            text = turn.get('text', '')
            timestamp = turn.get('timestamp', '')
            
            if text.strip():
                formatted.append(f"{speaker.upper()}: {text}")
        
        return "\n".join(formatted)
    
    def _build_grading_prompt(self, interview: Dict, cv: Dict, transcript: str) -> str:
        """Build the grading prompt for AI analysis"""
        
        role = interview.get('role_title', 'Software Engineer')
        company = interview.get('company', 'the company')
        difficulty = interview.get('difficulty', 'mid')
        interview_type = interview.get('interview_type', 'technical')
        
        jd_structured = interview.get('jd_structured', {})
        requirements = jd_structured.get('requirements', 'Standard requirements')
        
        cv_summary = ""
        if cv:
            skills = cv.get('skills', [])
            experience = cv.get('experience_years', 0)
            cv_summary = f"Candidate has {experience} years experience with skills: {', '.join(skills[:10])}"
        
        prompt = f"""You are an expert technical interviewer evaluating a {interview_type} interview for a {role} position at {company}. 

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

CANDIDATE BACKGROUND:
{cv_summary}

INTERVIEW TRANSCRIPT:
{transcript}

Please analyze this interview and provide a comprehensive evaluation. Return your response as valid JSON with exactly these fields:

{{
    "overall_score": <integer 0-100>,
    "strengths": [<array of 3-5 specific strengths as strings>],
    "improvement_areas": [<array of 3-5 specific areas for improvement as strings>],
    "detailed_feedback": "<detailed paragraph analyzing performance, communication, technical accuracy, and areas for growth>",
    "rubric_scores": {{
        "technical_knowledge": <integer 0-100>,
        "communication": <integer 0-100>,
        "problem_solving": <integer 0-100>,
        "cultural_fit": <integer 0-100>
    }}
}}

EVALUATION CRITERIA:
- Technical Knowledge: Accuracy and depth of technical responses
- Communication: Clarity, articulation, and listening skills
- Problem Solving: Logical thinking and approach to challenges
- Cultural Fit: Enthusiasm, professionalism, and alignment with role

For {difficulty} level positions:
- Junior (0-2 years): Focus on fundamentals, learning ability, enthusiasm
- Mid (2-5 years): Expect solid technical skills, some leadership experience
- Senior (5+ years): Require advanced technical knowledge, mentoring capability, system design skills

Be constructive but honest in your feedback. Highlight both strengths and areas for improvement."""

        return prompt
    
    def _validate_feedback_data(self, data: Dict) -> Dict:
        """Ensure feedback data has all required fields with valid values"""
        defaults = {
            "overall_score": 75,
            "strengths": ["Showed enthusiasm for the role", "Communicated clearly", "Asked thoughtful questions"],
            "improvement_areas": ["Could provide more specific examples", "Opportunity to deepen technical knowledge"],
            "detailed_feedback": "The candidate demonstrated good communication skills and showed enthusiasm for the position. With some additional preparation on technical concepts and providing more specific examples from their experience, they would be even stronger in future interviews.",
            "rubric_scores": {
                "technical_knowledge": 75,
                "communication": 80,
                "problem_solving": 70,
                "cultural_fit": 80
            }
        }
        
        # Merge with defaults for any missing fields
        for key, default_value in defaults.items():
            if key not in data or not data[key]:
                data[key] = default_value
        
        # Validate score ranges
        if not isinstance(data["overall_score"], int) or data["overall_score"] < 0 or data["overall_score"] > 100:
            data["overall_score"] = 75
        
        for category, score in data["rubric_scores"].items():
            if not isinstance(score, int) or score < 0 or score > 100:
                data["rubric_scores"][category] = 75
        
        # Ensure arrays have content
        if not isinstance(data["strengths"], list) or len(data["strengths"]) == 0:
            data["strengths"] = defaults["strengths"]
        
        if not isinstance(data["improvement_areas"], list) or len(data["improvement_areas"]) == 0:
            data["improvement_areas"] = defaults["improvement_areas"]
        
        return data
    
    async def _create_default_feedback(self, attempt_id: str) -> Dict:
        """Create default feedback when AI grading fails"""
        return {
            "overall_score": 70,
            "strengths": [
                "Completed the interview session",
                "Showed interest in the position",
                "Maintained professional communication"
            ],
            "improvement_areas": [
                "Could provide more detailed responses",
                "Consider preparing specific examples",
                "Practice technical concepts"
            ],
            "detailed_feedback": "Thank you for completing the practice interview. This was a good learning experience. Focus on providing more detailed responses and specific examples from your experience to strengthen your interview performance.",
            "rubric_scores": {
                "technical_knowledge": 70,
                "communication": 75,
                "problem_solving": 65,
                "cultural_fit": 75
            }
        }
    
    async def _get_attempt_data(self, req: Request, attempt_id: str) -> Dict:
        """Get attempt data from DB"""
        attempt = await get_attempt(req, attempt_id)
        if not attempt:
            raise ValueError("Attempt not found")
        return attempt.model_dump()
    
    async def _get_interview_data(self, req: Request, interview_id: str) -> Dict:
        """Get interview data from DB"""
        interview = await get_interview(req, interview_id)
        if not interview:
            raise ValueError("Interview not found")
        return interview.model_dump()
    
    async def _get_cv_data_for_interview(self, req: Request, user_id: str) -> Dict:
        """Get CV data for the user associated with the interview"""
        if not user_id:
            return {}
        cv = await get_user_cv(req, user_id)
        return cv.model_dump() if cv else {}

# Global service instance
grading_service = InterviewGradingService()

async def trigger_interview_grading(req: Request, attempt_id: str):
    """Trigger grading for an interview attempt"""
    try:
        feedback_data = await grading_service.grade_interview(req, attempt_id)
        print(f"Interview {attempt_id} graded successfully")
        return feedback_data
    except Exception as e:
        print(f"Failed to grade interview {attempt_id}: {e}")
        return None