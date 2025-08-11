from datetime import datetime, timezone
import traceback
from functools import wraps
from fastapi import HTTPException, status

from decouple import config
from utils.discord.errors import prepare_and_send_error_message
from utils.__errors__.custom_exception import CustomException

ENVIRONMENT = config('ENVIRONMENT', cast=str)

async def get_error_details(e: Exception, func, kwargs):
    """Extract common error details from exception and request context."""
    return {
        'error_type': type(e).__name__,
        'error_message': str(e),
        'traceback_info': traceback.format_exc(),
        'timestamp': datetime.now(timezone.utc),
        'user_id': kwargs.get('user_id', "Unknown User"),
        'endpoint': kwargs.get('req').url.path if kwargs.get('req') else "Unknown Endpoint",
        'method': kwargs.get('req').method if kwargs.get('req') else "Unknown Method",
        'func_name': func.__name__
    }

def error_decorator(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        

        # Anticipated Acceptable Errors (AAE)
        except HTTPException as e:
            print('Sending anticipated acceptable error to user')
            # Send to non-urgent discord - Matthew
            # Pass to the user as is, regardless of the environment
            raise e
        

        # Anticipated Unacceptable Errors (AUE)
        except CustomException as e:
            if ENVIRONMENT == 'development':
                print("""\n\n
                    An anticipated but unacceptable error occurred
                    and was caught in the error_decorator:\n
                    """,
                    traceback.format_exc(),
                    "\n\n"
                )
                raise HTTPException(
                    status_code = status.HTTP_400_BAD_REQUEST,
                    detail = f"""
                        An Exception of the following type occurred:
                        {type(e).__name__} - {e.message}
                    """
                )
            else:
                try:
                    error_details = await get_error_details(e, func, kwargs)
                except Exception as e:
                    print(f"""\n\n\n
                        ERROR when trying to get error details:
                        {e}
                    \n\n\n""")
                    raise HTTPException(
                        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail = f"An unexpected error occurred"
                    )

                # discord
                try:
                    prepare_and_send_error_message(
                        **error_details,
                        is_anticipated=True,
                        extra_error_info=e.extra_error_info
                    )
                except Exception as e:
                    print(f"""\n\n\n
                        ERROR when trying to send AUE error to discord:
                        {e}
                    \n\n\n""")

                raise HTTPException(
                    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail = f"An unexpected error occurred"
                )
        

        # Unanticipated Errors (UE)
        except Exception as e:   
            if ENVIRONMENT == 'development':
                print("""
                        \n\nAn unexpected error occurred
                        and was caught in the error_decorator:\n
                    """,
                    traceback.format_exc(),
                    "\n\n"
                )

                raise HTTPException(
                    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail = f"An unexpected error occurred: {e}"
                ) from e
            
            else:
                try:
                    error_details = await get_error_details(e, func, kwargs)
                except Exception as e:
                    print(f"""\n\n\n
                        ERROR when trying to get error details:
                        {e}
                    \n\n\n""")
                    raise HTTPException(
                        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail = f"An unexpected error occurred"
                    )

                # discord
                try:
                    prepare_and_send_error_message(
                        **error_details,
                        is_anticipated=False
                    )
                except Exception as e:
                    print(f"""\n\n\n
                        ERROR when trying to send UE error to discord:
                        {e}
                    \n\n\n""")

            # Return sanitized error message to the client
            raise HTTPException(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail = f"An unexpected error occurred"
            )
    return wrapper
