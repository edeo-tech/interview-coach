import { Platform } from 'react-native';
import { usePostHog } from 'posthog-react-native';

/**
 * A hook that safely wraps posthog.capture to only trigger on mobile platforms
 * (iOS and Android) and ignore web platforms.
 */
const usePosthogSafely = () => {
    const posthog = Platform.OS !== 'web' ? usePostHog() : null;
    
    /**
     * Captures a PostHog event only on mobile platforms (iOS/Android)
     * @param eventName The name of the event to capture
     * @param properties Optional properties to include with the event
     */
    const posthogCapture = (
        eventName: string, 
        properties?: Record<string, any>
    ) => {
        if (Platform.OS !== 'web' && posthog) {
            posthog.capture(eventName, properties);
        }
    };
    
    /**
     * Identifies a user only on mobile platforms (iOS/Android)
     * @param userId The unique identifier for the user
     * @param properties Optional properties to include with the identification
     */
    const posthogIdentify = (
        userId: string, 
        properties?: Record<string, any>
    ) => {
        if (Platform.OS !== 'web' && posthog) {
            posthog.identify(userId, properties);
        }
    };
    
    /**
     * Tracks a screen view only on mobile platforms (iOS/Android)
     * @param screenName The name of the screen being viewed
     * @param properties Optional properties to include with the screen event
     */
    const posthogScreen = (
        screenName: string,
        properties?: Record<string, any>
    ) => {
        if (Platform.OS !== 'web' && posthog) {
            posthog.screen(screenName, properties);
        }
    };
    
    return { posthogCapture, posthogIdentify, posthogScreen, posthog };
};

export default usePosthogSafely;
