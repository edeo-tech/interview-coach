'use client';

import posthog from 'posthog-js';

export const initializePostHog = () => {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    if (apiKey && host) {
      posthog.init(apiKey, {
        api_host: host,
        autocapture: false,
        capture_pageview: true,
        session_recording: {
          maskAllInputs: false,
          maskAllImages: false,
        }
      });
    }
  }
};

export const usePostHogSafely = () => {
  const posthogCapture = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture(eventName, properties);
    }
  };

  const posthogIdentify = (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  };

  const posthogScreen = (screenName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture('$pageview', { 
        $current_url: window.location.href,
        screen_name: screenName,
        ...properties 
      });
    }
  };

  return {
    posthogCapture,
    posthogIdentify,
    posthogScreen
  };
};

export default posthog;