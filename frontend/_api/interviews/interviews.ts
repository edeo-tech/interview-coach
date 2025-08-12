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
    speaker: 'user' | 'agent';
    text: string;
    timestamp: string;
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

  // Interview attempts
  startAttempt: (interviewId: string) =>
    protectedApi.post<StartAttemptResponse>(`/app/interviews/${interviewId}/start`),
  
  addTranscript: (interviewId: string, turn: {
    speaker: 'user' | 'agent';
    text: string;
    timestamp?: string;
  }) =>
    protectedApi.post(`/app/interviews/${interviewId}/transcript`, turn),

  finishAttempt: (interviewId: string, attemptId: string, durationSeconds?: number) =>
    protectedApi.post(`/app/interviews/${interviewId}/finish`, { 
      attempt_id: attemptId,
      duration_seconds: durationSeconds
    })
};