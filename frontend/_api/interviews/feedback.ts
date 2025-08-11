import { protectedApi } from '../axiosConfig';

export interface InterviewFeedback {
  _id: string;
  attempt_id: string;
  overall_score: number;
  strengths: string[];
  improvement_areas: string[];
  detailed_feedback: string;
  rubric_scores: {
    technical_knowledge: number;
    communication: number;
    problem_solving: number;
    cultural_fit: number;
  };
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

export const feedbackApi = {
  get: (attemptId: string) => 
    protectedApi.get<InterviewFeedback>(`/app/interviews/feedback/${attemptId}`),
  
  getHistory: (limit: number = 10) => 
    protectedApi.get<FeedbackHistoryItem[]>(`/app/interviews/feedback/?limit=${limit}`),

  getStats: (userId: string) =>
    protectedApi.get<InterviewStats>(`/app/interviews/feedback/stats/${userId}`)
};