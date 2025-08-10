import { getRandomValues } from 'expo-crypto';

export const generateRandomIntBetween = (min: number, max: number) =>
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getRandomNumber = (min: number, max: number) =>
{
    return Math.random() * (max - min) + min;
};

export const generateRandomID = (
    length: number = 13,
    _digits: boolean = true,
    _lowercase: boolean = false,
    _uppercase: boolean = false
) => {
    const digits = '0123456789';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let chars = '';
    if (_digits) chars += digits;
    if (_lowercase) chars += lowercase;
    if (_uppercase) chars += uppercase;

    if (chars.length === 0) chars = digits + lowercase; // Fallback to ensure valid output

    let result = '';
    const randomBytes = new Uint8Array(length);
    getRandomValues(randomBytes);
    
    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    
    return result;
};
