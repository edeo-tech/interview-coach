import { useQuery } from '@tanstack/react-query';
import userStatsApi, { UserStatsResponse } from '@/_api/users/stats';

export const useUserStats = () => {
    return useQuery({
        queryKey: ['user', 'stats'],
        queryFn: async (): Promise<UserStatsResponse> => {
            const response = await userStatsApi.getAverageScore();
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};