import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    reconnectAttempts = 3,
    reconnectInterval = 5000,
    autoConnect = false
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptRef = useRef<boolean>(false);

  const getWebSocketUrl = () => {
    if (url) return url;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  };

  const connect = () => {
    if (connectionAttemptRef.current || isConnected) {
      console.log('⏳ Connection attempt already in progress');
      return;
    }

    // Don't attempt connection in development unless explicitly requested
    if (process.env.NODE_ENV === 'development' && !autoConnect) {
      console.log('🚫 WebSocket connection skipped in development mode');
      return;
    }

    connectionAttemptRef.current = true;
    setIsConnecting(true);
    setError(null);

    const wsUrl = getWebSocketUrl();

    try {
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      const connectionTimeout = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          console.log('⏱️ WebSocket connection timeout');
          wsRef.current.close();
        }
      }, 10000); // 10 second timeout

      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectCount(0);
        setError(null);
        connectionAttemptRef.current = false;
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('🔌 WebSocket closed:', event.code, event.reason || 'No reason provided');
        setIsConnected(false);
        setIsConnecting(false);
        connectionAttemptRef.current = false;
        onDisconnect?.();

        // Only attempt to reconnect in production and if not manually closed
        if (process.env.NODE_ENV === 'production' && event.code !== 1000 && reconnectCount < reconnectAttempts) {
          console.log(`🔄 Reconnecting... Attempt ${reconnectCount + 1}/${reconnectAttempts}`);
          setReconnectCount(prev => prev + 1);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectCount >= reconnectAttempts) {
          console.log('❌ Max reconnection attempts reached');
          setError('Connection failed after multiple attempts');
        }
      };

      wsRef.current.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.log('❌ WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnecting(false);
        connectionAttemptRef.current = false;
        onError?.(error);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
      connectionAttemptRef.current = false;
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    connectionAttemptRef.current = false;
    setReconnectCount(0);
  };

  const sendMessage = (data: any) => {
    if (wsRef.current && isConnected) {
      try {
        wsRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    // Only auto-connect if explicitly requested or in production
    if (autoConnect || process.env.NODE_ENV === 'production') {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  return {
    isConnected,
    isConnecting,
    error,
    reconnectCount,
    connect,
    disconnect,
    sendMessage
  };
};