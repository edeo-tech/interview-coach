import { protectedApi } from '../axiosConfig';

export interface CreateInterviewFromURLRequest {
  job_url: string;
}

export interface CreateInterviewFromFileRequest {
  file: FormData;
}

export interface Interview {
  id: string;
  user_id: string;
  company: string;
  role_title: string;
  company_logo_url: string;
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
}

export interface InterviewAttempt {
  id: string;
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

export const interviewsApi = {
  // Interview management
  createFromURL: (data: CreateInterviewFromURLRequest) => 
    protectedApi.post<Interview>('/app/interviews/create/url', data),
  
  createFromFile: (formData: FormData) => 
    protectedApi.post<Interview>('/app/interviews/create/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  list: () => 
    protectedApi.get<Interview[]>('/app/interviews/'),
  
  get: (interviewId: string) =>
    protectedApi.get<InterviewWithAttempts>(`/app/interviews/${interviewId}`),

  getAttemptsCount: (interviewId: string) =>
    protectedApi.get<AttemptsCountResponse>(`/app/interviews/${interviewId}/attempts-count`),

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