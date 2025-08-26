import { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';

// constants
import Colors from '@/constants/Colors';

// context
import { useAuth } from '@/context/authentication/AuthContext';
import usePosthogSafely from '@/hooks/posthog/usePosthogSafely';

const AppleSignIn = () =>
{
    const { appleLogin, appleLoginErrorMessage, appleLoginLoading } = useAuth();
    const { posthogCapture } = usePosthogSafely();


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
                posthogCapture('apple_signin_button_clicked');
                handleAppleSignIn();
            }}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="logo-apple" size={22} color="#ffffff" />
            </View>
            {
                appleLoginLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <Text style={styles.signupOptionButtonText}>Continue with Apple</Text>
                )
            }
        </TouchableOpacity>
    )
}
export default AppleSignIn;

const styles = StyleSheet.create({
    signupOptionButton: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        gap: 12,
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
    signupOptionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginLeft: -36, // Offset for icon to center text
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
