import axiosConfig from '@/_api/axiosConfig';

// interfaces
import { RegisterUser, LoginUser, UpdateUserProfile, GoogleLoginBody, AppleLoginBody } from '@/_interfaces/users/users';

const BASE_PATH = '/app/users/auth';

class UsersAuthApi
{
    register(body: RegisterUser)
    {
        return axiosConfig.unprotectedApi.post(`${BASE_PATH}/register`, body);
    }

    login(body: LoginUser)
    {
        return axiosConfig.unprotectedApi.post(`${BASE_PATH}/login`, body);
    }

    googleLogin(body: GoogleLoginBody)
    {
        return axiosConfig.unprotectedApi.post(`${BASE_PATH}/login/google`, body);
    }

    appleLogin(body: AppleLoginBody)
    {
        return axiosConfig.unprotectedApi.post(`${BASE_PATH}/login/apple`, body);
    }

    checkAuth()
    {
        return axiosConfig.protectedApi.get(`${BASE_PATH}/me`);
    }

    logout()
    {
        return axiosConfig.protectedApi.post(`${BASE_PATH}/logout`, {});
    }

    updateProfile(body: UpdateUserProfile)
    {
        return axiosConfig.protectedApi.patch(`${BASE_PATH}/profile`, body);
    }

    deleteAccount()
    {
        return axiosConfig.protectedApi.delete(`${BASE_PATH}/account`);
    }

    getSubscriptionDetails()
    {
        return axiosConfig.protectedApi.get(`${BASE_PATH}/subscription`);
    }
}
const usersAuthApi = new UsersAuthApi();
export default usersAuthApi;
