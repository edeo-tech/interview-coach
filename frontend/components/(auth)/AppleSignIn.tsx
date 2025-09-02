import { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';

// constants
import Colors from '@/constants/Colors';

// context
import { useAuth } from '@/context/authentication/AuthContext';
import usePosthogSafely from '@/hooks/posthog/usePosthogSafely';
import useHapticsSafely from '@/hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';

const AppleSignIn = () =>
{
    const { appleLogin, appleLoginErrorMessage, appleLoginLoading } = useAuth();
    const { posthogCapture } = usePosthogSafely();
    const { impactAsync } = useHapticsSafely();


    const handleAppleSignIn = async () =>
    {
        console.log("🔵 APPLE_SIGNIN: handleAppleSignIn called");
        
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            
            console.log("🔵 APPLE_SIGNIN: Successful Apple authentication");
            console.log("🔵 APPLE_SIGNIN: Credential:", credential);
            
            appleLogin({
                user_token: credential.identityToken!,
                device_os: Platform.OS
            });
        } catch (error: any) {
            console.log("🔴 APPLE_SIGNIN: Apple authentication failed:", error);
            if (error.code === 'ERR_CANCELED') {
                console.log("🔵 APPLE_SIGNIN: User cancelled Apple sign-in");
            } else {
                console.log("🔴 APPLE_SIGNIN: Non-cancellation error, will be handled by AuthContext");
            }
        }
    }

    // Only show Apple sign-in on iOS devices
    if (Platform.OS !== 'ios') {
        return null;
    }

    return (
        <TouchableOpacity 
            style={styles.signupOptionButton} 
            onPress={() => {
                impactAsync(ImpactFeedbackStyle.Light);
                posthogCapture('apple_signin_button_clicked');
                handleAppleSignIn();
            }}
        >
            {
                appleLoginLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <View style={styles.contentContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="logo-apple" size={22} color="#ffffff" />
                        </View>
                        <Text style={styles.signupOptionButtonText}>Continue with Apple</Text>
                    </View>
                )
            }
        </TouchableOpacity>
    )
}
export default AppleSignIn;

const styles = StyleSheet.create({
    signupOptionButton: {
        borderRadius: 28,
   
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        width: '100%',
        height: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        }),
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    signupOptionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    iconContainer: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
