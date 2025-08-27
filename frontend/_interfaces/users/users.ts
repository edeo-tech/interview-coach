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

export interface GoogleLoginBody
{
    token: string;
    device_os: string;
}

export interface AppleLoginBody
{
    user_token: string;
    device_os: string;
}

export interface LoginResponse
{
    user: AuthenticatedUser;
    tokens: {
        access_token: string;
        refresh_token: string;
    };
}

export interface ThirdPartyLoginResponse extends LoginResponse
{
    sign_up: boolean;
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
    referral_code: string;
    free_calls_remaining: number;
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

export interface ReferralSubmission
{
    referral_code: string;
}

export interface ReferralResponse
{
    success: boolean;
    message: string;
    referrer_name?: string;
}
