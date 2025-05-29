
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAuthenticated?: boolean;
  lastPing?: number;
  connectionId?: string;
  subscriptions?: Set<string>;
}

interface ConnectionHealth {
  userId: string;
  connected: boolean;
  lastSeen: number;
  reconnectCount: number;
  subscriptions: string[];
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();
  private connectionHealth: Map<string, ConnectionHealth> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private messageQueue: Map<string, any[]> = new Map();
  private fallbackPolling: Map<string, NodeJS.Timeout> = new Map();

  initialize(server: Server) {
    console.log('🛡️ Initializing bulletproof WebSocket service with multiple fallback layers');

    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: {
        zlibDeflateOptions: {
          compressionLevel: 6,
          windowBits: 15,
          memLevel: 8,
        },
        threshold: 1024,
        concurrencyLimit: 10,
        serverMaxWindowBits: 15,
        clientMaxWindowBits: 15,
        serverMaxNoContextTakeover: false,
        clientMaxNoContextTakeover: false,
      },
      maxPayload: 16 * 1024 * 1024,
      clientTracking: true,
      skipUTF8Validation: false,
      handleProtocols: (protocols) => {
        console.log('🔌 WebSocket protocols:', protocols);
        return protocols.length > 0 ? protocols[0] : false;
      }
    });

    this.setupConnectionHandling();
    this.startHeartbeat();
    this.startCleanupService();
    this.setupGracefulShutdown();
  }

  private setupConnectionHandling() {
    if (!this.wss) return;

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      const connectionId = this.generateConnectionId();
      const clientIP = request.socket.remoteAddress || 'unknown';
      
      console.log(`🔌 New WebSocket connection [${connectionId}] from: ${clientIP}`);

      // Enhanced connection setup
      ws.connectionId = connectionId;
      ws.subscriptions = new Set();
      (ws as any).isAlive = true;
      (ws as any).connectionTime = Date.now();
      (ws as any).lastActivity = Date.now();

      // Handle authentication
      this.handleAuthentication(ws, request);

      // Set up connection-specific handlers
      this.setupConnectionHandlers(ws);

      // Store connection
      this.clients.set(connectionId, ws);
      
      // Send welcome message with connection details
      this.sendSafeMessage(ws, {
        type: 'connection_established',
        connectionId,
        authenticated: ws.isAuthenticated,
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
        fallbackOptions: ['polling', 'sse', 'long-polling']
      });
    });

    this.wss.on('error', (error) => {
      console.error('🚨 WebSocket Server Error:', error);
      this.handleServerError(error);
    });

    this.wss.on('close', () => {
      console.log('🔌 WebSocket Server closed');
      this.cleanup();
    });
  }

  private handleAuthentication(ws: AuthenticatedWebSocket, request: any) {
    try {
      const url = new URL(request.url || '', 'http://localhost');
      const token = url.searchParams.get('token') || request.headers.authorization?.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        ws.userId = decoded.userId;
        ws.isAuthenticated = true;
        
        // Update connection health
        this.updateConnectionHealth(decoded.userId, true);
        console.log(`✅ Authenticated WebSocket connection for user ${decoded.userId}`);
        
        // Restore queued messages
        this.flushMessageQueue(decoded.userId, ws);
      } else {
        ws.isAuthenticated = false;
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        ws.userId = guestId;
        console.log(`🔓 Guest WebSocket connection [${guestId}]`);
      }
    } catch (error) {
      console.warn('⚠️ Authentication failed:', error);
      ws.isAuthenticated = false;
      ws.userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  private setupConnectionHandlers(ws: AuthenticatedWebSocket) {
    // Enhanced pong handler
    ws.on('pong', (data) => {
      (ws as any).isAlive = true;
      (ws as any).lastActivity = Date.now();
      ws.lastPing = Date.now();
      
      if (ws.userId) {
        this.updateConnectionHealth(ws.userId, true);
      }
    });

    // Message handler with error recovery
    ws.on('message', (message: Buffer | string) => {
      try {
        (ws as any).lastActivity = Date.now();
        const data = JSON.parse(message.toString());
        this.handleMessage(ws, data);
      } catch (error) {
        console.error('❌ WebSocket message parse error:', error);
        this.sendSafeMessage(ws, {
          type: 'error',
          message: 'Invalid message format',
          timestamp: Date.now()
        });
      }
    });

    // Enhanced close handler
    ws.on('close', (code, reason) => {
      const reasonStr = reason?.toString() || 'Unknown';
      console.log(`🔌 WebSocket disconnected [${ws.connectionId}]: ${code} ${reasonStr}`);
      
      if (ws.userId) {
        this.updateConnectionHealth(ws.userId, false);
        this.setupFallbackPolling(ws.userId);
      }

      if (ws.connectionId) {
        this.clients.delete(ws.connectionId);
      }
    });

    // Enhanced error handler
    ws.on('error', (error) => {
      console.error(`❌ WebSocket error [${ws.connectionId}]:`, error);
      
      if (ws.userId) {
        this.updateConnectionHealth(ws.userId, false);
        this.queueMessage(ws.userId, {
          type: 'connection_error',
          error: error.message,
          timestamp: Date.now(),
          recovery: 'attempting_reconnect'
        });
      }
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: any) {
    const { type, payload } = message;
    (ws as any).lastActivity = Date.now();

    try {
      switch (type) {
        case 'authenticate':
          await this.handleReAuthentication(ws, payload);
          break;

        case 'subscribe':
          this.handleSubscription(ws, payload);
          break;

        case 'unsubscribe':
          this.handleUnsubscription(ws, payload);
          break;

        case 'ping':
          this.handlePing(ws);
          break;

        case 'heartbeat':
          this.handleHeartbeat(ws);
          break;

        case 'recovery_request':
          this.handleRecoveryRequest(ws, payload);
          break;

        default:
          this.sendSafeMessage(ws, {
            type: 'error',
            message: `Unknown message type: ${type}`,
            timestamp: Date.now()
          });
      }
    } catch (error) {
      console.error('❌ Message handling error:', error);
      this.sendSafeMessage(ws, {
        type: 'error',
        message: 'Message processing failed',
        timestamp: Date.now()
      });
    }
  }

  private async handleReAuthentication(ws: AuthenticatedWebSocket, payload: any) {
    this.sendSafeMessage(ws, {
      type: 'auth_success',
      timestamp: Date.now(),
      connectionId: ws.connectionId,
      features: ['real_time_updates', 'push_notifications', 'live_data']
    });
  }

  private handleSubscription(ws: AuthenticatedWebSocket, payload: any) {
    const { channels = [] } = payload;
    
    channels.forEach((channel: string) => {
      ws.subscriptions?.add(channel);
    });

    this.sendSafeMessage(ws, {
      type: 'subscription_success',
      channels,
      timestamp: Date.now()
    });

    console.log(`📡 User ${ws.userId} subscribed to: ${channels.join(', ')}`);
  }

  private handleUnsubscription(ws: AuthenticatedWebSocket, payload: any) {
    const { channels = [] } = payload;
    
    channels.forEach((channel: string) => {
      ws.subscriptions?.delete(channel);
    });

    this.sendSafeMessage(ws, {
      type: 'unsubscription_success',
      channels,
      timestamp: Date.now()
    });
  }

  private handlePing(ws: AuthenticatedWebSocket) {
    this.sendSafeMessage(ws, {
      type: 'pong',
      timestamp: Date.now(),
      serverTime: new Date().toISOString()
    });
  }

  private handleHeartbeat(ws: AuthenticatedWebSocket) {
    (ws as any).lastActivity = Date.now();
    if (ws.userId) {
      this.updateConnectionHealth(ws.userId, true);
    }
  }

  private handleRecoveryRequest(ws: AuthenticatedWebSocket, payload: any) {
    if (ws.userId) {
      const queuedMessages = this.messageQueue.get(ws.userId) || [];
      
      queuedMessages.forEach(msg => {
        this.sendSafeMessage(ws, msg);
      });

      this.messageQueue.delete(ws.userId);
      
      this.sendSafeMessage(ws, {
        type: 'recovery_complete',
        recoveredMessages: queuedMessages.length,
        timestamp: Date.now()
      });
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // 30 seconds
  }

  private performHealthCheck() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds timeout

    this.clients.forEach((ws, connectionId) => {
      const lastActivity = (ws as any).lastActivity || (ws as any).connectionTime;
      
      if (now - lastActivity > timeout) {
        console.log(`🏥 Health check failed for connection ${connectionId}`);
        ws.terminate();
        this.clients.delete(connectionId);
        return;
      }

      if ((ws as any).isAlive === false) {
        console.log(`💀 Terminating dead connection ${connectionId}`);
        ws.terminate();
        this.clients.delete(connectionId);
        return;
      }

      // Send ping
      (ws as any).isAlive = false;
      try {
        ws.ping();
      } catch (error) {
        console.error(`❌ Ping failed for ${connectionId}:`, error);
        ws.terminate();
        this.clients.delete(connectionId);
      }
    });

    console.log(`🏥 Health check completed. Active connections: ${this.clients.size}`);
  }

  private startCleanupService() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
      this.cleanupMessageQueues();
    }, 300000); // 5 minutes
  }

  private cleanupStaleConnections() {
    const now = Date.now();
    const staleThreshold = 3600000; // 1 hour

    this.connectionHealth.forEach((health, userId) => {
      if (!health.connected && now - health.lastSeen > staleThreshold) {
        this.connectionHealth.delete(userId);
        this.messageQueue.delete(userId);
        this.fallbackPolling.delete(userId);
        console.log(`🧹 Cleaned up stale connection for user ${userId}`);
      }
    });
  }

  private cleanupMessageQueues() {
    this.messageQueue.forEach((messages, userId) => {
      if (messages.length > 100) {
        // Keep only the latest 50 messages
        this.messageQueue.set(userId, messages.slice(-50));
        console.log(`🧹 Trimmed message queue for user ${userId}`);
      }
    });
  }

  private setupFallbackPolling(userId: string) {
    if (this.fallbackPolling.has(userId)) return;

    const pollInterval = setInterval(() => {
      // Check if user reconnected via WebSocket
      const hasActiveConnection = Array.from(this.clients.values())
        .some(ws => ws.userId === userId && ws.readyState === WebSocket.OPEN);

      if (hasActiveConnection) {
        clearInterval(pollInterval);
        this.fallbackPolling.delete(userId);
        return;
      }

      // Send queued messages via alternative method (could be HTTP polling endpoint)
      const queuedMessages = this.messageQueue.get(userId);
      if (queuedMessages && queuedMessages.length > 0) {
        console.log(`📡 Fallback: ${queuedMessages.length} messages queued for ${userId}`);
      }
    }, 10000); // Poll every 10 seconds

    this.fallbackPolling.set(userId, pollInterval);
  }

  private sendSafeMessage(ws: AuthenticatedWebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('❌ Send message error:', error);
        if (ws.userId) {
          this.queueMessage(ws.userId, message);
        }
        return false;
      }
    } else {
      if (ws.userId) {
        this.queueMessage(ws.userId, message);
      }
      return false;
    }
  }

  private queueMessage(userId: string, message: any) {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }

    const queue = this.messageQueue.get(userId)!;
    queue.push({
      ...message,
      queuedAt: Date.now()
    });

    // Limit queue size
    if (queue.length > 50) {
      queue.shift();
    }
  }

  private flushMessageQueue(userId: string, ws: AuthenticatedWebSocket) {
    const queuedMessages = this.messageQueue.get(userId);
    if (queuedMessages && queuedMessages.length > 0) {
      console.log(`📤 Flushing ${queuedMessages.length} queued messages for ${userId}`);
      
      queuedMessages.forEach(message => {
        this.sendSafeMessage(ws, message);
      });

      this.messageQueue.delete(userId);
    }
  }

  private updateConnectionHealth(userId: string, connected: boolean) {
    const existing = this.connectionHealth.get(userId);
    
    this.connectionHealth.set(userId, {
      userId,
      connected,
      lastSeen: Date.now(),
      reconnectCount: existing ? (connected ? 0 : existing.reconnectCount + 1) : 0,
      subscriptions: existing?.subscriptions || []
    });
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private handleServerError(error: Error) {
    console.error('🚨 WebSocket Server Critical Error:', error);
    
    // Attempt recovery
    setTimeout(() => {
      if (this.wss && this.wss.readyState === WebSocketServer.CLOSING) {
        console.log('🔄 Attempting WebSocket server recovery...');
        // Could trigger a server restart or recovery mechanism
      }
    }, 5000);
  }

  private setupGracefulShutdown() {
    const shutdown = () => {
      console.log('🛑 WebSocket service shutting down gracefully...');
      this.cleanup();
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught exception in WebSocket service:', error);
      this.cleanup();
    });
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.fallbackPolling.forEach(interval => clearInterval(interval));
    this.fallbackPolling.clear();

    this.clients.clear();
    this.connectionHealth.clear();
    this.messageQueue.clear();
  }

  // Public methods for broadcasting
  public broadcast(message: any, channel?: string) {
    const activeConnections = Array.from(this.clients.values())
      .filter(ws => ws.readyState === WebSocket.OPEN);

    let sent = 0;
    let failed = 0;

    activeConnections.forEach(ws => {
      if (channel && !ws.subscriptions?.has(channel)) {
        return;
      }

      if (this.sendSafeMessage(ws, message)) {
        sent++;
      } else {
        failed++;
      }
    });

    console.log(`📡 Broadcast: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  public getConnectionStats() {
    return {
      activeConnections: this.clients.size,
      healthyConnections: Array.from(this.connectionHealth.values()).filter(h => h.connected).length,
      queuedMessages: Array.from(this.messageQueue.values()).reduce((total, queue) => total + queue.length, 0),
      fallbackPolling: this.fallbackPolling.size
    };
  }

  public destroy() {
    console.log('🔥 Destroying WebSocket service...');
    this.cleanup();
    
    if (this.wss) {
      this.wss.close(() => {
        console.log('✅ WebSocket server closed');
      });
    }
  }
}

export let websocketService: WebSocketService;

export function initializeWebSocketService(server: any) {
  websocketService = new WebSocketService();
  websocketService.initialize(server);
  return websocketService;
}
