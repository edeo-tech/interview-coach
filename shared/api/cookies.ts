// Platform detection for shared usage
const isWeb = typeof window !== 'undefined';

// Web storage functions
const webSetItem = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
};

const webGetItem = (key: string) => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

const webDeleteItem = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

// Dynamic imports for React Native (only loaded in mobile environment)
let secureStore: any = null;
if (!isWeb) {
    try {
        secureStore = require('expo-secure-store');
    } catch (e) {
        // SecureStore not available
    }
}

const setUserId = async (userId: string) =>
{
    if(isWeb)
    {
        webSetItem('userId', userId);
    }
    else
    {
        await secureStore?.setItemAsync('userId', userId);
    }
}

const getUserId = async () =>
{
    if(isWeb)
    {
        return webGetItem('userId');
    }
    else
    {
        return await secureStore?.getItemAsync('userId');
    }
}

const setAccessToken = async (accessToken: string) =>
{
    if(isWeb)
    {
        webSetItem('accessToken', accessToken);
    }
    else
    {
        await secureStore?.setItemAsync('accessToken', accessToken);
    }
}

const setRefreshToken = async (refreshToken: string) =>
{
    if(isWeb)
    {
        webSetItem('refreshToken', refreshToken);
    }
    else
    {
        await secureStore?.setItemAsync('refreshToken', refreshToken);
    }
}
const getAccessToken = () =>
{
    if(isWeb)
    {
        return webGetItem('accessToken');
    }
    else
    {
        return secureStore?.getItem('accessToken');
    }
}

const getRefreshToken = () =>
{
    if(isWeb)
    {
        return webGetItem('refreshToken');
    }
    else
    {
        return secureStore?.getItem('refreshToken');
    }
}

const deleteAccessToken = async () =>
{
    if(isWeb)
    {
        webDeleteItem('accessToken');
    }
    else
    {
        await secureStore?.deleteItemAsync('accessToken');
    }
}

const deleteRefreshToken = async () =>
{
    if(isWeb)
    {
        webDeleteItem('refreshToken');
    }
    else
    {
        await secureStore?.deleteItemAsync('refreshToken');  
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
