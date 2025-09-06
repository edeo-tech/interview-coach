import { protectedApi } from './api';

export interface AnamSessionTokenResponse {
  sessionToken: string;
}

export class AnamApi {
  async getSessionToken() {
    return protectedApi.post<AnamSessionTokenResponse>('/app/anam/session-token');
  }
}

export const anamApi = new AnamApi();