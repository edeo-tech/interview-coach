import { protectedApi } from '../axiosConfig';

// Phone Screen Rubric
export interface PhoneScreenRubricScores {
  communication_clarity: number;
  enthusiasm: number;
  basic_qualifications: number;
  professionalism: number;
}

// HR Interview Rubric
export interface HRInterviewRubricScores {
  cultural_alignment: number;
  career_goals: number;
  work_experience: number;
  soft_skills: number;
}

// Sales Call Rubric
export interface SalesRubricScores {
  discovery_questioning: number;
  objection_handling: number;
  rapport_building: number;
  closing_technique: number;
}

// Presentation/Pitch Rubric
export interface PresentationRubricScores {
  presentation_structure: number;
  content_quality: number;
  delivery_skills: number;
  visual_communication: number;
}

// Technical Screening Rubric
export interface TechnicalRubricScores {
  technical_accuracy: number;
  problem_approach: number;
  coding_fundamentals: number;
  technical_communication: number;
}

// System Design Rubric
export interface SystemDesignRubricScores {
  architecture_design: number;
  scalability_thinking: number;
  trade_off_analysis: number;
  component_design: number;
}

// Portfolio Review Rubric
export interface PortfolioRubricScores {
  project_complexity: number;
  technical_depth: number;
  business_impact: number;
  innovation: number;
}

// Case Study Rubric
export interface CaseStudyRubricScores {
  problem_analysis: number;
  solution_approach: number;
  business_acumen: number;
  data_analysis: number;
}

// Behavioral Interview Rubric
export interface BehavioralRubricScores {
  star_method: number;
  self_awareness: number;
  leadership_examples: number;
  conflict_resolution: number;
}

// Values Interview Rubric
export interface ValuesRubricScores {
  values_alignment: number;
  ethical_reasoning: number;
  cultural_contribution: number;
  authenticity: number;
}

// Team Fit Interview Rubric
export interface TeamFitRubricScores {
  collaboration_style: number;
  communication_skills: number;
  adaptability: number;
  contribution_examples: number;
}

// Stakeholder Interview Rubric
export interface StakeholderRubricScores {
  stakeholder_communication: number;
  business_understanding: number;
  relationship_building: number;
  requirements_gathering: number;
}

// Executive/Leadership Rubric
export interface ExecutiveRubricScores {
  strategic_thinking: number;
  leadership_presence: number;
  business_judgment: number;
  organizational_impact: number;
}

// Union type for all rubric scores
export type RubricScores = 
  | PhoneScreenRubricScores
  | HRInterviewRubricScores
  | SalesRubricScores
  | PresentationRubricScores
  | TechnicalRubricScores
  | SystemDesignRubricScores
  | PortfolioRubricScores
  | CaseStudyRubricScores
  | BehavioralRubricScores
  | ValuesRubricScores
  | TeamFitRubricScores
  | StakeholderRubricScores
  | ExecutiveRubricScores;

// Interview Types enum to match backend
export enum InterviewType {
  PHONE_SCREEN = "Phone Screen",
  INITIAL_HR_INTERVIEW = "Initial HR Interview",
  MOCK_SALES_CALL = "Mock Sales Call",
  PRESENTATION_PITCH = "Presentation Pitch",
  TECHNICAL_SCREENING_CALL = "Technical Screening Call",
  SYSTEM_DESIGN_INTERVIEW = "System Design Interview",
  PORTFOLIO_REVIEW = "Portfolio Review",
  CASE_STUDY = "Case Study",
  BEHAVIORAL_INTERVIEW = "Behavioral Interview",
  VALUES_INTERVIEW = "Values Interview",
  TEAM_FIT_INTERVIEW = "Team Fit Interview",
  INTERVIEW_WITH_BUSINESS_PARTNER_CLIENT_STAKEHOLDER = "Interview with Business Partner / Client Stakeholder",
  EXECUTIVE_LEADERSHIP_ROUND = "Executive / Leadership Round"
}

export interface InterviewFeedback {
  _id: string;
  attempt_id: string;
  interview_type: InterviewType;
  overall_score: number;
  strengths: string[];
  improvement_areas: string[];
  detailed_feedback: string;
  rubric_scores: RubricScores;
  created_at: string;
  updated_at: string;
}

export interface FeedbackHistoryItem {
  feedback: InterviewFeedback;
  attempt: any;
  interview: any;
}

export interface InterviewStats {
  total_interviews: number;
  average_score: number;
  latest_score: number;
  improvement_trend: number[];
  top_strengths: Array<{ skill: string; count: number }>;
  common_weaknesses: Array<{ area: string; count: number }>;
  score_distribution: {
    excellent: number;
    good: number;
    fair: number;
    needs_improvement: number;
  };
}

// Helper functions to work with different rubric types
export function getRubricType(rubricScores: RubricScores): string {
  if ('communication_clarity' in rubricScores) return 'phone_screen';
  if ('cultural_alignment' in rubricScores) return 'hr_interview';
  if ('discovery_questioning' in rubricScores) return 'sales';
  if ('presentation_structure' in rubricScores) return 'presentation';
  if ('technical_accuracy' in rubricScores) return 'technical';
  if ('architecture_design' in rubricScores) return 'system_design';
  if ('project_complexity' in rubricScores) return 'portfolio';
  if ('problem_analysis' in rubricScores) return 'case_study';
  if ('star_method' in rubricScores) return 'behavioral';
  if ('values_alignment' in rubricScores) return 'values';
  if ('collaboration_style' in rubricScores) return 'team_fit';
  if ('stakeholder_communication' in rubricScores) return 'stakeholder';
  if ('strategic_thinking' in rubricScores) return 'executive';
  return 'unknown';
}

// Type guards for each rubric type
export function isPhoneScreenRubricScores(rubricScores: RubricScores): rubricScores is PhoneScreenRubricScores {
  return 'communication_clarity' in rubricScores;
}

export function isHRInterviewRubricScores(rubricScores: RubricScores): rubricScores is HRInterviewRubricScores {
  return 'cultural_alignment' in rubricScores;
}

export function isSalesRubricScores(rubricScores: RubricScores): rubricScores is SalesRubricScores {
  return 'discovery_questioning' in rubricScores;
}

export function isPresentationRubricScores(rubricScores: RubricScores): rubricScores is PresentationRubricScores {
  return 'presentation_structure' in rubricScores;
}

export function isTechnicalRubricScores(rubricScores: RubricScores): rubricScores is TechnicalRubricScores {
  return 'technical_accuracy' in rubricScores;
}

export function isSystemDesignRubricScores(rubricScores: RubricScores): rubricScores is SystemDesignRubricScores {
  return 'architecture_design' in rubricScores;
}

export function isPortfolioRubricScores(rubricScores: RubricScores): rubricScores is PortfolioRubricScores {
  return 'project_complexity' in rubricScores;
}

export function isCaseStudyRubricScores(rubricScores: RubricScores): rubricScores is CaseStudyRubricScores {
  return 'problem_analysis' in rubricScores;
}

export function isBehavioralRubricScores(rubricScores: RubricScores): rubricScores is BehavioralRubricScores {
  return 'star_method' in rubricScores;
}

export function isValuesRubricScores(rubricScores: RubricScores): rubricScores is ValuesRubricScores {
  return 'values_alignment' in rubricScores;
}

export function isTeamFitRubricScores(rubricScores: RubricScores): rubricScores is TeamFitRubricScores {
  return 'collaboration_style' in rubricScores;
}

export function isStakeholderRubricScores(rubricScores: RubricScores): rubricScores is StakeholderRubricScores {
  return 'stakeholder_communication' in rubricScores;
}

export function isExecutiveRubricScores(rubricScores: RubricScores): rubricScores is ExecutiveRubricScores {
  return 'strategic_thinking' in rubricScores;
}

export const feedbackApi = {
  get: (attemptId: string) => 
    protectedApi.get<InterviewFeedback>(`/app/interviews/feedback/${attemptId}`),
  
  getHistory: (limit: number = 10) => 
    protectedApi.get<FeedbackHistoryItem[]>(`/app/interviews/feedback/?limit=${limit}`),

  getStats: (userId: string) =>
    protectedApi.get<InterviewStats>(`/app/interviews/feedback/stats/${userId}`)
};