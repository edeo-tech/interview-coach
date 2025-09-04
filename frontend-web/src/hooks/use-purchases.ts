'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCustomerInfo, 
  checkEntitlement, 
  getOfferings, 
  purchasePackage,
  loginRevenueCat,
  type CustomerInfo 
} from '@/lib/revenuecat';
import { useCheckAuth } from './use-auth';

export const useCustomerInfo = () => {
  return useQuery<CustomerInfo | null>({
    queryKey: ['customer-info'],
    queryFn: getCustomerInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIsEntitled = (entitlementId = 'premium') => {
  const { data: customerInfo, isLoading } = useCustomerInfo();
  const [isEntitled, setIsEntitled] = useState(false);

  useEffect(() => {
    if (customerInfo && !isLoading) {
      const entitled = customerInfo.entitlements.active[entitlementId] !== undefined;
      setIsEntitled(entitled);
    }
  }, [customerInfo, isLoading, entitlementId]);

  return { isEntitled, isLoading };
};

export const useOfferings = () => {
  return useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: purchasePackage,
    onSuccess: (customerInfo) => {
      // Update the customer info cache
      queryClient.setQueryData(['customer-info'], customerInfo);
      queryClient.invalidateQueries({ queryKey: ['customer-info'] });
    },
  });
};

export const useRevenueCatLogin = () => {
  const { data: user } = useCheckAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.id) {
      loginRevenueCat(user.id).then(customerInfo => {
        if (customerInfo) {
          queryClient.setQueryData(['customer-info'], customerInfo);
        }
      });
    }
  }, [user, queryClient]);
};

// Premium check hook that matches mobile pattern
export const usePremiumCheck = () => {
  const { isEntitled, isLoading } = useIsEntitled('premium');
  
  return {
    isPremium: isEntitled,
    loading: isLoading,
    checkPremiumStatus: async () => {
      const entitled = await checkEntitlement('premium');
      return entitled;
    }
  };
};