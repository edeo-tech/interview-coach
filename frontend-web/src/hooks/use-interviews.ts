'use client';

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { interviewApi } from '@/lib/interview-api';
import type { CreateInterviewRequest } from '@/lib/interview-api';

export const useCreateInterview = () => {
  return useMutation({
    mutationFn: (body: CreateInterviewRequest) => interviewApi.createInterview(body),
  });
};

export const useCreateInterviewFromURL = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { job_url: string }) => 
      interviewApi.createInterviewFromURL(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};

export const useCreateInterviewFromFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => 
      interviewApi.createInterviewFromFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};

export const useStartAttempt = () => {
  return useMutation({
    mutationFn: (interviewId: string) => interviewApi.startAttempt(interviewId),
  });
};

export const useAddTranscript = () => {
  return useMutation({
    mutationFn: ({ interviewId, turn }: { 
      interviewId: string; 
      turn: {
        role: 'user' | 'agent';
        message: string;
        time_in_call_secs?: number;
      }
    }) => interviewApi.addTranscript(interviewId, turn),
  });
};

export const useFinishAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ interviewId, attemptId, durationSeconds, conversationId }: { 
      interviewId: string; 
      attemptId: string;
      durationSeconds?: number;
      conversationId?: string;
    }) => 
      interviewApi.finishAttempt(interviewId, attemptId, durationSeconds, conversationId),
    onSuccess: () => {
      // Invalidate interviews cache to refresh list
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};

export const useGetConversationToken = () => {
  return useMutation({
    mutationFn: ({ interviewId, interviewType }: { interviewId: string; interviewType: string }) => 
      interviewApi.getConversationToken(interviewId, interviewType),
  });
};

export const useInterviewFeedback = (interviewId: string, attemptId: string) => {
  return useQuery({
    queryKey: ['interview-feedback', interviewId, attemptId],
    queryFn: () => interviewApi.getInterviewFeedback(interviewId, attemptId),
    enabled: !!interviewId && !!attemptId,
  });
};

export const useUserInterviews = (limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: ['interviews', limit],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await interviewApi.getUserInterviews({ skip: pageParam, limit });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.has_more) return undefined;
      const totalFetched = allPages.reduce((sum, page) => sum + (page.interviews?.length || 0), 0);
      return totalFetched;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInterview = (interviewId: string) => {
  return useQuery({
    queryKey: ['interview', interviewId],
    queryFn: async () => {
      const response = await interviewApi.getInterview(interviewId);
      return response.data;
    },
    enabled: !!interviewId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInterviewAttemptsCount = (interviewId: string) => {
  return useQuery({
    queryKey: ['interview-attempts-count', interviewId],
    queryFn: async () => {
      const response = await interviewApi.getInterviewAttemptsCount(interviewId);
      return response.data;
    },
    enabled: !!interviewId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useInterviewAttempts = (interviewId: string, limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: ['interview-attempts', interviewId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await interviewApi.getInterviewAttempts(interviewId, limit, pageParam);
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.has_more) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!interviewId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};