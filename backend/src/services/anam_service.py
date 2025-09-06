import aiohttp
from decouple import config

ANAM_API_KEY = config('ANAM_API_KEY', cast=str)

async def create_session_token():
    """
    Create a session token for Anam AI with Cara persona configuration.
    """
    url = "https://api.anam.ai/v1/auth/session-token"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ANAM_API_KEY}"
    }
    
    payload = {
        "personaConfig": {
            "name": "Cara",
            "avatarId": "30fa96d0-26c4-4e55-94a0-517025942e18",
            "voiceId": "6bfbe25a-979d-40f3-a92b-5394170af54b",
            "llmId": "0934d97d-0c3a-4f33-91b0-5e136a0ef466",
            "systemPrompt": "You are Cara, a helpful and friendly AI assistant. Keep responses conversational and concise.",
        }
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as response:
            if response.status != 200:
                error_data = await response.text()
                raise Exception(f"Failed to create session token: {response.status} - {error_data}")
            
            data = await response.json()
            return data.get("sessionToken")