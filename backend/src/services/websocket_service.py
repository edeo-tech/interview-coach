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
        print(f"🔌 [WEBSOCKET] Accepting connection for attempt: {attempt_id}")
        await websocket.accept()
        print(f"🔌 [WEBSOCKET] WebSocket accepted, adding to connections...")
        
        with self.lock:
            if attempt_id not in self.connections:
                self.connections[attempt_id] = set()
            self.connections[attempt_id].add(websocket)
            total_connections = len(self.connections[attempt_id])
            all_attempt_ids = list(self.connections.keys())
        
        print(f"✅ [WEBSOCKET] Client connected successfully!")
        print(f"   - Attempt ID: {attempt_id}")
        print(f"   - Connections for this attempt: {total_connections}")
        print(f"   - All active attempt IDs: {all_attempt_ids}")
        print(f"   - WebSocket object: {websocket}")
    
    def disconnect(self, websocket: WebSocket, attempt_id: str):
        """Remove a WebSocket connection"""
        print(f"🔌 [WEBSOCKET] Disconnecting client from attempt: {attempt_id}")
        print(f"   - WebSocket object: {websocket}")
        
        with self.lock:
            if attempt_id in self.connections:
                self.connections[attempt_id].discard(websocket)
                remaining_connections = len(self.connections[attempt_id])
                if not self.connections[attempt_id]:
                    del self.connections[attempt_id]
                    print(f"   - Removed attempt {attempt_id} from connections (no remaining connections)")
                else:
                    print(f"   - {remaining_connections} connections remaining for attempt {attempt_id}")
            else:
                print(f"   - Attempt {attempt_id} not found in connections")
        
        print(f"✅ [WEBSOCKET] Client disconnected from attempt: {attempt_id}")
        print(f"   - Remaining attempt IDs: {list(self.connections.keys())}")
    
    def log_connection_state(self):
        """Log current connection state for debugging"""
        with self.lock:
            total_attempts = len(self.connections)
            total_connections = sum(len(conns) for conns in self.connections.values())
            
        print(f"🔍 [WEBSOCKET] Connection State:")
        print(f"   - Total attempts with connections: {total_attempts}")
        print(f"   - Total active connections: {total_connections}")
        print(f"   - Attempt IDs: {list(self.connections.keys())}")
        for attempt_id, conns in self.connections.items():
            print(f"   - {attempt_id}: {len(conns)} connections")
    
    async def send_to_attempt(self, attempt_id: str, message: dict, retry_count: int = 0):
        """Send a message to all clients listening for a specific attempt"""
        print(f"\n📡 [WEBSOCKET] send_to_attempt called:")
        print(f"   - Attempt ID: {attempt_id}")
        print(f"   - Attempt ID type: {type(attempt_id)}")
        print(f"   - Retry count: {retry_count}")
        
        # Log current connection state
        self.log_connection_state()
        
        if attempt_id not in self.connections:
            print(f"   ❌ No connections found for attempt: {attempt_id}")
            print(f"   - Available connections: {list(self.connections.keys())}")
            
            # Retry mechanism for timing issues
            if retry_count < 3:
                import asyncio
                wait_time = (retry_count + 1) * 2  # 2, 4, 6 seconds
                print(f"   🔄 Retrying in {wait_time} seconds (attempt {retry_count + 1}/3)")
                await asyncio.sleep(wait_time)
                await self.send_to_attempt(attempt_id, message, retry_count + 1)
            else:
                print(f"   ❌ Max retries reached, giving up")
            return
        
        message_str = json.dumps(message)
        connections_to_remove = []
        
        print(f"   ✅ Found {len(self.connections[attempt_id])} clients for attempt: {attempt_id}")
        print(f"   - Message type: {message.get('type', 'unknown')}")
        print(f"   - Message size: {len(message_str)} bytes")
        
        successful_sends = 0
        for websocket in self.connections[attempt_id].copy():
            try:
                await websocket.send_text(message_str)
                successful_sends += 1
                print(f"   ✅ Sent to client #{successful_sends}")
            except Exception as e:
                print(f"   ❌ Failed to send to client: {e}")
                connections_to_remove.append(websocket)
        
        # Remove failed connections
        if connections_to_remove:
            with self.lock:
                for websocket in connections_to_remove:
                    self.connections[attempt_id].discard(websocket)
                if not self.connections[attempt_id]:
                    del self.connections[attempt_id]
        
        print(f"   - Total successful sends: {successful_sends}")
        print(f"   - Total failed sends: {len(connections_to_remove)}")
    
    
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