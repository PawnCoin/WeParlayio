
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
  enableFallback?: boolean;
  maxReconnectDelay?: number;
}

interface ConnectionStats {
  totalConnections: number;
  totalReconnections: number;
  currentStreak: number;
  lastConnected: number | null;
  averageLatency: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, getToken } = useAuth();
  const { toast } = useToast();

  const {
    autoConnect = true,
    reconnectAttempts = 10,
    reconnectInterval = 1000,
    enableFallback = true,
    maxReconnectDelay = 30000
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error' | 'fallback'>('disconnected');
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    totalConnections: 0,
    totalReconnections: 0,
    currentStreak: 0,
    lastConnected: null,
    averageLatency: 0
  });

  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectAttempt = useRef<number>(0);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackPollingRef = useRef<NodeJS.Timeout | null>(null);
  const latencyHistoryRef = useRef<number[]>([]);
  const messageQueueRef = useRef<any[]>([]);
  const exponentialBackoffRef = useRef<number>(reconnectInterval);

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  };

  const calculateLatency = useCallback(() => {
    const pingStart = Date.now();
    
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'ping', timestamp: pingStart }));
      
      // We'll calculate latency when we receive the pong
      return pingStart;
    }
    return null;
  }, []);

  const updateConnectionStats = useCallback((connected: boolean, isReconnect: boolean = false) => {
    setConnectionStats(prev => ({
      ...prev,
      totalConnections: connected ? prev.totalConnections + 1 : prev.totalConnections,
      totalReconnections: isReconnect ? prev.totalReconnections + 1 : prev.totalReconnections,
      currentStreak: connected ? prev.currentStreak + 1 : 0,
      lastConnected: connected ? Date.now() : prev.lastConnected
    }));
  }, []);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const pingTime = calculateLatency();
        if (pingTime) {
          // Store ping time for latency calculation
          ws.current.send(JSON.stringify({ type: 'heartbeat', timestamp: pingTime }));
        }
      }
    }, 30000); // Heartbeat every 30 seconds
  }, [calculateLatency]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startFallbackPolling = useCallback(() => {
    if (!enableFallback || fallbackPollingRef.current) return;
    
    console.log('🔄 Starting fallback polling mechanism');
    setConnectionStatus('fallback');
    
    fallbackPollingRef.current = setInterval(async () => {
      try {
        // Poll for messages via HTTP endpoint
        const response = await fetch('/api/websocket/poll', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach((message: WebSocketMessage) => {
              setLastMessage(message);
              handleMessage(message);
            });
          }
        }
      } catch (error) {
        console.error('❌ Fallback polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
  }, [enableFallback, getToken]);

  const stopFallbackPolling = useCallback(() => {
    if (fallbackPollingRef.current) {
      clearInterval(fallbackPollingRef.current);
      fallbackPollingRef.current = null;
    }
  }, []);

  const queueMessage = useCallback((message: any) => {
    messageQueueRef.current.push({
      ...message,
      queuedAt: Date.now()
    });
    
    // Limit queue size
    if (messageQueueRef.current.length > 50) {
      messageQueueRef.current.shift();
    }
  }, []);

  const flushMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
      console.log(`📤 Flushing ${messageQueueRef.current.length} queued messages`);
      
      messageQueueRef.current.forEach(message => {
        try {
          ws.current?.send(JSON.stringify(message));
        } catch (error) {
          console.error('❌ Failed to send queued message:', error);
        }
      });
      
      messageQueueRef.current = [];
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    if (!user) {
      console.warn('Cannot connect WebSocket: No authenticated user');
      return;
    }

    // Exponential backoff for reconnection attempts
    if (reconnectAttemptsRef.current > 0) {
      const delay = Math.min(exponentialBackoffRef.current, maxReconnectDelay);
      if (Date.now() - lastConnectAttempt.current < delay) {
        console.log(`⏳ Rate limiting WebSocket connection attempts (${delay}ms)`);
        return;
      }
      exponentialBackoffRef.current = Math.min(exponentialBackoffRef.current * 2, maxReconnectDelay);
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    lastConnectAttempt.current = Date.now();
    stopFallbackPolling();

    try {
      const wsUrl = getWebSocketUrl();
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      ws.current = new WebSocket(wsUrl);

      // Connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket connection timeout');
          ws.current.close();
        }
      }, 10000); // 10 second timeout

      ws.current.onopen = async () => {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionStatus('connected');
        
        const isReconnect = reconnectAttemptsRef.current > 0;
        reconnectAttemptsRef.current = 0;
        exponentialBackoffRef.current = reconnectInterval; // Reset backoff
        
        updateConnectionStats(true, isReconnect);
        startHeartbeat();
        flushMessageQueue();

        if (isReconnect) {
          toast({
            title: "🔄 Reconnected Successfully",
            description: "Real-time updates restored",
            duration: 3000
          });
        }
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
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionStatus('disconnected');
        stopHeartbeat();

        // Handle different close codes
        if (event.code === 1006) {
          console.log('🔄 Abnormal closure detected, attempting recovery...');
        } else if (event.code === 1000) {
          console.log('✅ Normal closure, no reconnection needed');
          return;
        }

        // Attempt reconnection if not intentional close
        if (event.code !== 1000 && reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${reconnectAttempts}`);

          setTimeout(() => {
            connect();
          }, exponentialBackoffRef.current);
        } else if (reconnectAttemptsRef.current >= reconnectAttempts) {
          console.log('❌ Max reconnection attempts reached, starting fallback polling');
          startFallbackPolling();
          
          toast({
            title: "Connection Issues",
            description: "Switched to backup connection mode",
            variant: "destructive",
            duration: 5000
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');

        if (reconnectAttemptsRef.current === 0) {
          toast({
            title: "Connection Error",
            description: "Lost connection to real-time updates. Attempting to reconnect...",
            variant: "destructive",
            duration: 4000
          });
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
      setConnectionStatus('error');
      
      // Start fallback immediately if WebSocket creation fails
      if (enableFallback) {
        startFallbackPolling();
      }
    }
  }, [user, isConnecting, isConnected, reconnectAttempts, maxReconnectDelay, reconnectInterval, updateConnectionStats, startHeartbeat, flushMessageQueue, stopFallbackPolling, startFallbackPolling, enableFallback, toast]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 WebSocket message:', message);

    // Calculate latency for ping/pong
    if (message.type === 'pong' && message.timestamp) {
      const latency = Date.now() - message.timestamp;
      latencyHistoryRef.current.push(latency);
      
      // Keep only last 10 latency measurements
      if (latencyHistoryRef.current.length > 10) {
        latencyHistoryRef.current.shift();
      }
      
      const avgLatency = latencyHistoryRef.current.reduce((a, b) => a + b, 0) / latencyHistoryRef.current.length;
      setConnectionStats(prev => ({ ...prev, averageLatency: Math.round(avgLatency) }));
    }

    switch (message.type) {
      case 'connection_established':
        console.log('🔌 WebSocket connection established, authenticating...');
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'authenticate'
          }));
        }
        break;

      case 'auth_success':
        toast({
          title: "🔒 Secure Connection Established",
          description: "Real-time monitoring active",
          duration: 2000
        });

        // Subscribe to essential channels
        subscribe(['transactions', 'balance_updates', 'security_alerts', 'odds_updates']);
        break;

      case 'recovery_complete':
        console.log(`📥 Recovery complete: ${message.data?.recoveredMessages || 0} messages restored`);
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

      case 'connection_error':
        console.warn('Connection error reported by server:', message);
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  }, [toast, subscribe]);

  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = reconnectAttempts; // Prevent reconnection
    
    if (ws.current) {
      ws.current.close(1000, 'User disconnect');
      ws.current = null;
    }
    
    stopHeartbeat();
    stopFallbackPolling();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [reconnectAttempts, stopHeartbeat, stopFallbackPolling]);

  const send = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        queueMessage(message);
        return false;
      }
    } else {
      queueMessage(message);
      return false;
    }
  }, [queueMessage]);

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
  }, [user, autoConnect, connect, disconnect, isConnected, isConnecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connectionStatus,
    connectionStats,
    lastMessage,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    queuedMessages: messageQueueRef.current.length
  };
}
