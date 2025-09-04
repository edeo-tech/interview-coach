import { unprotectedApi, protectedApi } from './api';
import type { 
  RegisterUser, 
  LoginUser, 
  LoginResponse,
  AuthenticatedUser,
  UpdateUserProfile,
  GoogleLoginBody,
  AppleLoginBody,
  ThirdPartyLoginResponse 
} from '@shared/interfaces/users/users';

const BASE_PATH = '/app/users/auth';

export class AuthApi {
  register(body: RegisterUser) {
    return unprotectedApi.post<LoginResponse>(`${BASE_PATH}/register`, body);
  }

  login(body: LoginUser) {
    return unprotectedApi.post<LoginResponse>(`${BASE_PATH}/login`, body);
  }

  googleLogin(body: GoogleLoginBody) {
    return unprotectedApi.post<ThirdPartyLoginResponse>(`${BASE_PATH}/login/google`, body);
  }

  appleLogin(body: AppleLoginBody) {
    return unprotectedApi.post<ThirdPartyLoginResponse>(`${BASE_PATH}/login/apple`, body);
  }

  checkAuth() {
    return protectedApi.get<AuthenticatedUser>(`${BASE_PATH}/me`);
  }

  logout() {
    return protectedApi.post(`${BASE_PATH}/logout`, {});
  }

  updateProfile(body: UpdateUserProfile) {
    return protectedApi.patch<AuthenticatedUser>(`${BASE_PATH}/profile`, body);
  }

  deleteAccount() {
    return protectedApi.delete(`${BASE_PATH}/account`);
  }

  getSubscriptionDetails() {
    return protectedApi.get(`${BASE_PATH}/subscription`);
  }
}

export const authApi = new AuthApi();