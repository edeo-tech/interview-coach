import { Platform } from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

export default function AuthIndex() {
    const { posthogScreen } = usePosthogSafely();
    
    useFocusEffect(() => {
        posthogScreen('auth_index');
    });
    
    return <Redirect href="/(app)/(tabs)/home" />;
}