import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: number;
  priority?: string;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, getToken } = useAuth();
  const { toast } = useToast();

  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  };

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    if (!user) {
      console.warn('Cannot connect WebSocket: No authenticated user');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      const wsUrl = getWebSocketUrl();
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = async () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Authenticate with JWT token
        const token = await getToken();
        if (token && ws.current) {
          ws.current.send(JSON.stringify({
            type: 'auth',
            payload: { token }
          }));
        }

        startHeartbeat();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionStatus('disconnected');
        stopHeartbeat();

        // Attempt reconnection if not intentional close
        if (event.code !== 1000 && reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${reconnectAttempts}`);

          setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');

        toast({
          title: "Connection Error",
          description: "Lost connection to real-time updates. Attempting to reconnect...",
          variant: "destructive"
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
      setConnectionStatus('error');
    }
  }, [user, getToken, isConnecting, isConnected, reconnectAttempts, reconnectInterval, startHeartbeat, stopHeartbeat, toast]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 WebSocket message:', message);

    switch (message.type) {
      case 'auth_success':
        toast({
          title: "🔒 Secure Connection Established",
          description: "Real-time monitoring active",
          duration: 2000
        });

        // Subscribe to essential channels
        subscribe(['transactions', 'balance_updates', 'security_alerts', 'odds_updates']);
        break;

      case 'transaction_update':
        toast({
          title: "💰 Transaction Alert",
          description: `New transaction: ${message.data?.description || 'Transaction processed'}`,
          duration: 4000
        });
        break;

      case 'balance_update':
        // Balance updates are handled by context/components
        break;

      case 'security_alert':
        toast({
          title: "🚨 SECURITY ALERT",
          description: message.data?.message || "Suspicious activity detected",
          variant: "destructive",
          duration: 10000
        });
        break;

      case 'odds_update':
        // Odds updates handled by betting components
        break;

      case 'error':
        console.error('WebSocket error message:', message.message);
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'User disconnect');
      ws.current = null;
    }
    stopHeartbeat();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [stopHeartbeat]);

  const send = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback((channels: string[]) => {
    return send({
      type: 'subscribe',
      payload: { channels }
    });
  }, [send]);

  const unsubscribe = useCallback((channels: string[]) => {
    return send({
      type: 'unsubscribe',
      payload: { channels }
    });
  }, [send]);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (autoConnect && user && !isConnected && !isConnecting) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    connectedUsersCount: 0 // Could be updated via WebSocket message
  };
}