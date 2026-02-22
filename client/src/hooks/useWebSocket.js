/**
 * WebSocket hook for real-time attribution updates
 * Provides connection management and event subscription
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';

const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'wss://localhost:3001';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const subscriptions = useRef(new Map());
  const { token } = useAuth();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      const url = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
        
        // Clear reconnect timer
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect after delay
        if (event.code !== 1000) { // Not a normal close
          reconnectTimer.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection failed');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'attribution_update':
              subscriptions.current.get('attribution_update')?.forEach(callback => {
                callback(data.payload);
              });
              break;
              
            case 'touchpoint_tracked':
              subscriptions.current.get('touchpoint_tracked')?.forEach(callback => {
                callback(data.payload);
              });
              break;
              
            case 'journey_completed':
              subscriptions.current.get('journey_completed')?.forEach(callback => {
                callback(data.payload);
              });
              break;
              
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError(error.message);
    }
  }, [token]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Client disconnect');
      ws.current = null;
    }
    
    setConnected(false);
  }, []);

  const subscribe = useCallback((eventType, callback) => {
    if (!subscriptions.current.has(eventType)) {
      subscriptions.current.set(eventType, new Set());
    }
    
    subscriptions.current.get(eventType).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = subscriptions.current.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscriptions.current.delete(eventType);
        }
      }
    };
  }, []);

  const send = useCallback((type, payload) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  // Connect on mount if token is available
  useEffect(() => {
    if (token) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptions.current.clear();
    };
  }, []);

  return {
    connected,
    error,
    connect,
    disconnect,
    subscribe,
    send
  };
};

export default useWebSocket;