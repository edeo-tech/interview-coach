import { Platform } from 'react-native';
import { usePostHog } from 'posthog-react-native';

/**
 * A hook that safely wraps posthog.capture to only trigger on mobile platforms
 * (iOS and Android) and ignore web platforms.
 */
const usePosthogSafely = () => {
    const posthog = usePostHog();
    
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
