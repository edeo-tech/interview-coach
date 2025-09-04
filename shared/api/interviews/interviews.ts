import { protectedApi } from '../axiosConfig';

export interface CreateInterviewFromURLRequest {
  job_url: string;
}

export interface CreateInterviewFromFileRequest {
  file: FormData;
}

export interface Interview {
  _id: string;
  user_id: string;
  company: string;
  role_title: string;
  company_logo_url?: string;
  brandfetch_identifier_type?: string;
  brandfetch_identifier_value?: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range: string;
  jd_raw: string;
  job_description: Record<string, any>;
  difficulty: string;
  interview_type: string;
  focus_areas: string[];
  source_type: 'url' | 'file';
  source_url?: string;
  created_at: string;
  updated_at: string;
  best_score: number;
  average_score?: number;
  total_attempts: number;
  last_attempt_date?: string;
  status: string;
}

export interface InterviewAttempt {
  _id: string;
  interview_id: string;
  status: 'active' | 'completed' | 'graded';
  agent_id?: string;
  transcript: Array<{
    role: 'user' | 'agent';
    message: string;
    time_in_call_secs: number;
  }>;
  duration_seconds: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  score?: number;
}

export interface StartAttemptResponse {
  attempt_id: string;
}

export interface InterviewWithAttempts {
  interview: Interview;
  attempts: InterviewAttempt[];
}

export interface AttemptsCountResponse {
  interview_id: string;
  attempts_count: number;
  has_attempts: boolean;
}

export interface PaginatedAttemptsResponse {
  attempts: InterviewAttempt[];
  has_more: boolean;
  total_count: number;
  current_page_size: number;
  page_number: number;
  page_size: number;
}

export const interviewsApi = {
  // Interview management
  createFromURL: (data: CreateInterviewFromURLRequest) => 
    protectedApi.post<Interview>('/app/interviews/create/url', data),
  
  createFromFile: (formData: FormData) => {
    return protectedApi.post<Interview>('/app/interviews/create/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  list: (pageSize: number = 10, pageNumber: number = 1) => 
    protectedApi.get<{
      interviews: Interview[];
      has_more: boolean;
      total_count: number;
      page_number: number;
      page_size: number;
    }>('/app/interviews/', {
      params: { page_size: pageSize, page_number: pageNumber }
    }),
  
  get: (interviewId: string) =>
    protectedApi.get<InterviewWithAttempts>(`/app/interviews/${interviewId}`),

  getAttemptsCount: (interviewId: string) =>
    protectedApi.get<AttemptsCountResponse>(`/app/interviews/${interviewId}/attempts-count`),

  getAttemptsPaginated: (interviewId: string, pageSize: number = 10, pageNumber: number = 1) =>
    protectedApi.get<PaginatedAttemptsResponse>(`/app/interviews/${interviewId}/attempts`, {
      params: { page_size: pageSize, page_number: pageNumber }
    }),

  // Interview attempts
  startAttempt: (interviewId: string) =>
    protectedApi.post<StartAttemptResponse>(`/app/interviews/${interviewId}/start`),
  
  addTranscript: (interviewId: string, turn: {
    role: 'user' | 'agent';
    message: string;
    time_in_call_secs?: number;
  }) =>
    protectedApi.post(`/app/interviews/${interviewId}/transcript`, turn),

  finishAttempt: (interviewId: string, attemptId: string, durationSeconds?: number, conversationId?: string) =>
    protectedApi.post(`/app/interviews/${interviewId}/finish`, { 
      attempt_id: attemptId,
      duration_seconds: durationSeconds,
      conversation_id: conversationId
    })
};