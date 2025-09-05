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
    queryFn: async () => {
      try {
        return await getCustomerInfo();
      } catch (error) {
        console.error('Failed to fetch customer info:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
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
    queryFn: async () => {
      try {
        const offerings = await getOfferings();
        if (!offerings) {
          throw new Error('No offerings available');
        }
        return offerings;
      } catch (error) {
        console.error('Failed to fetch offerings:', error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
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
      // RevenueCat is already initialized at root, just login the user
      loginRevenueCat(user.id).then(customerInfo => {
        if (customerInfo) {
          queryClient.setQueryData(['customer-info'], customerInfo);
          queryClient.invalidateQueries({ queryKey: ['customer-info'] });
        }
      }).catch(err => {
        console.error('Failed to login to RevenueCat:', err);
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