/**
 * Feature Flags Configuration
 * 
 * These flags control app features and can be updated via OTA updates
 * without requiring app store releases.
 */

export interface FeatureFlags {
  // Premium/Paywall Features
  paywallEnabled: boolean;
  
  // Premium Feature Granular Controls
  premiumRetryRequired: boolean;
  premiumDetailedFeedback: boolean;
  
  // Future feature flags can be added here
  // e.g., betaFeatures: boolean;
  // e.g., newUIEnabled: boolean;
}

// Default feature flags - can be overridden by remote config
export const defaultFeatureFlags: FeatureFlags = {
  paywallEnabled: true,
  premiumRetryRequired: false,
  premiumDetailedFeedback: true,
};

// Environment-based overrides (for development/testing)
const getEnvironmentOverrides = (): Partial<FeatureFlags> => {
  const overrides: Partial<FeatureFlags> = {};
  
  // Allow environment variable to override paywall for testing
  if (process.env.EXPO_PUBLIC_PAYWALL_ENABLED === 'false') {
    overrides.paywallEnabled = false;
  }
  
  return overrides;
};

// Remote config would be fetched here in a real implementation
// For now, this is a placeholder for future remote config integration
const getRemoteFeatureFlags = async (): Promise<Partial<FeatureFlags>> => {
  // TODO: Implement remote config fetching (Firebase Remote Config, etc.)
  // For now, return empty object to use defaults
  return {};
};

// Main function to get current feature flags
export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  try {
    const remoteFlags = await getRemoteFeatureFlags();
    const envOverrides = getEnvironmentOverrides();
    
    return {
      ...defaultFeatureFlags,
      ...remoteFlags,
      ...envOverrides, // Environment overrides take highest priority
    };
  } catch (error) {
    console.warn('Failed to fetch remote feature flags, using defaults:', error);
    return {
      ...defaultFeatureFlags,
      ...getEnvironmentOverrides(),
    };
  }
};

// Synchronous getter for when flags have already been loaded
let cachedFlags: FeatureFlags | null = null;

export const getCachedFeatureFlags = (): FeatureFlags => {
  if (!cachedFlags) {
    // Fallback to defaults with environment overrides if not loaded yet
    return {
      ...defaultFeatureFlags,
      ...getEnvironmentOverrides(),
    };
  }
  return cachedFlags;
};

export const setCachedFeatureFlags = (flags: FeatureFlags): void => {
  cachedFlags = flags;
};

// Initialize feature flags on app start
export const initializeFeatureFlags = async (): Promise<void> => {
  const flags = await getFeatureFlags();
  setCachedFeatureFlags(flags);
};