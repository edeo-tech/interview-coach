import { useMutation } from '@tanstack/react-query';
import { paymentsApi, CreateCheckoutSessionRequest } from '../../_api/payments/stripe';

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: (data: CreateCheckoutSessionRequest) => paymentsApi.createCheckoutSession(data),
  });
};

export const useCreateCustomerPortal = () => {
  return useMutation({
    mutationFn: (returnUrl: string) => paymentsApi.createCustomerPortal(returnUrl),
  });
};