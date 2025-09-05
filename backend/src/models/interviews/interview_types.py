from enum import Enum


class InterviewType(str, Enum):
    GENERAL_INTERVIEW = "General Interview"  # New generic interview type
    DEMO_ONBOARDING_INTERVIEW = "Demo Onboarding Interview"
    PHONE_SCREEN = "Phone Screen"
    INITIAL_HR_INTERVIEW = "Initial HR Interview"
    MOCK_SALES_CALL = "Mock Sales Call"
    PRESENTATION_PITCH = "Presentation Pitch"
    TECHNICAL_SCREENING_CALL = "Technical Screening Call"
    SYSTEM_DESIGN_INTERVIEW = "System Design Interview"
    PORTFOLIO_REVIEW = "Portfolio Review"
    CASE_STUDY = "Case Study"
    BEHAVIORAL_INTERVIEW = "Behavioral Interview"
    VALUES_INTERVIEW = "Values Interview"
    TEAM_FIT_INTERVIEW = "Team Fit Interview"
    INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER = "Interview with Business Partner / Client Stakeholder"
    EXECUTIVE_LEADERSHIP_ROUND = "Executive / Leadership Round"