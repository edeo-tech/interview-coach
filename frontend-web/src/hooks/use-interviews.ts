'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { interviewApi } from '@/lib/interview-api';
import type { CreateInterviewRequest } from '@/lib/interview-api';

export const useCreateInterview = () => {
  return useMutation({
    mutationFn: (body: CreateInterviewRequest) => interviewApi.createInterview(body),
  });
};

export const useStartAttempt = () => {
  return useMutation({
    mutationFn: (interviewId: string) => interviewApi.startAttempt(interviewId),
  });
};

export const useFinishAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ interviewId, attemptId }: { interviewId: string; attemptId: string }) => 
      interviewApi.finishAttempt(interviewId, attemptId),
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

export const useUserInterviews = () => {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewApi.getUserInterviews(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};