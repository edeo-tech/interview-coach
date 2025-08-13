import { View, Text, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

const WelcomeBack = () =>
{
    const { posthogScreen } = usePosthogSafely();
    
    useFocusEffect(() => {
        posthogScreen('auth_welcome_back');
    });
    
    return (
        <View>
            <Text>welcome-back</Text>
        </View>
    )
}
export default WelcomeBack;
