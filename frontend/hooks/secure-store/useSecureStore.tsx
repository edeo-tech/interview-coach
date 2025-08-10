import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const useSecureStore = () =>
{
    const setItem = async (
        key: string, 
        value: string, 
        options?: SecureStore.SecureStoreOptions
    ): Promise<void> =>
    {
        if (Platform.OS === 'web') {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                console.error('Error storing data in localStorage:', error);
            }
        } else {
            try {
                await SecureStore.setItemAsync(key, value, options);
            } catch (error) {
                console.error('Error storing data in SecureStore:', error);
            }
        }
    };

    const getItem = async (
        key: string, 
        options?: SecureStore.SecureStoreOptions
    ): Promise<string | null> =>
    {
        if (Platform.OS === 'web') {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                console.error('Error retrieving data from localStorage:', error);
                return null;
            }
        } else {
            try {
                return await SecureStore.getItemAsync(key, options);
            } catch (error) {
                console.error('Error retrieving data from SecureStore:', error);
                return null;
            }
        }
    };

    const deleteItem = async (
        key: string, 
        options?: SecureStore.SecureStoreOptions
    ): Promise<void> =>
    {
        if (Platform.OS === 'web') {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error removing data from localStorage:', error);
            }
        } else {
            try {
                await SecureStore.deleteItemAsync(key, options);
            } catch (error) {
                console.error('Error removing data from SecureStore:', error);
            }
        }
    };

    return {
        setItem,
        getItem,
        deleteItem
    };
};

export default useSecureStore;
