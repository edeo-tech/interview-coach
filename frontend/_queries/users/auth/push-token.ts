import { useMutation, useQueryClient } from '@tanstack/react-query';
import pushTokenApi from '@/_api/users/auth/push-token';

export const useUpdatePushToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expoPushToken: string) => {
      const response = await pushTokenApi.updatePushToken(expoPushToken);
      return response.data;
    },
    onSuccess: () => {
      // Optionally invalidate user query to refresh user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Failed to update push token:', error);
    }
  });
};