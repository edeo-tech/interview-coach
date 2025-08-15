import { protectedApi } from '../axiosConfig';

export interface TechnicalRubricScores {
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  cultural_fit: number;
}

export interface SalesRubricScores {
  discovery_questioning: number;
  objection_handling: number;
  rapport_building: number;
  closing_technique: number;
}

export interface InterviewFeedback {
  _id: string;
  attempt_id: string;
  overall_score: number;
  strengths: string[];
  improvement_areas: string[];
  detailed_feedback: string;
  rubric_scores: TechnicalRubricScores | SalesRubricScores;
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
export function isSalesRubricScores(rubricScores: TechnicalRubricScores | SalesRubricScores): rubricScores is SalesRubricScores {
  return 'discovery_questioning' in rubricScores;
}

export function isTechnicalRubricScores(rubricScores: TechnicalRubricScores | SalesRubricScores): rubricScores is TechnicalRubricScores {
  return 'technical_knowledge' in rubricScores;
}

export const feedbackApi = {
  get: (attemptId: string) => 
    protectedApi.get<InterviewFeedback>(`/app/interviews/feedback/${attemptId}`),
  
  getHistory: (limit: number = 10) => 
    protectedApi.get<FeedbackHistoryItem[]>(`/app/interviews/feedback/?limit=${limit}`),

  getStats: (userId: string) =>
    protectedApi.get<InterviewStats>(`/app/interviews/feedback/stats/${userId}`)
};