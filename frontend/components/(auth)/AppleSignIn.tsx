import { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';

// constants
import Colors from '@/constants/Colors';

// context
import { useAuth } from '@/context/authentication/AuthContext';
import usePosthogSafely from '@/hooks/posthog/usePosthogSafely';

const AppleSignIn = ({
    setLoginErrorMessage,
}: {
    setLoginErrorMessage: (errorMessage: string) => void;
}) =>
{
    const { appleLogin, appleLoginErrorMessage, appleLoginLoading } = useAuth();
    const { posthogCapture } = usePosthogSafely();

    useEffect(() =>
    {
        if(appleLoginErrorMessage)
        {
            console.log("🔴 APPLE_SIGNIN: Error message received:", appleLoginErrorMessage);
            setLoginErrorMessage(appleLoginErrorMessage);
        }
    }, [appleLoginErrorMessage]);

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
                setLoginErrorMessage('Apple sign-in failed. Please try again.');
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
                <Ionicons name="logo-apple" size={22} color="#000000" />
            </View>
            {
                appleLoginLoading ? (
                    <ActivityIndicator size="small" color="#1F1F1F" />
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
        borderWidth: 2,
        borderColor: Colors.dark.text,
        borderStyle: 'dashed',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: '17%',
        gap: 12,
        width: '100%',
        height: 56,
        backgroundColor: Colors.dark.background,
        ...Platform.select({
            ios: {
                shadowColor: Colors.dark.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            }
        }),
    },
    signupOptionButtonText: {
        color: '#1F1F1F',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Orbitron_600SemiBold',
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
