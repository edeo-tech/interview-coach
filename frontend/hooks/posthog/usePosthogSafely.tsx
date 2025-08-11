import { Platform } from 'react-native';

/**
 * A hook that safely wraps posthog.capture to only trigger on mobile platforms
 * (iOS and Android) and ignore web platforms.
 */
const usePosthogSafely = () => {
    // Create a mock posthog object when PostHog is not available
    const posthog = {
        capture: (eventName: string, properties?: any) => {
            console.log('PostHog event:', eventName, properties);
        },
        identify: (userId: string, properties?: any) => {
            console.log('PostHog identify:', userId, properties);
        }
    };
    
    /**
     * Captures a PostHog event only on mobile platforms (iOS/Android)
     * @param eventName The name of the event to capture
     * @param properties Optional properties to include with the event
     */
    const posthogCapture = (
        eventName: string, 
        properties?: Record<string, any>
    ) => {
        if (Platform.OS !== 'web') {
            posthog.capture(eventName, properties);
        }
    };
    
    return { posthogCapture };
};

export default usePosthogSafely;
