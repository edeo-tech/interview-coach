import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

/**
 * A hook that safely wraps Haptics functions to only trigger on mobile platforms
 * (iOS and Android) and ignore web platforms.
 */
const useHapticsSafely = () => 
{
    /**
     * Triggers impact feedback only on mobile platforms (iOS/Android)
     * @param style The impact style to use
     */
    const impactAsync = (style: ImpactFeedbackStyle) => 
    {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(style);
        }
    };

    /**
     * Triggers notification feedback only on mobile platforms (iOS/Android)
     * @param type The notification type to use
     */
    const notificationAsync = (type: NotificationFeedbackType) => 
    {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(type);
        }
    };

    /**
     * Triggers selection feedback only on mobile platforms (iOS/Android)
     */
    const selectionAsync = () => 
    {
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
    };

    return { impactAsync, notificationAsync, selectionAsync };
};

export default useHapticsSafely;
