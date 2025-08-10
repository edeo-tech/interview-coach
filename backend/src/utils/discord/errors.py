from datetime import datetime
from decouple import config

from utils.discord.send import send_to_discord

DISCORD_ERROR_ALERTS_WEBHOOK_URL = config('DISCORD_ERROR_ALERTS_WEBHOOK_URL', cast=str)

def prepare_and_send_error_message(
    error_type: str,
    timestamp: datetime,
    func_name: str,
    endpoint: str,
    method: str,
    user_id: str,
    error_message: str,
    traceback_info: str,
    is_anticipated: bool = False,
    extra_error_info: str = None,
    webhook_url: str = DISCORD_ERROR_ALERTS_WEBHOOK_URL
):
    """Prepare and send error messages to Discord with automatic chunking."""
    # Prepare the base message
    base_message = (
        f"🚨 **Production Error Detected - {'Anticipated Unacceptable' if is_anticipated else 'Unanticipated'} Error**\n"
        f"**Timestamp:** {timestamp}\n"
        f"**Function:** `{func_name}`\n"
        f"**Endpoint:** `{endpoint}`\n"
        f"**Method:** `{method}`\n"
        f"**User ID:** `{user_id}`\n"
        f"**Error Type:** `{error_type}`\n"
        f"**Error Message:** {error_message}\n"
    )
    
    traceback_with_extra = f"**Traceback:** ```{traceback_info}```"
    if extra_error_info:
        traceback_with_extra += f"\n**Extra Error Info:** {extra_error_info}"

    # Discord message length limit
    DISCORD_LIMIT = 2000

    # If total message fits in one message, send it
    if len(base_message + traceback_with_extra) <= DISCORD_LIMIT:
        send_to_discord(webhook_url, base_message + traceback_with_extra)
    else:
        # Send base message first
        send_to_discord(webhook_url, base_message)
        
        # Split remaining content into chunks
        remaining = traceback_with_extra
        chunk_num = 1
        
        while remaining:
            header = f"**Part {chunk_num + 1}:** "
            content_limit = DISCORD_LIMIT - len(header)
            
            if len(remaining) <= content_limit:
                chunk = remaining
                remaining = ""
            else:
                split_point = remaining[:content_limit].rfind('\n')
                if split_point == -1:
                    split_point = content_limit
                
                chunk = remaining[:split_point]
                remaining = remaining[split_point:].lstrip()
            
            send_to_discord(webhook_url, header + chunk)
            chunk_num += 1
