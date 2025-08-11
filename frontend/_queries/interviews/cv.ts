import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cvApi, CVProfile } from '../../_api/interviews/cv';

// Query keys
export const cvKeys = {
  all: ['cv'] as const,
  profile: () => [...cvKeys.all, 'profile'] as const,
};

// Hooks
export const useCV = () => {
  return useQuery({
    queryKey: cvKeys.profile(),
    queryFn: async () => {
      try {
        const response = await cvApi.get();
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // No CV uploaded yet
        }
        throw error;
      }
    },
  });
};

export const useUploadCV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: FormData) => cvApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.profile() });
    },
  });
};

export const useDeleteCV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cvApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.profile() });
    },
  });
};