import { protectedApi } from './api';

export interface CreateInterviewRequest {
  interview_type: string;
  job_description?: string;
}

export interface CreateInterviewResponse {
  interview_id: string;
  interview_type: string;
}

export interface StartAttemptResponse {
  attempt_id: string;
}

export interface ConversationTokenResponse {
  conversation_token: string;
  agent_metadata: {
    name: string;
    profile_picture: string;
  };
}

export class InterviewApi {
  async createInterview(body: CreateInterviewRequest) {
    return protectedApi.post<CreateInterviewResponse>('/app/interviews', body);
  }

  async createInterviewFromURL(data: { job_url: string }) {
    return protectedApi.post('/app/interviews/create/url', data);
  }

  async createInterviewFromFile(formData: FormData) {
    return protectedApi.post('/app/interviews/create/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async startAttempt(interviewId: string) {
    return protectedApi.post<StartAttemptResponse>(`/app/interviews/${interviewId}/attempts/start`);
  }

  async getConversationToken(interviewId: string, interviewType: string) {
    return protectedApi.post<ConversationTokenResponse>(
      `/app/interviews/${interviewId}/conversation-token`,
      { interview_type: interviewType }
    );
  }

  async finishAttempt(interviewId: string, attemptId: string) {
    return protectedApi.post(`/app/interviews/${interviewId}/attempts/${attemptId}/finish`);
  }

  async getInterviewFeedback(interviewId: string, attemptId: string) {
    return protectedApi.get(`/app/interviews/${interviewId}/attempts/${attemptId}/feedback`);
  }

  async getUserInterviews(params?: { skip?: number; limit?: number }) {
    const pageSize = params?.limit || 10;
    const pageNumber = params?.skip ? Math.floor(params.skip / pageSize) + 1 : 1;
    
    const response = await protectedApi.get('/app/interviews/', {
      params: { page_size: pageSize, page_number: pageNumber }
    });
    
    return response;
  }
}

export const interviewApi = new InterviewApi();