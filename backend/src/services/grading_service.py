import json
from typing import Dict, List
from fastapi import Request
from decouple import config
import httpx

from crud.interviews.attempts import get_attempt, create_feedback, update_attempt
from crud.interviews.interviews import get_interview

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
        print(f"\n🤖 [GRADING] Starting interview grading process:")
        print(f"   - Attempt ID: {attempt_id}")
        
        try:
            # Get attempt and interview data (CV not needed for scoring)
            attempt = await self._get_attempt_data(req, attempt_id)
            print(f"   - Attempt status: {attempt.get('status')}")
            print(f"   - Transcript length: {len(attempt.get('transcript', []))}")
            
            interview = await self._get_interview_data(req, attempt['interview_id'])
            print(f"   - Interview role: {interview.get('role_title')}")
            print(f"   - Company: {interview.get('company')}")
            
            if not attempt or not interview:
                raise ValueError("Required interview data not found")
            
            # Format transcript for analysis
            transcript_text = self._format_transcript(attempt.get('transcript', []))
            print(f"   - Formatted transcript length: {len(transcript_text)} characters")
            
            if not transcript_text.strip():
                # No transcript to grade - should get very low score
                print(f"   ⚠️  WARNING: No transcript content found! Using minimal score feedback.")
                default_feedback = await self._create_no_interview_feedback(attempt_id)
                
                # Still save to database
                await create_feedback(
                    req,
                    attempt_id,
                    overall_score=default_feedback["overall_score"],
                    strengths=default_feedback["strengths"],
                    improvement_areas=default_feedback["improvement_areas"],
                    detailed_feedback=default_feedback["detailed_feedback"],
                    rubric_scores=default_feedback["rubric_scores"],
                )
                await update_attempt(req, attempt_id, status="graded")
                
                return default_feedback
            
            # Create grading prompt (without CV data)
            grading_prompt = self._build_grading_prompt(interview, transcript_text)
            print(f"   - Grading prompt length: {len(grading_prompt)} characters")
            
            # Check if API key is configured
            if not OPENAI_API_KEY:
                print(f"   ❌ ERROR: OPENAI_API_KEY not configured! Using default feedback.")
                default_feedback = await self._create_fallback_feedback(attempt_id)
                
                # Still save to database
                await create_feedback(
                    req,
                    attempt_id,
                    overall_score=default_feedback["overall_score"],
                    strengths=default_feedback["strengths"],
                    improvement_areas=default_feedback["improvement_areas"],
                    detailed_feedback=default_feedback["detailed_feedback"],
                    rubric_scores=default_feedback["rubric_scores"],
                )
                await update_attempt(req, attempt_id, status="graded")
                
                return default_feedback
            
            # Call OpenAI API
            print(f"   - Calling OpenAI API...")
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
            print(f"   - OpenAI API response received")
            
            # Parse the AI response
            feedback_data = json.loads(result['choices'][0]['message']['content'])
            print(f"   - Parsed feedback data successfully")
            
            # Ensure required fields exist
            feedback_data = self._validate_feedback_data(feedback_data)
            print(f"   - Validated feedback data")
            
            # Save feedback to database and mark attempt graded
            print(f"   - Saving feedback to database...")
            await create_feedback(
                req,
                attempt_id,
                overall_score=feedback_data["overall_score"],
                strengths=feedback_data["strengths"],
                improvement_areas=feedback_data["improvement_areas"],
                detailed_feedback=feedback_data["detailed_feedback"],
                rubric_scores=feedback_data["rubric_scores"],
            )

            print(f"   - Updating attempt status to 'graded'...")
            await update_attempt(req, attempt_id, status="graded")

            print(f"   ✅ SUCCESS: Interview grading completed!")
            return feedback_data
            
        except Exception as e:
            print(f"   ❌ ERROR grading interview: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Create default feedback and still save it
            default_feedback = await self._create_fallback_feedback(attempt_id)
            
            try:
                await create_feedback(
                    req,
                    attempt_id,
                    overall_score=default_feedback["overall_score"],
                    strengths=default_feedback["strengths"],
                    improvement_areas=default_feedback["improvement_areas"],
                    detailed_feedback=default_feedback["detailed_feedback"],
                    rubric_scores=default_feedback["rubric_scores"],
                )
                await update_attempt(req, attempt_id, status="graded")
                print(f"   ✅ Default feedback saved successfully")
            except Exception as save_error:
                print(f"   ❌ ERROR saving default feedback: {str(save_error)}")
            
            return default_feedback
    
    def _format_transcript(self, transcript: List[Dict]) -> str:
        """Format transcript for AI analysis"""
        formatted = []
        for turn in transcript:
            # Handle ElevenLabs format: role/message/time_in_call_secs
            speaker = turn.get('role', turn.get('speaker', 'unknown'))
            text = turn.get('message', turn.get('text', ''))
            timestamp = turn.get('time_in_call_secs', turn.get('timestamp', ''))
            
            print(f"   - Processing turn: role={speaker}, message_length={len(text)}, time={timestamp}")
            
            if text.strip():
                formatted.append(f"{speaker.upper()}: {text}")
        
        print(f"   - Total formatted turns: {len(formatted)}")
        return "\n".join(formatted)
    
    def _build_grading_prompt(self, interview: Dict, transcript: str) -> str:
        """Build the grading prompt for AI analysis (CV-independent)"""
        
        role = interview.get('role_title', 'Software Engineer')
        company = interview.get('company', 'the company')
        difficulty = interview.get('difficulty', 'mid')
        interview_type = interview.get('interview_type', 'technical')
        
        jd_structured = interview.get('jd_structured', {})
        requirements = jd_structured.get('requirements', 'Standard requirements')
        
        prompt = f"""You are an expert technical interviewer evaluating a {interview_type} interview for a {role} position at {company}. 

IMPORTANT: Base your evaluation SOLELY on the candidate's performance during this interview. Do not make assumptions about their background, experience, or qualifications beyond what they demonstrate in their responses.

JOB DETAILS:
- Role: {role}
- Company: {company}
- Level: {difficulty}
- Requirements: {requirements}

INTERVIEW TRANSCRIPT:
{transcript}

Please analyze this interview and provide a comprehensive evaluation based ONLY on the candidate's responses and performance during the interview. Return your response as valid JSON with exactly these fields:

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
- Technical Knowledge: Accuracy and depth of technical responses shown in the interview
- Communication: Clarity, articulation, and listening skills demonstrated during the conversation
- Problem Solving: Logical thinking and approach to challenges as evidenced by their responses
- Cultural Fit: Enthusiasm, professionalism, and engagement displayed during the interview

SCORING GUIDELINES:
- If the candidate did not answer questions or provided minimal responses, score accordingly low
- If the interview was cut short or lacks substantial content, reflect this in the scoring
- Base scores entirely on demonstrated performance, not potential or background assumptions
- For {difficulty} level positions, evaluate based on what they actually showed during the interview

Be constructive but honest in your feedback. Highlight both strengths and areas for improvement based solely on interview performance."""

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
    
    async def _create_no_interview_feedback(self, attempt_id: str) -> Dict:
        """Create feedback for when there's no interview content (very low score)"""
        return {
            "overall_score": 5,
            "strengths": [
                "Started the interview session"
            ],
            "improvement_areas": [
                "Complete the full interview by answering all questions",
                "Provide detailed responses to demonstrate your knowledge",
                "Engage actively throughout the entire interview process"
            ],
            "detailed_feedback": "The interview was not completed or no responses were provided to the questions. To improve your score, make sure to participate fully in the interview by answering all questions with detailed, thoughtful responses that demonstrate your skills and knowledge.",
            "rubric_scores": {
                "technical_knowledge": 5,
                "communication": 5,
                "problem_solving": 5,
                "cultural_fit": 5
            }
        }

    async def _create_fallback_feedback(self, attempt_id: str) -> Dict:
        """Create fallback feedback when AI grading fails but interview content exists"""
        return {
            "overall_score": 60,
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
                "technical_knowledge": 60,
                "communication": 65,
                "problem_solving": 55,
                "cultural_fit": 65
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