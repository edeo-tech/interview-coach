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

  async getUserInterviews() {
    return protectedApi.get('/app/interviews');
  }
}

export const interviewApi = new InterviewApi();