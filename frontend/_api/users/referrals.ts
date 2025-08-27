import { protectedApi } from '../axiosConfig';
import { ReferralSubmission, ReferralResponse } from '@/_interfaces/users/users';

export const submitReferralCode = async (submission: ReferralSubmission): Promise<ReferralResponse> => {
    const response = await protectedApi.post('/app/users/referrals/submit-referral', submission);
    return response.data;
};

