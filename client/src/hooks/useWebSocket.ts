import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'disabled';

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
    reconnectAttempts = 5,
    reconnectInterval = 5000,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [lastReconnectAttempt, setLastReconnectAttempt] = useState(0);
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('⏳ Connection attempt already in progress');
      return;
    }

    // Rate limiting: don't reconnect more than once per 3 seconds
    const now = Date.now();
    if (now - lastReconnectAttempt < 3000) {
      console.log('⏳ Rate limiting WebSocket connection attempts');
      setTimeout(() => {
        connect();
      }, 3000 - (now - lastReconnectAttempt));
      return;
    }
    setLastReconnectAttempt(now);
    isConnectingRef.current = true;

    console.log('🔌 Connecting to WebSocket:', url);

    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket connection timeout');
          ws.close();
        }
      }, 10000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setReconnectCount(0);

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 30000);

        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle pong response
          if (message.type === 'pong') {
            return;
          }

          onMessage?.(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        console.log('🔌 WebSocket closed:', event.code, event.reason || 'No reason provided');

        // Report WebSocket errors for monitoring
        if (event.code !== 1000) { // 1000 = normal closure
          try {
            import('../utils/errorReporting').then(({ reportError }) => {
              reportError(`WebSocket connection closed unexpectedly`, {
                code: event.code,
                reason: event.reason || 'No reason provided',
                url: url
              });
            }).catch((importError) => {
              console.warn('Failed to import error reporting:', importError);
            });
          } catch (e) {
            console.warn('Failed to report WebSocket error:', e);
          }
        }

        setIsConnected(false);
        wsRef.current = null;
        onDisconnect?.();

        // Only attempt to reconnect if it wasn't a clean close (code 1000)
        if (event.code !== 1000 && reconnectCount < reconnectAttempts) {
          const newCount = reconnectCount + 1;
          setReconnectCount(newCount);
          console.log(`🔄 Reconnecting... Attempt ${newCount}/${reconnectAttempts}`);

          // Exponential backoff with jitter
          const delay = Math.min(reconnectInterval * Math.pow(1.5, newCount - 1), 30000) + Math.random() * 1000;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectCount >= reconnectAttempts) {
          console.log('❌ Max reconnection attempts reached');
          toast({
            title: "Connection Lost",
            description: "Unable to maintain connection to live updates. Please refresh the page.",
            variant: "destructive"
          });
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);

        // Handle "upgrade required" errors specifically
        if (error.toString().includes('upgrade') || error.toString().includes('426')) {
          console.log('🔄 WebSocket upgrade required - switching to polling mode');
          return;
        }

        onError?.(error);
        setIsConnected(false);
      };

    } catch (error) {
      isConnectingRef.current = false;
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }, [url, reconnectCount, reconnectAttempts, reconnectInterval, onConnect, onMessage, onDisconnect, onError, toast, lastReconnectAttempt]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    // Completely disable WebSocket in development environments
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('replit.dev') || 
        import.meta.env.DEV) {
      console.log('🔌 WebSocket disabled in development environment');
      return;
    }

    // Only connect in production
    connect();

    return () => {
      disconnect(); // Clean up on unmount
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    send,
  };
};
const getWebSocketUrl = () => {
  // For development, connect to the server's WebSocket endpoint
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `ws://localhost:5000/ws`;
  }

  // For Replit environment, use the current domain with wss protocol
  const host = window.location.host;
  return `wss://${host}/ws`;
};