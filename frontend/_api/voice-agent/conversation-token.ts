import { protectedApi } from '../axiosConfig';

export interface ConversationTokenRequest {
  interview_type: string;
}

export interface ConversationTokenResponse {
  conversation_token: string;
  agent_metadata: {
    name: string;
    profile_picture: string;
  };
}

export const getConversationToken = async (
  interviewId: string,
  interviewType: string
): Promise<ConversationTokenResponse> => {
  const response = await protectedApi.post<ConversationTokenResponse>(
    `/app/interviews/${interviewId}/conversation-token`,
    { interview_type: interviewType }
  );
  return response.data;
};