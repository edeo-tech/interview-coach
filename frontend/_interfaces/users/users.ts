export interface RegisterUser
{
    name: string;
    email: string;
    password: string;
}

export interface LoginUser
{
    email: string;
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
    name: string;
    email: string;
    profile_picture?: string;
    profile_qrcode?: string;
    is_banned: boolean;
    last_login?: string;
    is_premium: boolean;
}
