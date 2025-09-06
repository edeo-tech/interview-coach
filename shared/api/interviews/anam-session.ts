import { apiClient } from '../axiosConfig';

export const getAnamSessionToken = async (interviewId: string): Promise<{ sessionToken: string }> => {
  const response = await apiClient.post(`/app/anam/session-token`, null, {
    params: { interview_id: interviewId }
  });
  return response.data;
};