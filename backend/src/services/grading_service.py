import json
from typing import Dict, List
from fastapi import Request
from decouple import config
import httpx

from crud.interviews.attempts import get_attempt, create_feedback, update_attempt
from crud.interviews.interviews import get_interview
from config.interview_configs import get_interview_config
from models.interviews.interview_types import InterviewType

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

        print(f"[GRADING] Attempt ID: {attempt_id}")
        
        try:
            # Get attempt and interview data
            attempt = await self._get_attempt_data(req, attempt_id)
            print(f"[GRADING] Attempt: {attempt}")
            
            interview = await self._get_interview_data(req, attempt['interview_id'])
            print(f"[GRADING] Interview: {interview}")
            
            # Get interview type
            interview_type = InterviewType(interview.get('interview_type', InterviewType.TECHNICAL_SCREENING_CALL))
            print(f"[GRADING] Interview type: {interview_type}")
            
            if not attempt or not interview:
                raise ValueError("Required interview data not found")
            
            # Format transcript for analysis
            transcript_text = self._format_transcript(attempt.get('transcript', []))
            print(f"[GRADING] Transcript text: {transcript_text}")
            
            if not transcript_text.strip():
                # No transcript to grade - should get very low score
                default_feedback = await self._create_no_interview_feedback(attempt_id, interview)
                print(f"[GRADING] Default feedback: {default_feedback}")
                
                # Save to database
                await self._save_feedback(req, attempt_id, interview, interview_type, default_feedback)
                return default_feedback
            
            # Create grading prompt using interview type config
            grading_prompt = await self._build_grading_prompt(req, interview, transcript_text, interview_type)
            print(f"[GRADING] Grading prompt: {grading_prompt}")
            
            # Check if API key is configured
            if not OPENAI_API_KEY:
                default_feedback = await self._create_fallback_feedback(attempt_id, interview)
                print(f"[GRADING] Default feedback: {default_feedback}")

                # Save to database
                await self._save_feedback(req, attempt_id, interview, interview_type, default_feedback)
                return default_feedback
            
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
            print(f"[GRADING] Response: {response}")

            response.raise_for_status()
            result = response.json()
            print(f"[GRADING] Result: {result}")
            
            # Parse the AI response
            feedback_data = json.loads(result['choices'][0]['message']['content'])
            print(f"[GRADING] Feedback data 1: {feedback_data}")
            
            # Ensure required fields exist
            feedback_data = self._validate_feedback_data(feedback_data, interview_type)
            print(f"[GRADING] Feedback data 2: {feedback_data}")
            
            # Save feedback to database
            await self._save_feedback(req, attempt_id, interview, interview_type, feedback_data)
            
            return feedback_data
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[GRADING] Error: {e}")
            
            # Try to get interview data if not already loaded
            try:
                if 'attempt' not in locals():
                    attempt = await self._get_attempt_data(req, attempt_id)
                if 'interview' not in locals():
                    interview = await self._get_interview_data(req, attempt['interview_id'])
                interview_type = InterviewType(interview.get('interview_type', InterviewType.TECHNICAL_SCREENING_CALL))
            except Exception as recovery_error:
                return {"error": "Failed to grade interview and could not create fallback"}
            
            # Create default feedback and still save it
            default_feedback = await self._create_fallback_feedback(attempt_id, interview)
            
            try:
                await self._save_feedback(req, attempt_id, interview, interview_type, default_feedback)
            except Exception as save_error:
                pass
            return default_feedback
    
    async def _save_feedback(self, req: Request, attempt_id: str, interview: Dict, 
                           interview_type: InterviewType, feedback_data: Dict):
        """Save feedback to database and mark attempt as graded"""
        
        try:
            await create_feedback(
                req,
                attempt_id,
                interview['id'] if 'id' in interview else interview.get('_id'),
                interview.get('job_id', ''),
                interview['user_id'],
                interview_type=interview_type,
                overall_score=feedback_data["overall_score"],
                strengths=feedback_data["strengths"],
                improvement_areas=feedback_data["improvement_areas"],
                detailed_feedback=feedback_data["detailed_feedback"],
                rubric_scores=feedback_data["rubric_scores"],
            )
            await update_attempt(req, attempt_id, status="graded")
            
        except Exception as save_error:
            raise
    
    def _format_transcript(self, transcript: List[Dict]) -> str:
        """Format transcript for AI analysis"""
        formatted = []
        
        for i, turn in enumerate(transcript):
            # Handle ElevenLabs format: role/message/time_in_call_secs
            speaker = turn.get('role', turn.get('speaker', 'unknown'))
            text = turn.get('message', turn.get('text', ''))
            timestamp = turn.get('time_in_call_secs', turn.get('timestamp', ''))
            
            if text.strip():
                formatted.append(f"{speaker.upper()}: {text}")
            else:
                pass
        
        return "\n".join(formatted)
    
    async def _build_grading_prompt(self, req: Request, interview: Dict, transcript: str, interview_type: InterviewType) -> str:
        """Build the grading prompt using interview type configuration"""
        config = get_interview_config(interview_type)

        print(f"[GRADING] Config: {config}")
        print(f"[GRADING] Interview: {interview}")
        print(f"[GRADING] Transcript: {transcript}")
        print(f"[GRADING] Interview type: {interview_type}")
        
        # Try to get real company and role from job document
        role = 'Software Engineer'
        company = 'the company'
        jd_structured = {}
        
        if interview.get('job_id'):
            try:
                from crud.jobs.jobs import get_job
                job = await get_job(req, interview['job_id'])
                if job:
                    role = job.role_title
                    company = job.company
                    jd_structured = job.job_description or {}
                    print(f"[GRADING] Fetched job details - Role: {role}, Company: {company}")
                else:
                    print(f"[GRADING] Job not found for job_id: {interview['job_id']}")
            except Exception as e:
                print(f"[GRADING] Error fetching job details: {str(e)}")
        
        # Fallback to interview fields if job fetch failed
        if role == 'Software Engineer':
            role = interview.get('role_title', 'Software Engineer')
        if company == 'the company':
            company = interview.get('company', 'the company')
        if not jd_structured:
            jd_structured = interview.get('jd_structured', {})
        
        print(f"[GRADING] Final Role: {role}")
        print(f"[GRADING] Final Company: {company}")
        difficulty = interview.get('difficulty', 'mid')
        print(f"[GRADING] Difficulty: {difficulty}")

        print(f"[GRADING] Jd structured: {jd_structured}")
        
        # Check if jd_structured is None or empty, and handle requirements accordingly
        if jd_structured is None or not jd_structured:
            requirements = "Standard requirements for this role."
        else:
            requirements_data = jd_structured.get('requirements', [])
            # Ensure requirements is a list
            if not isinstance(requirements_data, list):
                requirements_data = [requirements_data] if requirements_data else []
            
            # Convert list to string for prompt template
            if requirements_data:
                requirements = "\n".join([f"• {req}" for req in requirements_data])
            else:
                requirements = "Standard requirements for this role."
        
        print(f"[GRADING] Requirements: {requirements}")
        
        # Get company values if it's a values interview
        company_values = 'Innovation, Collaboration, Integrity, Customer Focus'
        if interview_type == InterviewType.VALUES_INTERVIEW:
            # Extract company values from job description or use defaults
            if jd_structured and jd_structured.get('company_values'):
                company_values = jd_structured.get('company_values')
            print(f"[GRADING] Company values: {company_values}")

        
        # Use the configured prompt template
        
        prompt = config.prompt_template.format(
            role=role,
            company=company,
            difficulty=difficulty,
            requirements=requirements,
            transcript=transcript,
            company_values=company_values
        )
        print(f"[GRADING] Prompt: {prompt}")
        
        return prompt
    
    def _validate_feedback_data(self, data: Dict, interview_type: InterviewType) -> Dict:
        """Ensure feedback data has all required fields with valid values"""
        # Get the expected rubric structure from config
        config = get_interview_config(interview_type)
        expected_rubric_keys = [criteria.key for criteria in config.rubric_criteria]
        
        # Create defaults based on interview type config
        default_rubric_scores = {}
        for key in expected_rubric_keys:
            default_rubric_scores[key] = 75
        
        defaults = {
            "overall_score": 75,
            "strengths": [
                f"Demonstrated understanding of {config.display_name} expectations",
                "Maintained professional communication",
                "Showed engagement throughout the interview"
            ],
            "improvement_areas": [
                f"Could provide more specific examples relevant to {config.display_name}",
                f"Opportunity to deepen skills in {config.improvement_focus[0]}",
                f"Consider preparing more for {config.improvement_focus[1]}"
            ],
            "detailed_feedback": f"The candidate completed the {config.display_name}. {config.description}. With focused preparation on the key areas evaluated, they can strengthen their performance in future interviews.",
            "rubric_scores": default_rubric_scores
        }
        
        # Merge with defaults for any missing fields
        for key, default_value in defaults.items():
            if key not in data or not data[key]:
                data[key] = default_value
        
        # Validate score ranges
        if not isinstance(data["overall_score"], (int, float)) or data["overall_score"] < 0 or data["overall_score"] > 100:
            data["overall_score"] = 75
        else:
            data["overall_score"] = int(data["overall_score"])
        
        # Ensure all expected rubric keys are present
        for key in expected_rubric_keys:
            if key not in data["rubric_scores"]:
                data["rubric_scores"][key] = 75
        
        # Validate each rubric score
        for category, score in data["rubric_scores"].items():
            if not isinstance(score, (int, float)) or score < 0 or score > 100:
                data["rubric_scores"][category] = 75
            else:
                data["rubric_scores"][category] = int(score)
        
        # Ensure arrays have content
        if not isinstance(data["strengths"], list) or len(data["strengths"]) == 0:
            data["strengths"] = defaults["strengths"]
        
        if not isinstance(data["improvement_areas"], list) or len(data["improvement_areas"]) == 0:
            data["improvement_areas"] = defaults["improvement_areas"]
        
        return data
    
    async def _create_no_interview_feedback(self, attempt_id: str, interview: Dict) -> Dict:
        """Create feedback for when there's no interview content (very low score)"""
        interview_type = InterviewType(interview.get('interview_type', InterviewType.TECHNICAL_SCREENING_CALL))
        config = get_interview_config(interview_type)
        
        # Create minimal rubric scores for no engagement
        minimal_rubric_scores = {}
        for criteria in config.rubric_criteria:
            minimal_rubric_scores[criteria.key] = 2  # Even lower for no transcript
        
        return {
            "overall_score": 2,
            "strengths": [
                "Interview session was initiated"
            ],
            "improvement_areas": [
                f"Must actively participate in the full {config.display_name}",
                f"Provide comprehensive responses demonstrating {config.improvement_focus[0]}",
                f"Show genuine engagement and preparation for {config.improvement_focus[1]}",
                "Demonstrate commitment by completing the entire interview process"
            ],
            "detailed_feedback": f"CRITICAL FAILURE: The {config.display_name} was not completed or had no meaningful participation. {config.description}. This represents a complete lack of engagement. Candidates must participate fully with detailed, thoughtful responses throughout the entire interview to demonstrate their capabilities and commitment.",
            "rubric_scores": minimal_rubric_scores
        }

    async def _create_fallback_feedback(self, attempt_id: str, interview: Dict) -> Dict:
        """Create fallback feedback when AI grading fails but interview content exists"""
        interview_type = InterviewType(interview.get('interview_type', InterviewType.TECHNICAL_SCREENING_CALL))
        config = get_interview_config(interview_type)
        
        # Create lower fallback scores - this is used when AI grading fails but interview content exists
        # Still should be harsh if the content suggests minimal engagement
        fallback_rubric_scores = {}
        for i, criteria in enumerate(config.rubric_criteria):
            # Lower baseline scores for fallback when AI can't grade properly
            fallback_rubric_scores[criteria.key] = 40 + (i * 3) % 10  # 40-50 range
        
        return {
            "overall_score": 40,  # Lower baseline
            "strengths": [
                f"Participated in the {config.display_name} session",
                "Maintained basic communication"
            ],
            "improvement_areas": [
                f"Provide more detailed responses in {config.improvement_focus[0]}",
                f"Demonstrate stronger preparation for {config.improvement_focus[1]}",
                f"Show greater engagement and depth in {config.improvement_focus[2] if len(config.improvement_focus) > 2 else 'relevant areas'}",
                "Consider dedicating more time to thorough interview preparation"
            ],
            "detailed_feedback": f"The {config.display_name} was completed, however the assessment system encountered technical issues during evaluation. {config.description}. While we cannot provide detailed AI-powered feedback, focus on strengthening engagement, preparation depth, and providing more comprehensive responses in future interviews.",
            "rubric_scores": fallback_rubric_scores
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
    

# Global service instance
grading_service = InterviewGradingService()

async def trigger_interview_grading(req: Request, attempt_id: str):
    """Trigger grading for an interview attempt"""
    
    try:
        feedback_data = await grading_service.grade_interview(req, attempt_id)
        return feedback_data
    except Exception as e:
        return None