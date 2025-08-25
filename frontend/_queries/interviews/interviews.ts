import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, CreateInterviewFromURLRequest, Interview, InterviewWithAttempts, AttemptsCountResponse } from '../../_api/interviews/interviews';

// Query keys
export const interviewKeys = {
  all: ['interviews'] as const,
  lists: () => [...interviewKeys.all, 'list'] as const,
  list: (filters: string) => [...interviewKeys.lists(), filters] as const,
  details: () => [...interviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const,
  attemptsCount: (id: string) => [...interviewKeys.all, 'attempts-count', id] as const,
  attemptsList: (id: string) => [...interviewKeys.all, 'attempts-list', id] as const,
};

// Hooks
export const useInterviews = (limit?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...interviewKeys.lists(), limit],
    queryFn: async () => {
      const response = await interviewsApi.list(limit);
      return response.data;
    },
    enabled,
  });
};

export const useInterview = (interviewId: string) => {
  return useQuery({
    queryKey: interviewKeys.detail(interviewId),
    queryFn: async () => {
      const response = await interviewsApi.get(interviewId);
      return response.data;
    },
    enabled: !!interviewId,
  });
};

export const useInterviewAttemptsCount = (interviewId: string) => {
  return useQuery({
    queryKey: interviewKeys.attemptsCount(interviewId),
    queryFn: async () => {
      const response = await interviewsApi.getAttemptsCount(interviewId);
      return response.data;
    },
    enabled: !!interviewId,
  });
};

export const useInterviewAttempts = (interviewId: string, pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: [...interviewKeys.attemptsList(interviewId), pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await interviewsApi.getAttemptsPaginated(interviewId, pageSize, pageParam);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      // Use the has_more boolean from the backend to determine if there's a next page
      if (!lastPage.has_more) {
        return undefined;
      }
      // Simply return the next page number
      return lastPage.page_number + 1;
    },
    initialPageParam: 1,
    enabled: !!interviewId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateInterviewFromURL = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInterviewFromURLRequest) => interviewsApi.createFromURL(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
  });
};

export const useCreateInterviewFromFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => interviewsApi.createFromFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
  });
};

export const useStartAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (interviewId: string) => interviewsApi.startAttempt(interviewId),
    onSuccess: (_, interviewId) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(interviewId) });
    },
  });
};

export const useAddTranscript = () => {
  return useMutation({
    mutationFn: ({ 
      interviewId, 
      turn 
    }: { 
      interviewId: string; 
      turn: { role: 'user' | 'agent'; message: string; time_in_call_secs?: number } 
    }) => interviewsApi.addTranscript(interviewId, turn),
  });
};

export const useFinishAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      interviewId, 
      attemptId, 
      durationSeconds,
      conversationId 
    }: { 
      interviewId: string; 
      attemptId: string; 
      durationSeconds?: number;
      conversationId?: string;
    }) => interviewsApi.finishAttempt(interviewId, attemptId, durationSeconds, conversationId),
    onSuccess: (_, { interviewId }) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(interviewId) });
      queryClient.invalidateQueries({ queryKey: interviewKeys.attemptsCount(interviewId) });
      // Also invalidate jobs to update progress
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};