import { useMutation } from '@tanstack/react-query';
import { submitReferralCode } from '../../_api/users/referrals';
import { ReferralSubmission, ReferralResponse } from '../../_interfaces/users/users';

export const useSubmitReferralCode = () => {
    return useMutation<ReferralResponse, Error, ReferralSubmission>({
        mutationFn: submitReferralCode,
    });
};