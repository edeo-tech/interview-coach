import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: 'grading_started' | 'grading_completed' | 'error';
  attempt_id: string;
  feedback_id?: string;
  message?: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onGradingStarted?: () => void;
  onGradingCompleted?: (feedbackId: string) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = (attemptId: string, options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Prevent multiple connections
    if (wsRef.current || isConnecting || isConnected) {
      console.log('🔌 [WEBSOCKET] Already connected or connecting, skipping...');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Use the backend URL from axios config
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const wsUrl = backendUrl.replace('http', 'ws') + `/ws/attempts/${attemptId}`;
      
      console.log('🔌 [WEBSOCKET] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 [WEBSOCKET] Connected to attempt:', attemptId);
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📡 [WEBSOCKET] Message received on frontend:');
          console.log('   - Type:', message.type);
          console.log('   - Attempt ID:', message.attempt_id);
          console.log('   - Current attemptId param:', attemptId);
          console.log('   - Full message:', message);
          
          // Verify the message is for this attempt
          if (message.attempt_id !== attemptId) {
            console.log('⚠️ [WEBSOCKET] Message attempt_id mismatch, ignoring');
            return;
          }
          
          // Call specific handlers
          if (message.type === 'grading_started' && options.onGradingStarted) {
            console.log('🎯 [WEBSOCKET] Calling onGradingStarted');
            options.onGradingStarted();
          } else if (message.type === 'grading_completed' && options.onGradingCompleted) {
            console.log('✅ [WEBSOCKET] Calling onGradingCompleted with feedback_id:', message.feedback_id);
            options.onGradingCompleted(message.feedback_id || '');
          } else if (message.type === 'error' && options.onError) {
            console.log('❌ [WEBSOCKET] Calling onError with message:', message.message);
            options.onError(message.message || 'Unknown error');
          }
          
          // Call general message handler
          if (options.onMessage) {
            options.onMessage(message);
          }
        } catch (error) {
          console.error('❌ [WEBSOCKET] Error parsing message:', error);
          console.error('❌ [WEBSOCKET] Raw message data:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 [WEBSOCKET] Connection closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`🔌 [WEBSOCKET] Reconnecting in ${timeout}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, timeout);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [WEBSOCKET] Error:', error);
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('❌ [WEBSOCKET] Failed to create connection:', error);
      setIsConnecting(false);
    }
  }, [attemptId, isConnecting, isConnected, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ [WEBSOCKET] Cannot send message - not connected');
    }
  }, [isConnected]);

  // Auto-connect on mount and cleanup on unmount
  useEffect(() => {
    connect();
    return disconnect;
  }, [attemptId]); // Only reconnect if attemptId changes

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage
  };
};