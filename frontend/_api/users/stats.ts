import axiosConfig from '@/_api/axiosConfig';

const BASE_PATH = '/app/users/stats';

export interface UserStatsResponse {
    average_score: number | null;
    total_attempts: number;
}

class UserStatsApi {
    getAverageScore() {
        return axiosConfig.protectedApi.get(`${BASE_PATH}/average-score`);
    }
}

const userStatsApi = new UserStatsApi();
export default userStatsApi;