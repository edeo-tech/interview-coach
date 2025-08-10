export interface RegisterUser
{
    username: string;
    phone_number: string;
    password: string;
    profile_picture: string;
    expo_notification_token: string;
    last_lat: string;
    last_long: string;
    device_os: string;
}

export interface LoginUser
{
    username: string;
    password: string;
}

export interface LoginResponse
{
    user: AuthenticatedUser;
    tokens: {
        access_token: string;
        refresh_token: string;
    };
}

export interface AuthenticatedUser
{
    id: string;
    username: string;
    profile_picture?: string;
    xp_earned: number;
    profile_qrcode?: string;
    radius: number;
    is_banned: boolean;
    last_login?: string;
}
