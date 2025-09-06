import { useMutation } from '@tanstack/react-query';
import { getAnamSessionToken } from '../../_api/interviews/anam-session';

export const useGetAnamSessionToken = () => {
  return useMutation({
    mutationFn: (interviewId: string) => getAnamSessionToken(interviewId),
  });
};