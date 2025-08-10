import os
import qrcode
from PIL import Image
from io import BytesIO

from utils.cloudinary.upload import upload_image_to_cloudinary, AsyncBytesFile


async def generateQRCode(url:str, add_logo:bool=True):
    # Create QR Code
    QRCode = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H
    )
    QRCode.add_data(url)
    qrcode_img = QRCode.make_image(
        fill_color = 'white',
        back_color = 'transparent',
    )

    # Add logo to QR Code
    if add_logo:
        # Get logo
        logo = await getLogo()

        # Edit logo size
        resized_logo = await editLogoSize(logo)

        # Add logo to QR Code
        qrcode_final = await addLogoToQRCode(qrcode_img, resized_logo)
    else:
        qrcode_final = qrcode_img
    
    ## Convert PIL Image to bytes and create AsyncBytesFile
    buffer = BytesIO()
    qrcode_final.save(buffer, format="PNG")
    buffer.seek(0)
    async_bytes_file = AsyncBytesFile(buffer.getvalue())
    
    ## upload to cloudinary
    cloudinary_response = await upload_image_to_cloudinary(async_bytes_file, custom_path=f"qrcode/{url.split('/')[-1]}")
    
    return cloudinary_response

async def getLogo():
    this_folder_path = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(this_folder_path, '../../../../'))
    logo_path = os.path.join(project_root, 'src/assets/edeo_app_icon.png')
    return Image.open(logo_path)

async def editLogoSize(logo, basewidth:int=75):
    width_percent = (basewidth/float(logo.size[0]))
    height_size = int(float(logo.size[1]) * float(width_percent))
    resized_logo = logo.resize((basewidth, height_size))
    return resized_logo

async def addLogoToQRCode(qrcode_img, logo):
    # 1) Make sure both have RGBA (alpha) channels
    qr   = qrcode_img.convert("RGBA")
    logo = logo.convert("RGBA")

    # 2) Create a transparent canvas the same size as the QR
    composite = Image.new("RGBA", qr.size)

    # 3) Paste the QR onto it, using its alpha to preserve transparency
    composite.paste(qr, (0, 0), qr)

    # 4) Compute center coords for the logo
    x = (qr.width  - logo.width ) // 2
    y = (qr.height - logo.height) // 2

    # 5) Paste the logo (again using its alpha mask)
    composite.paste(logo, (x, y), logo)

    return composite

