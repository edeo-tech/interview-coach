import { createContext, useContext, useEffect, useState } from "react";
import { useSegments, useRouter } from "expo-router";
import { Platform } from 'react-native';

// cookies
import { getUserId } from '@/_api/cookies';

// hooks
import useSecureStore from '@/hooks/secure-store/useSecureStore';

// interfaces
import { 
    AuthenticatedUser, 
    LoginUser,
    GoogleLoginBody,
    AppleLoginBody
} from '@/_interfaces/users/users';

// queries
import { useCheckAuth, useLogin, useLogout, useGoogleLogin, useAppleLogin } from '@/_queries/users/auth/users';

// utils
import Purchases from 'react-native-purchases';

// hooks
import usePosthogSafely from '@/hooks/posthog/usePosthogSafely';


type AuthContextType = {
    auth: AuthenticatedUser | undefined;
    authLoading: boolean;
    login: (body: LoginUser) => void;
    logout: () => void;
    loginLoading: boolean;
    logoutLoading: boolean;
    loginErrorMessage: string;
    loginSuccess: boolean;
    logoutError: Error | null;
    logoutSuccess: boolean;
    logoutErrorMessage: string;
    googleLogin: (body: GoogleLoginBody) => void;
    googleLoginLoading: boolean;
    googleLoginErrorMessage: string;
    appleLogin: (body: AppleLoginBody) => void;
    appleLoginLoading: boolean;
    appleLoginErrorMessage: string;
    clearLoginError: () => void;
    clearGoogleLoginError: () => void;
    clearAppleLoginError: () => void;
    clearLogoutError: () => void;
    resetLogout: () => void;
    resetLogin: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) =>
{
    const segments = useSegments();
    const router = useRouter();
    const { posthogCapture, posthogIdentify } = usePosthogSafely();
    
    const { data: auth, isLoading: authLoading, error: authError } = useCheckAuth();
    const { mutate: login, isPending: loginLoading, error: loginError, isSuccess: loginSuccess, reset: resetLogin } = useLogin({posthogIdentify, posthogCapture});
    const { mutate: logout, isPending: logoutLoading, error: logoutError, isSuccess: logoutSuccess, reset: resetLogout } = useLogout();
    const {
        mutate: googleLogin,
        isPending: googleLoginLoading,
        error: googleLoginError,
    } = useGoogleLogin({posthogIdentify, posthogCapture});
    const {
        mutate: appleLogin,
        isPending: appleLoginLoading,
        error: appleLoginError,
    } = useAppleLogin({posthogIdentify, posthogCapture});

    const [loginErrorMessage, setLoginErrorMessage] = useState('');
    const [googleLoginErrorMessage, setGoogleLoginErrorMessage] = useState('');
    const [appleLoginErrorMessage, setAppleLoginErrorMessage] = useState('');
    const [logoutErrorMessage, setLogoutErrorMessage] = useState('');

    const clearLoginError = () => setLoginErrorMessage('');
    const clearGoogleLoginError = () => setGoogleLoginErrorMessage('');
    const clearAppleLoginError = () => setAppleLoginErrorMessage('');
    const clearLogoutError = () => setLogoutErrorMessage('');


    useEffect(() =>
    {
        if(loginError) setLoginErrorMessage(loginError.response?.data?.detail || 'Login failed. Please try again.');
        if(googleLoginError) {
            console.log("🔴 AUTH_CONTEXT: Google login error detected:", googleLoginError);
            const errorMessage = googleLoginError.response?.data?.detail || 'Google login failed. Please try again.';
            setGoogleLoginErrorMessage(errorMessage);
        }
        if(appleLoginError) {
            console.log("🔴 AUTH_CONTEXT: Apple login error detected:", appleLoginError);
            const errorMessage = appleLoginError.response?.data?.detail || 'Apple login failed. Please try again.';
            setAppleLoginErrorMessage(errorMessage);
        }
        if(logoutError) {
            console.log("🔴 AUTH_CONTEXT: Logout error detected:", logoutError);
            const errorMessage = logoutError.response?.data?.detail || 'Logout failed. Please try again.';
            setLogoutErrorMessage(errorMessage);
        }
    }, [loginError, googleLoginError, appleLoginError, logoutError]);


    const navigate = async () =>
    {
        console.log('auth', auth);
        console.log('segments', segments);
        console.log('authLoading', authLoading);
        console.log('authError', authError);
        
        // If there's an auth error or no auth, redirect to login from protected routes
        if((!auth?.id || authError) && segments[0] === '(app)')
        {
            const userId = await getUserId();
            const { getItem } = useSecureStore();
            
            // Check if we have user metadata stored (returning user)
            const storedUserName = await getItem('user_name');
            
            if(userId && storedUserName && !authError) {
                // Returning user - go to login screen
                router.replace('/(auth)/login');
            } else {
                // New user - go to welcome screen
                router.replace('/(auth)/welcome');
            }
        }
    }

    // Only perform navigation when we're not on the root index
    useEffect(() => {
        // Skip navigation logic if we're still loading auth
        if (authLoading) return;
        navigate();
    }, [auth, authLoading, authError, segments]);

    useEffect(() =>
    {
        if(auth?.id)
        {
            if(Platform.OS !== 'web')
            {
                Purchases.logIn(auth?.id);
                Purchases.setEmail(auth?.email);
                
                posthogIdentify(auth?.id, {
                    name: auth?.name,
                    email: auth?.email,
                    os: Platform.OS,
                });
            }

            posthogCapture('sign_in', { type: 'token' });
        }
    }, [auth]);

    return (
        <AuthContext.Provider 
            value={{ 
                auth,
                authLoading,
                login,
                logout,
                loginLoading,
                logoutLoading,
                logoutError,
                logoutSuccess,
                logoutErrorMessage,
                loginErrorMessage,
                loginSuccess,
                googleLogin,
                googleLoginLoading,
                googleLoginErrorMessage,
                appleLogin,
                appleLoginLoading,
                appleLoginErrorMessage,
                clearLoginError,
                clearGoogleLoginError,
                clearAppleLoginError,
                clearLogoutError,
                resetLogout,
                resetLogin,
            }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => 
{
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
