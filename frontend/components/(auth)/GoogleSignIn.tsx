import { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

// constants
import Colors from '@/constants/Colors';

// context
import { useAuth } from '@/context/authentication/AuthContext';
import usePosthogSafely from '@/hooks/posthog/usePosthogSafely';


const EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;
const EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
const EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;


const GoogleSignIn = () =>
{
    const { googleLogin, googleLoginErrorMessage, googleLoginLoading } = useAuth();
    const { posthogCapture } = usePosthogSafely();

    const redirectUri = makeRedirectUri({
        scheme: Platform.OS === 'ios' ? 'com.interview-coach.app' : 'com.interviewcoach.app',
        path: '/(auth)/register',
    });

    const [request, response, promptAsync] = useAuthRequest({
        androidClientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
        iosClientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
        webClientId: EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
        scopes: ['profile', 'email'],
        redirectUri: redirectUri,
    });

    useEffect(() =>
    {
        handleGoogleSignIn();
    }, [response]);


    const handleGoogleSignIn = async () =>
    {
        console.log("🔵 GOOGLE_SIGNIN: handleGoogleSignIn called");
        console.log("🔵 GOOGLE_SIGNIN: Response:", response);
        
        if (!response) {
            console.log("🔵 GOOGLE_SIGNIN: No response, returning early");
            return;
        }
        
        if (response.type === 'success' && response.authentication)
        {
            console.log("🔵 GOOGLE_SIGNIN: Successful OAuth response received");
            console.log("🔵 GOOGLE_SIGNIN: Authentication object:", response.authentication);
            
            const token = response.authentication.idToken!;
            console.log("🔵 GOOGLE_SIGNIN: ID token extracted, calling googleLogin");
            console.log("🔵 GOOGLE_SIGNIN: Device OS:", Platform.OS);
            
            googleLogin({
                token : token,
                device_os: Platform.OS
            });
        } else {
            console.log("🔴 GOOGLE_SIGNIN: OAuth response was not successful");
            console.log("🔴 GOOGLE_SIGNIN: Response type:", response.type);
            console.log("🔴 GOOGLE_SIGNIN: Response details:", response);
        }
    }

    return (
        <TouchableOpacity 
            style={styles.signupOptionButton} 
            onPress={() => {
                posthogCapture('google_signin_button_clicked');
                promptAsync();
            }}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="logo-google" size={22} color="#4285F4" />
            </View>
            {
                googleLoginLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <Text style={styles.signupOptionButtonText}>Continue with Google</Text>
                )
            }
        </TouchableOpacity>
    )
}
export default GoogleSignIn;

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
