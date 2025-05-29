import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketConfig {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

interface WebSocketState {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' | 'circuit_breaker';
  lastError?: string;
}

export const useWebSocket = (config: WebSocketConfig = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = 3,
    reconnectInterval = 5000,
    heartbeatInterval = 30000
  } = config;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    connectionStatus: 'disconnected'
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);
  const circuitBreakerRef = useRef(false);
  const { toast } = useToast();

  // Circuit breaker - stop trying after too many failures
  const openCircuitBreaker = useCallback(() => {
    circuitBreakerRef.current = true;
    setState(prev => ({ ...prev, connectionStatus: 'circuit_breaker' }));
    console.log('🚫 WebSocket circuit breaker activated - stopping connection attempts');

    // Reset circuit breaker after 5 minutes
    setTimeout(() => {
      circuitBreakerRef.current = false;
      attemptsRef.current = 0;
      console.log('🔄 WebSocket circuit breaker reset');
    }, 300000);
  }, []);

  const connect = useCallback(() => {
    // Don't connect if circuit breaker is active
    if (circuitBreakerRef.current) {
      console.log('🚫 WebSocket connection blocked by circuit breaker');
      return;
    }

    // Don't connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

      // Try development server first, fallback to production
      const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('replit.dev');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const port = isDev ? ':5000' : '';
      const wsUrl = `${protocol}//${window.location.hostname}${port}/ws`;

      console.log('🔌 Attempting WebSocket connection to:', wsUrl);

      const ws = new WebSocket(wsUrl);
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
        attemptsRef.current = 0;
        setState({
          isConnected: true,
          connectionStatus: 'connected'
        });

        console.log('✅ WebSocket connected successfully');

        // Start heartbeat
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }

        const startHeartbeat = () => {
          heartbeatTimeoutRef.current = setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
              startHeartbeat();
            }
          }, heartbeatInterval);
        };
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            // Heartbeat response - connection is alive
            return;
          }
          // Handle other message types here
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', event.data);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }

        setState({
          isConnected: false,
          connectionStatus: 'disconnected'
        });

        console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`);

        // Only attempt reconnection if it wasn't a manual close and we haven't hit the circuit breaker
        if (event.code !== 1000 && !circuitBreakerRef.current && attemptsRef.current < reconnectAttempts) {
          attemptsRef.current++;
          console.log(`🔄 Scheduling reconnection attempt ${attemptsRef.current}/${reconnectAttempts} in ${reconnectInterval}ms`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * attemptsRef.current); // Exponential backoff
        } else if (attemptsRef.current >= reconnectAttempts) {
          console.log('🚫 Max reconnection attempts reached, activating circuit breaker');
          openCircuitBreaker();
        }
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('🚨 WebSocket error:', error);
        setState(prev => ({
          ...prev,
          connectionStatus: 'error',
          lastError: 'Connection failed'
        }));
      };

    } catch (error) {
      console.error('🚨 Failed to create WebSocket:', error);
      setState({
        isConnected: false,
        connectionStatus: 'error',
        lastError: 'Failed to create connection'
      });
    }
  }, [reconnectAttempts, reconnectInterval, heartbeatInterval, openCircuitBreaker]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      connectionStatus: 'disconnected'
    });
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Reset circuit breaker manually
  const resetCircuitBreaker = useCallback(() => {
    circuitBreakerRef.current = false;
    attemptsRef.current = 0;
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    console.log('🔄 Circuit breaker manually reset');
  }, []);

  useEffect(() => {
    if (autoConnect && !circuitBreakerRef.current) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    send,
    resetCircuitBreaker,
    subscribe: (channels: string[]) => {
      // Mock subscription for now
      console.log('📡 Subscribed to channels:', channels);
    }
  };
};