import { protectedApi } from '../axiosConfig';
import { OnboardingAnswers, OnboardingAnswersSubmission } from '../../_interfaces/onboarding/onboarding-answers';

export const submitOnboardingAnswers = async (
  submission: OnboardingAnswersSubmission
): Promise<{ message: string; data: OnboardingAnswers }> => {
  console.log("SUBMITTING ONBOARDING ANSWERS");
  console.log(submission);
  const response = await protectedApi.post('/app/onboarding/onboarding/submit', submission);
  return response.data;
};

export const getOnboardingAnswers = async (): Promise<{ data: OnboardingAnswers }> => {
  const response = await protectedApi.get('/app/onboarding/onboarding/answers');
  return response.data;
};

export const deleteOnboardingAnswers = async (): Promise<{ message: string }> => {
  const response = await protectedApi.delete('/app/onboarding/onboarding/answers');
  return response.data;
};