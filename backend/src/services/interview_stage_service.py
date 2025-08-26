from typing import List, Dict, Any, Optional, Tuple
from models.interviews.interview_types import InterviewType
import re
import asyncio


class InterviewStageService:
    """Service to determine appropriate interview stages based on job details"""
    
    @staticmethod
    async def determine_interview_stages_with_ai(
        job_data: Dict[str, Any], 
        job_processor = None,
        raw_job_content: str = None
    ) -> Tuple[List[InterviewType], Dict[str, Any]]:
        """
        Determine interview stages using AI detection first, then fallback to business rules
        
        Args:
            job_data: Dictionary containing job details
            job_processor: Optional JobProcessingService instance for AI detection
            raw_job_content: Raw job posting content for AI analysis
            
        Returns:
            Tuple of (interview_stages, metadata) where metadata contains:
            - detection_method: 'ai_primary', 'ai_enhanced', 'fallback_only'
            - ai_detection_data: Raw AI detection results
            - confidence_score: Overall confidence in stage selection
        """
        metadata = {
            "detection_method": "fallback_only",
            "ai_detection_data": None,
            "confidence_score": 0.5,
            "ai_stages_used": 0,
            "fallback_stages_used": 0
        }
        
        ai_detected_stages = []
        ai_confidence = 0.0
        
        # Try AI detection first if we have the required components
        if job_processor and raw_job_content and raw_job_content.strip():
            print("Attempting AI-based interview stage detection")
            try:
                ai_result = await job_processor.extract_interview_process(raw_job_content)
                metadata["ai_detection_data"] = ai_result
                
                if ai_result.get("confidence_score", 0.0) >= 0.6 and ai_result.get("detected_stages"):
                    print(f"AI detected {len(ai_result['detected_stages'])} stages with confidence {ai_result['confidence_score']}")
                    
                    # Map AI-detected stage names to our InterviewType enum
                    ai_detected_stages = InterviewStageService._map_ai_stages_to_enum(
                        ai_result["detected_stages"]
                    )
                    ai_confidence = ai_result["confidence_score"]
                    
                    print(f"Mapped {len(ai_detected_stages)} AI stages to valid InterviewTypes")
                
            except Exception as e:
                print(f"AI stage detection failed: {str(e)}")
                # Continue with fallback
        
        # Get fallback stages using existing business rules
        fallback_stages = InterviewStageService.determine_interview_stages(job_data)
        
        # Determine which stages to use based on AI confidence and coverage
        if ai_detected_stages and ai_confidence >= 0.7 and len(ai_detected_stages) >= 2:
            # High confidence AI detection with sufficient stages
            final_stages = InterviewStageService._enhance_ai_stages_with_fallback(
                ai_detected_stages, fallback_stages, job_data
            )
            metadata["detection_method"] = "ai_primary"
            metadata["ai_stages_used"] = len(ai_detected_stages)
            metadata["fallback_stages_used"] = len(final_stages) - len(ai_detected_stages)
            metadata["confidence_score"] = ai_confidence * 0.8 + 0.2  # Boost for AI detection
            
        elif ai_detected_stages and ai_confidence >= 0.5:
            # Medium confidence - use AI stages as enhancement to fallback
            final_stages = InterviewStageService._merge_ai_with_fallback(
                ai_detected_stages, fallback_stages, job_data
            )
            metadata["detection_method"] = "ai_enhanced"
            metadata["ai_stages_used"] = len([s for s in final_stages if s in ai_detected_stages])
            metadata["fallback_stages_used"] = len(final_stages) - metadata["ai_stages_used"]
            metadata["confidence_score"] = (ai_confidence * 0.6) + 0.4  # Blend confidence
            
        else:
            # Low confidence or no AI detection - use fallback only
            final_stages = fallback_stages
            metadata["detection_method"] = "fallback_only"
            metadata["ai_stages_used"] = 0
            metadata["fallback_stages_used"] = len(final_stages)
            metadata["confidence_score"] = 0.7  # Decent confidence in business rules
        
        print(f"Final stage determination: {metadata['detection_method']} - {len(final_stages)} total stages")
        print(f"Stages: {[stage.value for stage in final_stages]}")
        
        return final_stages, metadata

    @staticmethod
    def determine_interview_stages(job_data: Dict[str, Any]) -> List[InterviewType]:
        """
        Determine the appropriate interview stages based on job details
        
        Args:
            job_data: Dictionary containing job details including:
                - role_title: Job title
                - experience_level: junior/mid/senior/lead/principal
                - job_description: Parsed job description
                - company: Company name
                
        Returns:
            List of InterviewType enums representing the interview stages
        """
        stages = []
        
        role_title = job_data.get("role_title", "").lower()
        experience_level = job_data.get("experience_level", "mid").lower()
        job_desc = job_data.get("job_description", {})
        company = job_data.get("company", "").lower()
        
        # Always start with phone screen
        stages.append(InterviewType.PHONE_SCREEN)
        
        # Determine role type
        is_sales = any(keyword in role_title for keyword in ["sales", "account", "business development", "bd"])
        is_engineering = any(keyword in role_title for keyword in ["engineer", "developer", "programmer", "architect", "devops", "sre"])
        is_leadership = any(keyword in role_title for keyword in ["manager", "director", "vp", "vice president", "head of", "lead", "principal"])
        is_design = any(keyword in role_title for keyword in ["design", "ux", "ui", "product designer"])
        
        # Add role-specific stages
        if is_sales:
            stages.append(InterviewType.MOCK_SALES_CALL)
            if experience_level in ["senior", "lead", "principal"]:
                stages.append(InterviewType.PRESENTATION_PITCH)
        
        elif is_engineering:
            stages.append(InterviewType.TECHNICAL_SCREENING_CALL)
            if experience_level not in ["junior", "entry"]:
                stages.append(InterviewType.SYSTEM_DESIGN_INTERVIEW)
        
        elif is_design:
            stages.append(InterviewType.PORTFOLIO_REVIEW)
            if experience_level in ["senior", "lead", "principal"]:
                stages.append(InterviewType.CASE_STUDY)
        
        # Add behavioral interview for most roles
        if not is_sales:  # Sales roles often have behavioral questions integrated
            stages.append(InterviewType.BEHAVIORAL_INTERVIEW)
        
        # Add leadership-specific stages
        if is_leadership or experience_level in ["lead", "principal", "senior"]:
            if InterviewType.CASE_STUDY not in stages:
                stages.append(InterviewType.CASE_STUDY)
        
        # Company culture stages
        if any(keyword in company for keyword in ["google", "meta", "facebook", "amazon", "apple", "microsoft"]):
            stages.append(InterviewType.VALUES_INTERVIEW)
        else:
            stages.append(InterviewType.TEAM_FIT_INTERVIEW)
        
        # Executive round for senior positions
        if experience_level in ["principal", "staff", "distinguished"] or is_leadership:
            stages.append(InterviewType.EXECUTIVE_LEADERSHIP_ROUND)
        
        # Special case: if role mentions working with clients/stakeholders
        if any(keyword in role_title or str(job_desc).lower() for keyword in ["client", "stakeholder", "customer success", "partner"]):
            if InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER not in stages:
                stages.append(InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_stages = []
        for stage in stages:
            if stage not in seen:
                seen.add(stage)
                unique_stages.append(stage)
        
        return unique_stages
    
    @staticmethod
    def get_stage_difficulty(interview_type: InterviewType, experience_level: str) -> str:
        """
        Determine difficulty level for a specific interview stage
        
        Args:
            interview_type: The type of interview
            experience_level: The candidate's experience level
            
        Returns:
            Difficulty level: easy/mid/hard
        """
        # Map experience levels to base difficulty
        difficulty_map = {
            "junior": "easy",
            "entry": "easy",
            "mid": "mid",
            "senior": "hard",
            "lead": "hard",
            "principal": "hard",
            "staff": "hard",
            "distinguished": "hard"
        }
        
        base_difficulty = difficulty_map.get(experience_level.lower(), "mid")
        
        # Adjust based on interview type
        if interview_type in [InterviewType.PHONE_SCREEN, InterviewType.INITIAL_HR_INTERVIEW]:
            return "easy"
        elif interview_type in [InterviewType.SYSTEM_DESIGN_INTERVIEW, InterviewType.CASE_STUDY]:
            return "hard" if base_difficulty != "easy" else "mid"
        elif interview_type == InterviewType.EXECUTIVE_LEADERSHIP_ROUND:
            return "hard"
        
        return base_difficulty
    
    @staticmethod
    def get_stage_focus_areas(interview_type: InterviewType, job_data: Dict[str, Any]) -> List[str]:
        """
        Determine focus areas for a specific interview stage
        
        Args:
            interview_type: The type of interview
            job_data: Job details including tech stack and requirements
            
        Returns:
            List of focus areas for the interview
        """
        focus_areas = []
        tech_stack = job_data.get("tech_stack", [])
        
        if interview_type == InterviewType.TECHNICAL_SCREENING_CALL:
            # Use tech stack from job description
            focus_areas = tech_stack[:5] if tech_stack else ["Problem Solving", "Algorithms", "Data Structures"]
        
        elif interview_type == InterviewType.SYSTEM_DESIGN_INTERVIEW:
            focus_areas = ["System Architecture", "Scalability", "Database Design", "API Design", "Distributed Systems"]
        
        elif interview_type == InterviewType.BEHAVIORAL_INTERVIEW:
            focus_areas = ["Leadership", "Teamwork", "Problem Solving", "Communication", "Conflict Resolution"]
        
        elif interview_type == InterviewType.MOCK_SALES_CALL:
            focus_areas = ["Sales Pitch", "Objection Handling", "Discovery Questions", "Closing Techniques", "Product Knowledge"]
        
        elif interview_type == InterviewType.PORTFOLIO_REVIEW:
            focus_areas = ["Design Process", "Case Studies", "User Research", "Visual Design", "Problem Solving"]
        
        elif interview_type == InterviewType.VALUES_INTERVIEW:
            focus_areas = ["Company Culture Fit", "Core Values Alignment", "Mission Understanding", "Ethical Decision Making"]
        
        elif interview_type == InterviewType.TEAM_FIT_INTERVIEW:
            focus_areas = ["Collaboration", "Communication Style", "Work Preferences", "Team Dynamics", "Cultural Add"]
        
        elif interview_type == InterviewType.CASE_STUDY:
            focus_areas = ["Analytical Thinking", "Problem Structuring", "Business Acumen", "Presentation Skills", "Strategic Thinking"]
        
        elif interview_type == InterviewType.EXECUTIVE_LEADERSHIP_ROUND:
            focus_areas = ["Vision & Strategy", "Leadership Philosophy", "Change Management", "Business Impact", "Stakeholder Management"]
        
        else:
            focus_areas = ["General Interview Skills", "Communication", "Professional Experience"]
        
        return focus_areas
    
    @staticmethod
    def _map_ai_stages_to_enum(ai_stages: List[str]) -> List[InterviewType]:
        """
        Map AI-detected stage names to InterviewType enum values
        """
        stage_mappings = {
            # Direct mappings
            "phone screen": InterviewType.PHONE_SCREEN,
            "phone screening": InterviewType.PHONE_SCREEN,
            "initial phone call": InterviewType.PHONE_SCREEN,
            "recruiter call": InterviewType.PHONE_SCREEN,
            "hr interview": InterviewType.INITIAL_HR_INTERVIEW,
            "initial hr interview": InterviewType.INITIAL_HR_INTERVIEW,
            
            # Technical interviews
            "technical interview": InterviewType.TECHNICAL_SCREENING_CALL,
            "technical screening": InterviewType.TECHNICAL_SCREENING_CALL,
            "technical assessment": InterviewType.TECHNICAL_SCREENING_CALL,
            "coding interview": InterviewType.TECHNICAL_SCREENING_CALL,
            "technical round": InterviewType.TECHNICAL_SCREENING_CALL,
            
            # System design
            "system design": InterviewType.SYSTEM_DESIGN_INTERVIEW,
            "system design interview": InterviewType.SYSTEM_DESIGN_INTERVIEW,
            "architecture interview": InterviewType.SYSTEM_DESIGN_INTERVIEW,
            "design interview": InterviewType.SYSTEM_DESIGN_INTERVIEW,
            
            # Sales specific
            "sales interview": InterviewType.MOCK_SALES_CALL,
            "mock sales call": InterviewType.MOCK_SALES_CALL,
            "sales roleplay": InterviewType.MOCK_SALES_CALL,
            "presentation": InterviewType.PRESENTATION_PITCH,
            "pitch presentation": InterviewType.PRESENTATION_PITCH,
            
            # Portfolio and case studies
            "portfolio review": InterviewType.PORTFOLIO_REVIEW,
            "portfolio presentation": InterviewType.PORTFOLIO_REVIEW,
            "case study": InterviewType.CASE_STUDY,
            "case study presentation": InterviewType.CASE_STUDY,
            "business case": InterviewType.CASE_STUDY,
            
            # Behavioral and cultural
            "behavioral interview": InterviewType.BEHAVIORAL_INTERVIEW,
            "behavioral round": InterviewType.BEHAVIORAL_INTERVIEW,
            "cultural fit": InterviewType.TEAM_FIT_INTERVIEW,
            "team fit": InterviewType.TEAM_FIT_INTERVIEW,
            "culture interview": InterviewType.TEAM_FIT_INTERVIEW,
            "values interview": InterviewType.VALUES_INTERVIEW,
            "culture fit": InterviewType.TEAM_FIT_INTERVIEW,
            
            # Final rounds
            "final interview": InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
            "final round": InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
            "executive interview": InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
            "leadership round": InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
            "ceo interview": InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
            "executive round": InterviewType.EXECUTIVE_LEADERSHIP_ROUND,
            
            # Stakeholder interviews
            "client interview": InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER,
            "stakeholder interview": InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER,
            "business partner interview": InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER,
        }
        
        mapped_stages = []
        for stage_name in ai_stages:
            if not isinstance(stage_name, str):
                continue
                
            stage_name_clean = stage_name.lower().strip()
            
            # Try exact match first
            if stage_name_clean in stage_mappings:
                mapped_stage = stage_mappings[stage_name_clean]
                if mapped_stage not in mapped_stages:
                    mapped_stages.append(mapped_stage)
                    print(f"Mapped '{stage_name}' -> {mapped_stage.value}")
            else:
                # Try partial matches for flexibility
                found_match = False
                for pattern, interview_type in stage_mappings.items():
                    if pattern in stage_name_clean or stage_name_clean in pattern:
                        if interview_type not in mapped_stages:
                            mapped_stages.append(interview_type)
                            print(f"Partially mapped '{stage_name}' -> {interview_type.value}")
                            found_match = True
                            break
                
                if not found_match:
                    print(f"Could not map AI stage: '{stage_name}'")
        
        return mapped_stages
    
    @staticmethod
    def _enhance_ai_stages_with_fallback(
        ai_stages: List[InterviewType], 
        fallback_stages: List[InterviewType],
        job_data: Dict[str, Any]
    ) -> List[InterviewType]:
        """
        Use AI stages as primary, but add essential fallback stages if missing
        """
        final_stages = ai_stages.copy()
        
        # Always ensure we have a phone screen at the beginning
        if InterviewType.PHONE_SCREEN not in final_stages:
            final_stages.insert(0, InterviewType.PHONE_SCREEN)
            print("Added missing Phone Screen to AI-detected stages")
        
        # Add behavioral interview for non-sales roles if missing
        role_title = job_data.get("role_title", "").lower()
        is_sales = any(keyword in role_title for keyword in ["sales", "account", "business development"])
        
        if not is_sales and InterviewType.BEHAVIORAL_INTERVIEW not in final_stages:
            # Insert behavioral interview before final stages
            insert_pos = len(final_stages) - 1 if len(final_stages) > 1 else len(final_stages)
            final_stages.insert(insert_pos, InterviewType.BEHAVIORAL_INTERVIEW)
            print("Added missing Behavioral Interview to AI-detected stages")
        
        # Add team fit interview if no cultural interview exists
        cultural_stages = [
            InterviewType.VALUES_INTERVIEW,
            InterviewType.TEAM_FIT_INTERVIEW
        ]
        if not any(stage in final_stages for stage in cultural_stages):
            final_stages.append(InterviewType.TEAM_FIT_INTERVIEW)
            print("Added missing Team Fit Interview to AI-detected stages")
        
        return final_stages
    
    @staticmethod
    def _merge_ai_with_fallback(
        ai_stages: List[InterviewType], 
        fallback_stages: List[InterviewType],
        job_data: Dict[str, Any]
    ) -> List[InterviewType]:
        """
        Merge AI-detected stages with fallback stages, giving preference to AI where there's overlap
        """
        # Start with fallback stages as base
        final_stages = fallback_stages.copy()
        
        # Replace or insert AI stages where appropriate
        for ai_stage in ai_stages:
            if ai_stage not in final_stages:
                # Determine best insertion point based on stage type
                insert_pos = InterviewStageService._get_stage_insertion_position(
                    ai_stage, final_stages
                )
                final_stages.insert(insert_pos, ai_stage)
                print(f"Inserted AI stage {ai_stage.value} at position {insert_pos}")
        
        # Remove duplicates while preserving order
        seen = set()
        merged_stages = []
        for stage in final_stages:
            if stage not in seen:
                seen.add(stage)
                merged_stages.append(stage)
        
        return merged_stages
    
    @staticmethod
    def _get_stage_insertion_position(stage: InterviewType, existing_stages: List[InterviewType]) -> int:
        """
        Determine the best position to insert a stage based on typical interview flow
        """
        # Define typical stage order priorities (lower number = earlier in process)
        stage_priorities = {
            InterviewType.PHONE_SCREEN: 0,
            InterviewType.INITIAL_HR_INTERVIEW: 1,
            InterviewType.TECHNICAL_SCREENING_CALL: 2,
            InterviewType.PORTFOLIO_REVIEW: 2,
            InterviewType.MOCK_SALES_CALL: 2,
            InterviewType.SYSTEM_DESIGN_INTERVIEW: 3,
            InterviewType.CASE_STUDY: 3,
            InterviewType.PRESENTATION_PITCH: 3,
            InterviewType.BEHAVIORAL_INTERVIEW: 4,
            InterviewType.VALUES_INTERVIEW: 5,
            InterviewType.TEAM_FIT_INTERVIEW: 5,
            InterviewType.INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER: 6,
            InterviewType.EXECUTIVE_LEADERSHIP_ROUND: 7,
        }
        
        new_stage_priority = stage_priorities.get(stage, 5)  # Default to middle
        
        # Find insertion point
        for i, existing_stage in enumerate(existing_stages):
            existing_priority = stage_priorities.get(existing_stage, 5)
            if new_stage_priority < existing_priority:
                return i
        
        # If no suitable position found, append at end
        return len(existing_stages)