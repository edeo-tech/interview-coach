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
    // is_premium: boolean; // Now handled by RevenueCat
    created_at: string;
    streak: number;
    streak_record: number;
}

export interface UpdateUserProfile
{
    name?: string;
    email?: string;
}

export interface SubscriptionDetails
{
    is_premium: boolean;
    plan_name: string;
    status: string;
    current_period_end?: string;
    stripe_portal_url?: string;
}
