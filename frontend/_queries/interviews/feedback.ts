import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { feedbackApi, InterviewFeedback, InterviewStats } from '../../_api/interviews/feedback';

// Query keys
export const feedbackKeys = {
  all: ['feedback'] as const,
  attempts: () => [...feedbackKeys.all, 'attempt'] as const,
  attempt: (attemptId: string) => [...feedbackKeys.attempts(), attemptId] as const,
  history: () => [...feedbackKeys.all, 'history'] as const,
  stats: (userId: string) => [...feedbackKeys.all, 'stats', userId] as const,
};

// Hooks
export const useAttemptFeedback = (
  attemptId: string,
  options?: Partial<UseQueryOptions<InterviewFeedback>>
) => {
  return useQuery({
    queryKey: feedbackKeys.attempt(attemptId),
    queryFn: async () => {
      const response = await feedbackApi.get(attemptId);
      return response.data;
    },
    enabled: !!attemptId,
    // Note: Polling removed - WebSocket updates handle real-time feedback notifications
    // The query will be refetched manually when WebSocket events are received
    retry: 3, // Reduced retry count since WebSocket handles updates
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...(options || {}),
  });
};

export const useFeedbackHistory = (limit: number = 10) => {
  return useQuery({
    queryKey: [...feedbackKeys.history(), limit],
    queryFn: async () => {
      const response = await feedbackApi.getHistory(limit);
      return response.data;
    },
  });
};

export const useInterviewStats = (userId: string) => {
  return useQuery({
    queryKey: feedbackKeys.stats(userId),
    queryFn: async () => {
      const response = await feedbackApi.getStats(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};