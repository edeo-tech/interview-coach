import asyncio
import httpx
from typing import List, Dict, Optional
from fastapi import Request
from decouple import config

# Environment variables
ELEVENLABS_API_KEY = config('ELEVENLABS_API_KEY', default='', cast=str)

class ElevenLabsTranscriptService:
    def __init__(self):
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": ELEVENLABS_API_KEY
        }
    
    async def get_conversation_transcript(self, conversation_id: str, max_retries: int = 5) -> Optional[List[Dict]]:
        """
        Retrieve transcript from ElevenLabs conversation API
        Retries until conversation status is 'done' or 'processing'
        """
        if not ELEVENLABS_API_KEY:
            print(f"❌ ELEVENLABS_API_KEY not configured")
            return None
            
        print(f"\n🎙️ [ELEVENLABS] Fetching transcript for conversation: {conversation_id}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(max_retries):
                try:
                    response = await client.get(
                        f"{self.base_url}/convai/conversations/{conversation_id}",
                        headers=self.headers
                    )
                    
                    if response.status_code == 404:
                        print(f"   ⚠️  Conversation not found (attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(2)
                        continue
                        
                    response.raise_for_status()
                    data = response.json()
                    
                    status = data.get('status', '')
                    print(f"   - Status: {status} (attempt {attempt + 1}/{max_retries})")
                    
                    if status in ['done', 'processing']:
                        transcript = data.get('transcript', [])
                        print(f"   ✅ Retrieved transcript with {len(transcript)} entries")
                        return transcript  # Return original ElevenLabs format
                    
                    elif status in ['failed']:
                        print(f"   ❌ Conversation failed")
                        return None
                    
                    else:
                        print(f"   ⏳ Status '{status}' - waiting 3 seconds before retry...")
                        await asyncio.sleep(3)
                        
                except httpx.RequestError as e:
                    print(f"   ❌ Request error (attempt {attempt + 1}/{max_retries}): {e}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2)
                    
                except httpx.HTTPStatusError as e:
                    print(f"   ❌ HTTP error (attempt {attempt + 1}/{max_retries}): {e.response.status_code}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2)
                    
        print(f"   ❌ Failed to retrieve transcript after {max_retries} attempts")
        return None
    


# Global service instance
elevenlabs_transcript_service = ElevenLabsTranscriptService()

async def fetch_and_update_transcript(req: Request, attempt_id: str, conversation_id: str) -> bool:
    """
    Fetch transcript from ElevenLabs and update the interview attempt
    Returns True if successful, False otherwise
    """
    if not conversation_id:
        print(f"❌ No conversation_id provided for attempt {attempt_id}")
        return False
    
    # Fetch transcript from ElevenLabs
    transcript = await elevenlabs_transcript_service.get_conversation_transcript(conversation_id)
    
    if not transcript:
        print(f"❌ Failed to fetch transcript for conversation {conversation_id}")
        return False
    
    # Update the attempt document with the retrieved transcript
    from crud.interviews.attempts import update_attempt
    try:
        updated_attempt = await update_attempt(req, attempt_id, transcript=transcript)
        if updated_attempt:
            print(f"✅ Updated attempt {attempt_id} with {len(transcript)} transcript entries")
            return True
        else:
            print(f"❌ Failed to update attempt {attempt_id} with transcript")
            return False
            
    except Exception as e:
        print(f"❌ Error updating attempt {attempt_id} with transcript: {e}")
        return False