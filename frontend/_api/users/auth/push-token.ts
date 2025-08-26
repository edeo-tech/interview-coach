import axiosConfig from '@/_api/axiosConfig';

const BASE_PATH = '/app/users/auth';

class PushTokenApi {
    updatePushToken(expoPushToken: string) {
        return axiosConfig.protectedApi.patch(`${BASE_PATH}/push-token`, {
            expo_push_token: expoPushToken
        });
    }
}

const pushTokenApi = new PushTokenApi();
export default pushTokenApi;