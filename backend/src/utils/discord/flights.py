## this is temp
from decouple import config
from src.utils.discord.send import send_to_discord

TEMP_DISCORD_NOTIF_WEBHOOK_URL = config('TEMP_DISCORD_NOTIF_WEBHOOK_URL', cast=str)

def format_message(
    f:dict,
    # dep:str,
    # arr:str,
    # model:str,
    # airline:str,
    username:str
):
    # message = (
    #     f"✈️ **{f['callsign']}** overhead user: {username}!\n"
    #     # f"> From: `{dep or 'Unknown'}`  →  To: `{arr or 'Unknown'}`\n"
    #     f"> Left from: `{dep or 'Unknown'}`\n"
    #     f"> Aircraft: `{model}`\n"
    #     f"> Airline: `{airline}`\n"
    #     f"> ICAO24: `{f['icao24']}`"
    # )
    message = (
        f"✈️ **{f['callsign']}** overhead user: {username}!\n"
        f"> ICAO24: `{f['icao24']}`\n"
        f"> Altitude: `{f['alt']}`\n"
        f"> Latitude: `{f['lat']}`\n"
        f"> Longitude: `{f['lon']}`"
    )
    send_to_discord(
        TEMP_DISCORD_NOTIF_WEBHOOK_URL,
        message=message
    )
