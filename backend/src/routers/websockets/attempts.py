from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.websocket_service import websocket_manager

router = APIRouter()

@router.websocket("/attempts/{attempt_id}")
async def websocket_endpoint(websocket: WebSocket, attempt_id: str):
    """WebSocket endpoint for real-time updates for a specific attempt"""
    await websocket_manager.connect(websocket, attempt_id)
    
    try:
        # Keep connection alive and handle any incoming messages
        while True:
            # For now, we just listen for disconnections
            # In the future, we could handle client->server messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, attempt_id)