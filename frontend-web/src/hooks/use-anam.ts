'use client';

import { useMutation } from '@tanstack/react-query';
import { anamApi } from '@/lib/anam-api';

export const useGetAnamSessionToken = () => {
  return useMutation({
    mutationFn: (interviewId: string) => anamApi.getSessionToken(interviewId),
  });
};