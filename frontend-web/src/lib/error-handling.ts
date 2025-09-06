// Error handling utilities for authentication

type AuthError = {
  response?: {
    data?: {
      detail?: string;
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
};

// User-friendly error messages for specific error cases
const USER_FRIENDLY_ERRORS: Record<string, string> = {
  // Login errors
  'Invalid email or password': 'Invalid email or password',
  'User not found': 'Invalid email or password',
  'Incorrect password': 'Invalid email or password',
  'Invalid credentials': 'Invalid email or password',
  
  // Registration errors
  'User already exists': 'An account with this email already exists',
  'Email already registered': 'An account with this email already exists',
  'Invalid email format': 'Please enter a valid email address',
  'Password too weak': 'Password must be at least 8 characters',
  'Password does not meet requirements': 'Password must be at least 8 characters',
  
  // General auth errors
  'Account locked': 'Account locked. Please contact support',
  'Account disabled': 'Account disabled. Please contact support',
  'Too many attempts': 'Too many attempts. Please try again later',
};

export function getAuthErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  const authError = error as AuthError;
  
  // Try to extract error message from response
  const errorDetail = authError.response?.data?.detail;
  const errorMessage = authError.response?.data?.message;
  const errorField = authError.response?.data?.error;
  const genericMessage = authError.message;
  
  // Check if we have a specific error message
  const rawError = errorDetail || errorMessage || errorField || genericMessage || '';
  
  // Check if this is a known user-friendly error
  for (const [key, friendlyMessage] of Object.entries(USER_FRIENDLY_ERRORS)) {
    if (rawError.toLowerCase().includes(key.toLowerCase())) {
      return friendlyMessage;
    }
  }
  
  // Special handling for specific status codes
  if (authError.response?.status === 409) {
    return 'An account with this email already exists';
  }
  
  if (authError.response?.status === 401) {
    return 'Invalid email or password';
  }
  
  if (authError.response?.status === 429) {
    return 'Too many attempts. Please try again later';
  }
  
  // Don't expose technical error details to users
  if (rawError && (
    rawError.includes('network') ||
    rawError.includes('timeout') ||
    rawError.includes('ECONNREFUSED') ||
    rawError.includes('fetch') ||
    rawError.includes('axios')
  )) {
    return fallbackMessage;
  }
  
  // If we have a somewhat readable error that's not too technical, use it
  if (rawError && rawError.length < 100 && !rawError.includes('Error:') && !rawError.includes('at ')) {
    return rawError;
  }
  
  // Default to fallback message
  return fallbackMessage;
}