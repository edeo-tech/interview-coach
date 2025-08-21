import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, CreateInterviewFromURLRequest, Interview, InterviewWithAttempts, AttemptsCountResponse } from '../../_api/interviews/interviews';

// Query keys
export const interviewKeys = {
  all: ['interviews'] as const,
  lists: () => [...interviewKeys.all, 'list'] as const,
  list: (filters: string) => [...interviewKeys.lists(), filters] as const,
  details: () => [...interviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const,
  attemptsCount: (id: string) => [...interviewKeys.all, 'attempts-count', id] as const,
};

// Hooks
export const useInterviews = (enabled: boolean = true) => {
  return useQuery({
    queryKey: interviewKeys.lists(),
    queryFn: async () => {
      const response = await interviewsApi.list();
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
    },
  });
};