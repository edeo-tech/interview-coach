import { protectedApi } from './api';

export interface AnamSessionTokenResponse {
  sessionToken: string;
}

export class AnamApi {
  async getSessionToken(interviewId: string) {
    return protectedApi.post<AnamSessionTokenResponse>('/app/anam/session-token', null, {
      params: { interview_id: interviewId }
    });
  }
}

export const anamApi = new AnamApi();