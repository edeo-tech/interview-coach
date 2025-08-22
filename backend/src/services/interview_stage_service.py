from typing import List, Dict, Any
from models.interviews.interview_types import InterviewType
import re


class InterviewStageService:
    """Service to determine appropriate interview stages based on job details"""
    
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