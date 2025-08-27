import random
import string
from fastapi import Request
from typing import Optional

async def generate_unique_referral_code(req: Request, max_attempts: int = 100) -> Optional[str]:
    """
    Generate a unique 4-character referral code using uppercase letters and numbers.
    Excludes confusing characters: 0, O, 1, I, L for better UX.
    
    Args:
        req: FastAPI request object with MongoDB connection
        max_attempts: Maximum number of attempts to generate a unique code
        
    Returns:
        Unique 4-character referral code or None if failed to generate
    """
    # Character set excluding confusing ones
    chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    
    for _ in range(max_attempts):
        # Generate 4-character code
        code = ''.join(random.choice(chars) for _ in range(4))
        
        # Check if code already exists in database
        existing_user = await req.app.mongodb['users'].find_one({
            'referral_code': code
        })
        
        if not existing_user:
            return code
    
    # Failed to generate unique code after max attempts
    return None

def validate_referral_code(code: str) -> bool:
    """
    Validate referral code format.
    
    Args:
        code: Referral code to validate
        
    Returns:
        True if valid format, False otherwise
    """
    if not code or len(code) != 4:
        return False
    
    # Allow uppercase letters and numbers only
    return all(c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' for c in code.upper())

def normalize_referral_code(code: str) -> str:
    """
    Normalize referral code to uppercase.
    
    Args:
        code: Referral code to normalize
        
    Returns:
        Uppercase version of the code
    """
    return code.upper().strip()