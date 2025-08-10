import axiosConfig from '@/_api/axiosConfig';

// interfaces
import { RegisterUser, LoginUser } from '@/_interfaces/users/users';

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

    checkAuth()
    {
        return axiosConfig.protectedApi.get(`${BASE_PATH}/me`);
    }

    logout()
    {
        return axiosConfig.protectedApi.post(`${BASE_PATH}/logout`, {});
    }
}
const usersAuthApi = new UsersAuthApi();
export default usersAuthApi;
