import { useMutation } from '@tanstack/react-query';
import { getConversationToken, ConversationTokenResponse } from '../../_api/interviews/conversation-token';

export const useGetConversationToken = () => {
  return useMutation<
    ConversationTokenResponse,
    Error,
    { interviewId: string; interviewType: string }
  >({
    mutationFn: ({ interviewId, interviewType }) => 
      getConversationToken(interviewId, interviewType),
  });
};