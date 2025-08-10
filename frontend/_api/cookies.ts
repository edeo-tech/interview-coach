import { deleteItemAsync, getItem, getItemAsync, setItemAsync } from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === 'web';

const setUserId = async (userId: string) =>
{
    if(isWeb)
    {
        localStorage.setItem('userId', userId);
    }
    else
    {
        await setItemAsync('userId', userId);
    }
}

const getUserId = async () =>
{
    if(isWeb)
    {
        return localStorage.getItem('userId');
    }
    else
    {
        return await getItemAsync('userId');
    }
}

const setAccessToken = async (accessToken: string) =>
{
    if(isWeb)
    {
        localStorage.setItem('accessToken', accessToken);
    }
    else
    {
        await setItemAsync('accessToken', accessToken);
    }
}

const setRefreshToken = async (refreshToken: string) =>
{
    if(isWeb)
    {
        localStorage.setItem('refreshToken', refreshToken);
    }
    else
    {
        await setItemAsync('refreshToken', refreshToken);
    }
}
const getAccessToken = () =>
{
    if(isWeb)
    {
        return localStorage.getItem('accessToken');
    }
    else
    {
        return getItem('accessToken');
    }
}

const getRefreshToken = () =>
{
    if(isWeb)
    {
        return localStorage.getItem('refreshToken');
    }
    else
    {
        return getItem('refreshToken');
    }
}

const deleteAccessToken = async () =>
{
    if(isWeb)
    {
        localStorage.removeItem('accessToken');
    }
    else
    {
        await deleteItemAsync('accessToken');
    }
}

const deleteRefreshToken = async () =>
{
    if(isWeb)
    {
        localStorage.removeItem('refreshToken');
    }
    else
    {
        await deleteItemAsync('refreshToken');  
    }
}

const clearAllCookies = async () =>
{
    await deleteAccessToken();
    await deleteRefreshToken();
}

export { 
    setAccessToken,
    setRefreshToken,
    getAccessToken,
    getRefreshToken,
    deleteAccessToken,
    deleteRefreshToken,
    clearAllCookies,
    setUserId,
    getUserId
};
