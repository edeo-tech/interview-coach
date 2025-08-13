import { useMemo } from 'react';
import { useAuth } from '../../context/authentication/AuthContext';
import { getCachedFeatureFlags } from '../../config/featureFlags';

export interface PremiumCheckResult {
  isPremium: boolean;
  isPaywallEnabled: boolean;
  checkPremiumFeature: (feature: string) => { hasAccess: boolean; reason?: string };
  showPaywall: () => void;
}

export const usePremiumCheck = (): PremiumCheckResult => {
  const { user } = useAuth();

  const result = useMemo(() => {
    const featureFlags = getCachedFeatureFlags();
    const isPremium = user?.is_premium || false;
    const isPaywallEnabled = featureFlags.paywallEnabled;

    const checkPremiumFeature = (feature: string) => {
      // If paywall is disabled, everyone has access
      if (!isPaywallEnabled) {
        return { hasAccess: true };
      }

      // If user is premium, they have access
      if (isPremium) {
        return { hasAccess: true };
      }

      // User is not premium and paywall is enabled
      return { 
        hasAccess: false, 
        reason: `This feature requires premium. Please upgrade to access ${feature}.`
      };
    };

    const showPaywall = () => {
      // This could be enhanced to use a navigation context or router
      // For now, we'll assume the caller handles navigation
      console.log('Redirect to paywall screen');
    };

    return {
      isPremium,
      isPaywallEnabled,
      checkPremiumFeature,
      showPaywall,
    };
  }, [user?.is_premium]);

  return result;
};

// Convenience hooks for specific features
export const useInterviewRetryCheck = () => {
  const { checkPremiumFeature, isPaywallEnabled, isPremium } = usePremiumCheck();
  const featureFlags = getCachedFeatureFlags();
  
  return {
    canRetryInterview: (hasExistingAttempts: boolean) => {
      if (!hasExistingAttempts) {
        return { canRetry: true }; // First attempt is always allowed
      }
      
      // Check specific retry feature flag
      if (!featureFlags.premiumRetryRequired) {
        return { canRetry: true }; // Retry feature is free
      }
      
      if (!isPaywallEnabled) {
        return { canRetry: true }; // Paywall disabled, allow all retries
      }
      
      if (isPremium) {
        return { canRetry: true }; // Premium users can retry
      }
      
      return { 
        canRetry: false, 
        requiresUpgrade: true,
        message: 'Upgrade to Premium to retry interviews and improve your skills!'
      };
    },
    isPaywallEnabled,
    isPremium,
  };
};

export const useFeedbackCheck = () => {
  const { checkPremiumFeature, isPaywallEnabled, isPremium } = usePremiumCheck();
  const featureFlags = getCachedFeatureFlags();
  
  return {
    canViewDetailedFeedback: () => {
      // Check specific detailed feedback feature flag
      if (!featureFlags.premiumDetailedFeedback) {
        return {
          canView: true,
          shouldBlur: false,
          upgradeMessage: undefined,
        };
      }
      
      const result = checkPremiumFeature('detailed feedback');
      return {
        canView: result.hasAccess,
        shouldBlur: !result.hasAccess && isPaywallEnabled,
        upgradeMessage: result.reason,
      };
    },
    isPaywallEnabled,
    isPremium,
  };
};

export default usePremiumCheck;