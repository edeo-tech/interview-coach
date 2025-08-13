import { createContext, useContext, useEffect, useState } from "react";
import { useSegments, useRouter } from "expo-router";
import { Platform } from 'react-native';

// cookies
import { getUserId } from '@/_api/cookies';

// interfaces
import { 
    AuthenticatedUser, 
    LoginUser
} from '@/_interfaces/users/users';

// queries
import { useCheckAuth, useLogin, useLogout } from '@/_queries/users/auth/users';

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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) =>
{
    const segments = useSegments();
    const router = useRouter();
    const { posthogCapture, posthogIdentify } = usePosthogSafely();
    
    const { data: auth, isLoading: authLoading, error: authError } = useCheckAuth();
    const { mutate: login, isPending: loginLoading, error: loginError, isSuccess: loginSuccess } = useLogin();
    const { mutate: logout, isPending: logoutLoading, error: logoutError } = useLogout();

    const [loginErrorMessage, setLoginErrorMessage] = useState('');

    useEffect(() =>
    {
        if(loginError) setLoginErrorMessage(loginError.response?.data?.detail || 'Login failed. Please try again.');
    }, [loginError]);

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
            if(userId && !authError) router.replace(`/(auth)/welcome-back?userId=${userId}`);
            else router.replace('/(auth)/landing');
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
                // Purchases.logIn(auth?.id);
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
                loginErrorMessage,
                loginSuccess,
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
