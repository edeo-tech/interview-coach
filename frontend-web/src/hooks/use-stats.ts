'use client';

import { useQuery } from '@tanstack/react-query';
import { protectedApi } from '@/lib/api';

export interface UserStatsResponse {
    average_score: number | null;
    total_attempts: number;
}

const userStatsApi = {
    getAverageScore: () => protectedApi.get<UserStatsResponse>('/app/users/stats/average-score')
};

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