import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Router } from 'expo-router';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// api
import usersAuthApi from '@/_api/users/auth/users';

// cookies
import { clearAllCookies, setAccessToken, setRefreshToken, setUserId } from '@/_api/cookies';

// interfaces
import { 
    LoginUser,
    RegisterUser,
    LoginResponse,
    AuthenticatedUser,
    UpdateUserProfile,
    SubscriptionDetails,
    AppleLoginBody,
    ThirdPartyLoginResponse,
    GoogleLoginBody
} from '@/_interfaces/users/users';

// hooks
import usePosthogSafely from '@/hooks/posthog/usePosthogSafely';
import useSecureStore from '@/hooks/secure-store/useSecureStore';




const post_login_logic = async (
    response: LoginResponse | ThirdPartyLoginResponse,
    queryClient: QueryClient,
    router: Router,
    posthogIdentify?: (userId: string, properties?: Record<string, any>) => void,
    posthogCapture?: (eventName: string, properties?: Record<string, any>) => void,
    signInType?: 'email' | 'google' | 'apple',
    isFromRegistration?: boolean
) =>
{
    // Set tokens in secure storage
    await setAccessToken(response.tokens.access_token);
    await setRefreshToken(response.tokens.refresh_token);
    await setUserId(response.user.id);
    
    // Store user metadata for returning users
    const { setItem } = useSecureStore();
    await setItem('user_name', response.user.name);
    if (signInType) {
        await setItem('last_sign_in_type', signInType);
    }
    
    // Check if this is a new user (first-time login after registration)
    const isNewUser = (response as ThirdPartyLoginResponse).sign_up || isFromRegistration || false;

    if(Platform.OS !== 'web')
    {
        // Purchases.logIn(response.user.id);
        // Purchases.setEmail(response.user.email);
        
        if (posthogIdentify) {
            posthogIdentify(response.user.id, {
                name: response.user.name,
                email: response.user.email,
                os: Platform.OS,
            });
        }
    }

    // Update auth cache with the new user data
    queryClient.setQueryData(['auth'], response.user);

    // Track login event
    if (posthogCapture) {
        posthogCapture('sign_in', { type: 'password' });
    }

    // Navigate based on whether this is a new user or returning user
    if (isNewUser) {
        // First-time login after registration - start onboarding
        router.replace('/(onboarding)/cv-upload');
    } else {
        // Returning user - go directly to home
        router.replace('/(app)/(tabs)/home');
    }
}


// register query
export const useRegister = () =>
{
    return useMutation({
        mutationFn: async (body: RegisterUser) => await usersAuthApi.register(body),
        onError: (error: any) =>
        {
            const errorMessage = error.response?.data?.detail || 'Registration failed';
            // Optionally, display the error message to the user
        }
    });
}

// login query
export const useLogin = ({
    posthogIdentify,
    posthogCapture,
    isFromRegistration = false,
}: {
    posthogIdentify?: (userId: string, properties?: Record<string, any>) => void;
    posthogCapture?: (eventName: string, properties?: Record<string, any>) => void;
    isFromRegistration?: boolean;
}) =>
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: LoginUser) => (await usersAuthApi.login(body)).data,
        onSuccess: async (response: LoginResponse) => {
            try {
                await post_login_logic(response, queryClient, router, posthogIdentify, posthogCapture, 'email', isFromRegistration);
            } catch (error) {
                console.error('Error in post_login_logic:', error);
                throw error; // This will cause the mutation to be marked as failed
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.detail || 'Login failed';
            console.error('Error logging in user:', errorMessage);
        }
    });
}

// Google login query
export const useGoogleLogin = ({
    posthogIdentify,
    posthogCapture,
}: {
    posthogIdentify: (userId: string, properties?: Record<string, any>) => void;
    posthogCapture: (eventName: string, properties?: Record<string, any>) => void;
}) =>
    {
        const queryClient = useQueryClient();
    
        return useMutation({
            mutationFn: async (body: GoogleLoginBody) => {
                console.log("🔑 GOOGLE_LOGIN: Starting Google login API call");
                console.log("🔑 GOOGLE_LOGIN: Request body:", { ...body, token: 'REDACTED' });
                const result = await usersAuthApi.googleLogin(body);
                console.log("🔑 GOOGLE_LOGIN: API call successful, status:", result.status);
                console.log("🔑 GOOGLE_LOGIN: Response data structure:", Object.keys(result.data));
                return result.data;
            },
            onSuccess: async (response: ThirdPartyLoginResponse) =>
            {
                console.log("🔑 GOOGLE_LOGIN: Success handler called");
                console.log("🔑 GOOGLE_LOGIN: Response sign_up flag:", response.sign_up);
                console.log("🔑 GOOGLE_LOGIN: Response user ID:", response.user?.id);
                
                const destination = response.sign_up ? '/(app)/(signup-steps)/take-profile-picture' : '/(app)/(tabs)/home';
                console.log("🔑 GOOGLE_LOGIN: Determined destination:", destination);
                
                try {
                    await post_login_logic(response, queryClient, router, posthogIdentify, posthogCapture, 'google', false);
                    console.log("🔑 GOOGLE_LOGIN: Post login logic completed successfully");
                    
                    if(Platform.OS !== 'web') {
                        const eventType = response.sign_up ? 'sign_up' : 'sign_in';
                        console.log("🔑 GOOGLE_LOGIN: Capturing posthog event:", eventType);
                        posthogCapture(eventType, { type: 'google' });
                    }
                } catch (error) {
                    console.error("🚨 GOOGLE_LOGIN: Error in post login logic:", error);
                    throw error;
                }
            },
            onError: (error: any) =>
            {
                console.error("🚨 GOOGLE_LOGIN: Error in Google login mutation");
                console.error("🚨 GOOGLE_LOGIN: Error details:", error);
                console.error("🚨 GOOGLE_LOGIN: Error response:", error.response?.data);
                const errorMessage = error.response?.data?.detail || 'Google login failed. Please try again.';
                console.error('🚨 GOOGLE_LOGIN: Final error message:', errorMessage);
            }
        });
    }
    
    // Apple login query
    export const useAppleLogin = ({
        posthogIdentify,
        posthogCapture,
    }: {
        posthogIdentify: (userId: string, properties?: Record<string, any>) => void;
        posthogCapture: (eventName: string, properties?: Record<string, any>) => void;
    }) =>
    {
        const queryClient = useQueryClient();
    
        return useMutation({
            mutationFn: async (body: AppleLoginBody) => (await usersAuthApi.appleLogin(body)).data,
            onSuccess: async (response: ThirdPartyLoginResponse) =>
            {
                await post_login_logic(response, queryClient, router, posthogIdentify, posthogCapture, 'apple', false);
                if(Platform.OS !== 'web') posthogCapture(response.sign_up ? 'sign_up' : 'sign_in', { type: 'apple' });
            },
            onError: (error: any) =>
            {
                const errorMessage = error.response?.data?.detail || 'Apple login failed. Please try again.';
                console.error('Error logging in with Apple:', errorMessage);
            }
        });
    }

// check auth query
export const useCheckAuth = () =>
{
    return useQuery<AuthenticatedUser>({
        queryKey: ['auth'],
        queryFn: async () => (await usersAuthApi.checkAuth()).data,
        staleTime: Infinity,
        retry: false,
        // onError: (error: any) => {
        //     // If auth check fails, clear cookies and redirect to login
        //     clearAllCookies();
        //     router.replace('/(auth)/landing');
        // }
    });
}

// logout query
export const useLogout = () =>
{
    const queryClient = useQueryClient();

    return useMutation({ 
        mutationFn: async () => await usersAuthApi.logout(),
        onSuccess: async () =>
        {
            queryClient.clear();
            clearAllCookies();
            
            // Clear user metadata
            const { deleteItem } = useSecureStore();
            await deleteItem('user_name');
            await deleteItem('last_sign_in_type');
        },
        onError: (error) =>
        {
            console.error('Error logging out user:', error);
        }
    });
}

// update profile query
export const useUpdateProfile = () =>
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: UpdateUserProfile) => (await usersAuthApi.updateProfile(body)).data,
        onSuccess: (updatedUser: AuthenticatedUser) => {
            // Update the auth cache with new user data
            queryClient.setQueryData(['auth'], updatedUser);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.detail || 'Failed to update profile';
            console.error('Error updating profile:', errorMessage);
        }
    });
}

// delete account query  
export const useDeleteAccount = () =>
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await usersAuthApi.deleteAccount(),
        onSuccess: () => {
            // Clear all data and redirect to landing
            queryClient.clear();
            clearAllCookies();
            router.replace('/(auth)/landing');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.detail || 'Failed to delete account';
            console.error('Error deleting account:', errorMessage);
        }
    });
}

// get subscription details query
export const useSubscriptionDetails = () =>
{
    return useQuery<SubscriptionDetails>({
        queryKey: ['subscription'],
        queryFn: async () => (await usersAuthApi.getSubscriptionDetails()).data,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1
    });
}
