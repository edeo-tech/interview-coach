import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import * as jobsApi from '../../_api/jobs/jobs';

// Create job from URL
export const useCreateJobFromURL = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: jobsApi.createJobFromURL,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      return data;
    },
    onError: (error: any) => {
      console.error('Error creating job from URL:', error);
    },
  });
};

// Create job from file
export const useCreateJobFromFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.createJobFromFile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      return data;
    },
    onError: (error: any) => {
      console.error('Error creating job from file:', error);
    },
  });
};

// Get user jobs
export const useUserJobs = (limit: number = 10) => {
  return useQuery({
    queryKey: ['jobs', 'list', limit],
    queryFn: () => jobsApi.getUserJobs(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get job details with interviews
export const useJobDetails = (jobId: string) => {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => jobsApi.getJobDetails(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Start interview attempt
export const useStartJobInterviewAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, interviewId }: { jobId: string; interviewId: string }) => 
      jobsApi.startJobInterviewAttempt(jobId, interviewId),
    onSuccess: (data, variables) => {
      // Invalidate job details to update interview status
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.jobId] });
      // Invalidate interview details
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.interviewId] });
      // Invalidate interview attempts for this interview
      queryClient.invalidateQueries({ queryKey: ['interview-attempts', variables.interviewId] });
    },
    onError: (error: any) => {
      console.error('Error starting interview attempt:', error);
      Alert.alert('Error', 'Failed to start interview attempt');
    },
  });
};