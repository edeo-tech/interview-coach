import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

const Landing = () =>
{
    const router = useRouter();
    const { posthogScreen } = usePosthogSafely();
    
    useFocusEffect(() => {
        posthogScreen('auth_landing');
    });

    useEffect(() => {
        router.replace('/(auth)/login');
    }, []);

    return null;
}
export default Landing;
