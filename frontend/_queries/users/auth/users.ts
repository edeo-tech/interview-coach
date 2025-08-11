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
    AuthenticatedUser
} from '@/_interfaces/users/users';




const post_login_logic = async (
    response: LoginResponse,
    queryClient: QueryClient,
    router: Router
) =>
{
    // Set tokens in secure storage
    await setAccessToken(response.tokens.access_token);
    await setRefreshToken(response.tokens.refresh_token);
    await setUserId(response.user.id);

    if(Platform.OS !== 'web')
    {
        // Purchases.logIn(response.user.id);
        // Purchases.setEmail(response.user.email);
        
        // posthog.identify(response.user.id, {
        //     name: response.user.name,
        //     email: response.user.email,
        //     os: Platform.OS,
        // });
    }

    // Update auth cache with the new user data
    queryClient.setQueryData(['auth'], response.user);

    // Navigate to home screen after successful login
    router.replace('/(app)/(tabs)/home');
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
export const useLogin = () =>
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: LoginUser) => (await usersAuthApi.login(body)).data,
        onSuccess: async (response: LoginResponse) => {
            try {
                await post_login_logic(response, queryClient, router);
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

// check auth query
export const useCheckAuth = () =>
{
    return useQuery<AuthenticatedUser>({
        queryKey: ['auth'],
        queryFn: async () => (await usersAuthApi.checkAuth()).data,
        staleTime: Infinity,
        retry: false
    });
}

// logout query
export const useLogout = () =>
{
    const queryClient = useQueryClient();

    return useMutation({ 
        mutationFn: async () => await usersAuthApi.logout(),
        onSuccess: () =>
        {
            queryClient.clear();
            clearAllCookies();
        },
        onError: (error) =>
        {
            console.error('Error logging out user:', error);
        }
    });
}
