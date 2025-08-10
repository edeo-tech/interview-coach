import requests

def send_to_discord(webhook_url: str, message: str):
    """Send a formatted message to Discord webhook."""
    discord_res = requests.post(webhook_url, json={"content": message})
    if discord_res.status_code != 204:
        print(f"Failed to send Discord message: {discord_res.text}")
