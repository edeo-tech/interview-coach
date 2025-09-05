'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCustomerInfo, 
  checkEntitlement, 
  getOfferings, 
  purchasePackage,
  initializeRevenueCat,
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
  const { data: user } = useCheckAuth();
  
  return useMutation({
    mutationFn: async (rcPackage: any) => {
      // Pass the rcPackage and optionally the user email
      console.log('Purchasing package:', rcPackage);
      return purchasePackage(rcPackage, user?.email);
    },
    onSuccess: (result) => {
      console.log('Purchase successful:', result);
      // Update the customer info cache with the result
      if (result?.customerInfo) {
        queryClient.setQueryData(['customer-info'], result.customerInfo);
      }
      queryClient.invalidateQueries({ queryKey: ['customer-info'] });
    },
  });
};

export const useRevenueCatLogin = () => {
  const { data: user } = useCheckAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.id) {
      // Re-initialize RevenueCat with the user ID
      initializeRevenueCat(user.id).then(() => {
        // After re-initialization, invalidate queries to fetch fresh data
        queryClient.invalidateQueries({ queryKey: ['customer-info'] });
        queryClient.invalidateQueries({ queryKey: ['offerings'] });
      }).catch(err => {
        console.error('Failed to initialize RevenueCat with user ID:', err);
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