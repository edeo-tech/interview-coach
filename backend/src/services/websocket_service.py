import json
from typing import Dict, Set
from fastapi import WebSocket
from threading import Lock

class WebSocketManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Store connections by attempt_id
        self.connections: Dict[str, Set[WebSocket]] = {}
        self.lock = Lock()
    
    async def connect(self, websocket: WebSocket, attempt_id: str):
        """Accept a WebSocket connection for a specific attempt"""
        await websocket.accept()
        
        with self.lock:
            if attempt_id not in self.connections:
                self.connections[attempt_id] = set()
            self.connections[attempt_id].add(websocket)
        
        print(f"🔌 [WEBSOCKET] Client connected for attempt: {attempt_id}")
        print(f"   - Total connections for attempt: {len(self.connections[attempt_id])}")
    
    def disconnect(self, websocket: WebSocket, attempt_id: str):
        """Remove a WebSocket connection"""
        with self.lock:
            if attempt_id in self.connections:
                self.connections[attempt_id].discard(websocket)
                if not self.connections[attempt_id]:
                    del self.connections[attempt_id]
        
        print(f"🔌 [WEBSOCKET] Client disconnected from attempt: {attempt_id}")
    
    async def send_to_attempt(self, attempt_id: str, message: dict):
        """Send a message to all clients listening for a specific attempt"""
        if attempt_id not in self.connections:
            print(f"📡 [WEBSOCKET] No connections for attempt: {attempt_id}")
            return
        
        message_str = json.dumps(message)
        connections_to_remove = []
        
        print(f"📡 [WEBSOCKET] Broadcasting to {len(self.connections[attempt_id])} clients for attempt: {attempt_id}")
        print(f"   - Message type: {message.get('type', 'unknown')}")
        
        for websocket in self.connections[attempt_id].copy():
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                print(f"❌ [WEBSOCKET] Failed to send to client: {e}")
                connections_to_remove.append(websocket)
        
        # Remove failed connections
        if connections_to_remove:
            with self.lock:
                for websocket in connections_to_remove:
                    self.connections[attempt_id].discard(websocket)
                if not self.connections[attempt_id]:
                    del self.connections[attempt_id]
    
    async def broadcast_transcript_update(self, attempt_id: str, transcript: list):
        """Broadcast transcript update to all clients for an attempt"""
        await self.send_to_attempt(attempt_id, {
            "type": "transcript_updated",
            "attempt_id": attempt_id,
            "transcript": transcript
        })
    
    async def broadcast_grading_started(self, attempt_id: str):
        """Broadcast that grading has started"""
        await self.send_to_attempt(attempt_id, {
            "type": "grading_started",
            "attempt_id": attempt_id
        })
    
    async def broadcast_grading_completed(self, attempt_id: str, feedback_id: str):
        """Broadcast that grading is complete"""
        await self.send_to_attempt(attempt_id, {
            "type": "grading_completed",
            "attempt_id": attempt_id,
            "feedback_id": feedback_id
        })
    
    async def broadcast_error(self, attempt_id: str, error_message: str):
        """Broadcast an error to clients"""
        await self.send_to_attempt(attempt_id, {
            "type": "error",
            "attempt_id": attempt_id,
            "message": error_message
        })

# Global WebSocket manager instance
websocket_manager = WebSocketManager()