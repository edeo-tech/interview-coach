from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.websocket_service import websocket_manager

router = APIRouter()

@router.websocket("/attempts/{attempt_id}")
async def websocket_endpoint(websocket: WebSocket, attempt_id: str):
    """WebSocket endpoint for real-time updates for a specific attempt"""
    print(f"🔌 [WEBSOCKET] New connection request for attempt: {attempt_id}")
    
    await websocket_manager.connect(websocket, attempt_id)
    
    try:
        # Keep connection alive and handle any incoming messages
        while True:
            # For now, we just listen for disconnections
            # In the future, we could handle client->server messages
            data = await websocket.receive_text()
            print(f"📥 [WEBSOCKET] Received from client for attempt {attempt_id}: {data}")
    except WebSocketDisconnect:
        print(f"🔌 [WEBSOCKET] Client disconnected from attempt: {attempt_id}")
        websocket_manager.disconnect(websocket, attempt_id)
    except Exception as e:
        print(f"❌ [WEBSOCKET] Error for attempt {attempt_id}: {e}")
        websocket_manager.disconnect(websocket, attempt_id)