'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth-api';
import { setAccessToken, setRefreshToken, clearTokens } from '@/lib/api';
import type { 
  LoginUser, 
  RegisterUser, 
  LoginResponse, 
  AuthenticatedUser,
  ThirdPartyLoginResponse,
  GoogleLoginBody,
  AppleLoginBody 
} from '@shared/interfaces/users/users';

const setUserId = (userId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userId', userId);
  }
};

const postLoginLogic = async (
  response: LoginResponse | ThirdPartyLoginResponse,
  queryClient: any,
  router: any,
  isNewUser = false
) => {
  // Set tokens
  setAccessToken(response.tokens.access_token);
  setRefreshToken(response.tokens.refresh_token);
  setUserId(response.user.id);

  // Update auth cache
  queryClient.setQueryData(['auth'], response.user);

  // Navigate based on user status
  if (isNewUser || (response as ThirdPartyLoginResponse).sign_up) {
    router.push('/onboarding');
  } else {
    router.push('/dashboard');
  }
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: RegisterUser) => (await authApi.register(body)).data,
    onSuccess: async (response: LoginResponse) => {
      await postLoginLogic(response, queryClient, router, true);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: LoginUser) => (await authApi.login(body)).data,
    onSuccess: async (response: LoginResponse) => {
      await postLoginLogic(response, queryClient, router);
    },
  });
};

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: GoogleLoginBody) => (await authApi.googleLogin(body)).data,
    onSuccess: async (response: ThirdPartyLoginResponse) => {
      await postLoginLogic(response, queryClient, router);
    },
  });
};

export const useAppleLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: AppleLoginBody) => (await authApi.appleLogin(body)).data,
    onSuccess: async (response: ThirdPartyLoginResponse) => {
      await postLoginLogic(response, queryClient, router);
    },
  });
};

export const useCheckAuth = () => {
  return useQuery<AuthenticatedUser>({
    queryKey: ['auth'],
    queryFn: async () => (await authApi.checkAuth()).data,
    staleTime: Infinity,
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => await authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      clearTokens();
      router.push('/login');
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: any) => (await authApi.updateProfile(body)).data,
    onSuccess: (updatedUser: AuthenticatedUser) => {
      queryClient.setQueryData(['auth'], updatedUser);
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => await authApi.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      clearTokens();
      router.push('/');
    },
  });
};