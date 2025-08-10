from fastapi import UploadFile
from PIL import Image
from io import BytesIO
import cloudinary
import cloudinary.uploader as uploader

from decouple import config
CLOUD_NAME = config('CLOUDINARY_NAME', cast=str)
API_KEY = config('CLOUDINARY_KEY', cast=str)
API_SECRET = config('CLOUDINARY_SECRET', cast=str)

ENVIRONMENT = config('ENVIRONMENT', cast=str)

cloudinary.config(
    cloud_name = CLOUD_NAME,
    api_key = API_KEY,
    api_secret = API_SECRET
)

async def get_base_url_path() -> str:
    if ENVIRONMENT == 'development':
        return 'dev/flight-catcher'
    else:
        return 'prod/flight-catcher'

async def upload_uploaded_image_to_cloudinary(
    uploaded_image_file:UploadFile,
    testing:bool = False,
    custom_path:str = None
) -> str: # cloudinary_url
    
    # Read the file content first
    file_content = await uploaded_image_file.read()
    
    # Create AsyncBytesFile instance
    async_file = AsyncBytesFile(file_content)
    
    # Reset the file pointer for hedra upload
    await uploaded_image_file.seek(0)

    return await upload_image_to_cloudinary(
        async_file,
        testing,
        custom_path
    )


class AsyncBytesFile:
    """
    Minimal class that provides an async read() method,
    returning the raw bytes we initialized it with.
    """
    def __init__(self, file_bytes: bytes):
        self._file_bytes = file_bytes

    async def read(self):
        return self._file_bytes


async def upload_image_to_cloudinary(
    uploaded_image_file:AsyncBytesFile, 
    testing:bool = False,
    custom_path:str = None
) -> str: # cloudinary_url
    url_path = get_base_url_path(testing)
    if custom_path:
        url_path += '/' + custom_path if custom_path[0] != '/' else custom_path

    content = await uploaded_image_file.read()
    
    with Image.open(BytesIO(content)) as img:
        if img.mode in ("RGBA", "L", "P"):  # Check if the mode is not RGB or L (greyscale)
            img = img.convert("RGB")
    
        out_image = BytesIO()
        img.save(out_image, 'JPEG')
        out_image.seek(0)

        upload_result = uploader.upload(
            out_image,
            folder=url_path
        )

        url = upload_result.get('url')
        if url.startswith('http://'):
            url = url.replace('http://', 'https://')

        return url

async def upload_base64_image_to_cloudinary(
    base64_string: str,
    testing: bool = False,
    custom_path: str = None
):
    """
    Upload a base64 encoded image to Cloudinary.
    
    Args:
        base64_string: Base64 encoded image string
        testing: Flag to use testing environment
        custom_path: Optional custom path to append to the base URL
        
    Returns:
        URL of the uploaded image on Cloudinary
    """
    import base64
    
    url_path = get_base_url_path(testing)
    if custom_path:
        url_path += '/' + custom_path if custom_path[0] != '/' else custom_path
    
    # Remove base64 header if present (e.g., "data:image/jpeg;base64,")
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64 string to bytes
    content = base64.b64decode(base64_string)
    
    with Image.open(BytesIO(content)) as img:
        if img.mode in ("RGBA", "L", "P"):  # Check if the mode is not RGB
            img = img.convert("RGB")
    
        out_image = BytesIO()
        img.save(out_image, 'JPEG')
        out_image.seek(0)

        upload_result = uploader.upload(
            out_image,
            folder=url_path
        )

        url = upload_result.get('url')
        if url.startswith('http://'):
            url = url.replace('http://', 'https://')

        return url
