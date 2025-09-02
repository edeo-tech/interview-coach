import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  submitOnboardingAnswers,
  getOnboardingAnswers,
  deleteOnboardingAnswers
} from '../../_api/onboarding/onboarding';
import { OnboardingAnswersSubmission } from '../../_interfaces/onboarding/onboarding-answers';

export const useSubmitOnboardingAnswers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (submission: OnboardingAnswersSubmission) => submitOnboardingAnswers(submission),
    onSuccess: () => {
      // Invalidate and refetch onboarding answers
      queryClient.invalidateQueries({ queryKey: ['onboarding-answers'] });
    },
  });
};

export const useOnboardingAnswers = () => {
  return useQuery({
    queryKey: ['onboarding-answers'],
    queryFn: getOnboardingAnswers,
    retry: false, // Don't retry if user hasn't submitted answers yet
  });
};

export const useDeleteOnboardingAnswers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOnboardingAnswers,
    onSuccess: () => {
      // Invalidate and refetch onboarding answers
      queryClient.invalidateQueries({ queryKey: ['onboarding-answers'] });
    },
  });
};