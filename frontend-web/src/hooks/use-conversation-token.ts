'use client';

import { useMutation } from '@tanstack/react-query';
import { protectedApi } from '@/lib/api';

export interface ConversationTokenResponse {
  conversation_token: string;
  agent_id: string;
  agent_metadata: {
    name: string;
    profile_picture: string;
  };
}

const conversationTokenApi = {
  get: (interviewId: string, interviewType: string) =>
    protectedApi.post<ConversationTokenResponse>(
      `/app/interviews/${interviewId}/conversation-token`,
      { interview_type: interviewType }
    ),
};

export const useGetConversationToken = () => {
  return useMutation({
    mutationFn: ({ interviewId, interviewType }: { interviewId: string; interviewType: string }) =>
      conversationTokenApi.get(interviewId, interviewType),
  });
};