import { protectedApi } from '../axiosConfig';

export interface CreateCheckoutSessionRequest {
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface CustomerPortalResponse {
  portal_url: string;
}

export const paymentsApi = {
  // Create Stripe checkout session
  createCheckoutSession: (data: CreateCheckoutSessionRequest) =>
    protectedApi.post<CreateCheckoutSessionResponse>('/app/payments/create-checkout-session', data),
  
  // Create customer portal session
  createCustomerPortal: (returnUrl: string) =>
    protectedApi.get<CustomerPortalResponse>(`/app/payments/customer-portal?return_url=${encodeURIComponent(returnUrl)}`),
};