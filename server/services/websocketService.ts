import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

interface WebSocketClient {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>;
  lastSeen: Date;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  initialize(server: HTTPServer) {
    try {
      console.log('🔌 Initializing WebSocket service...');

      this.wss = new WebSocketServer({ 
        server,
        path: '/ws',
        perMessageDeflate: false, // Disable compression to reduce overhead
        maxPayload: 1024 * 1024, // 1MB max message size
      });

      this.wss.on('connection', (ws, request) => {
        this.handleConnection(ws, request);
      });

      this.wss.on('error', (error) => {
        console.error('🚨 WebSocket server error:', error);
      });

      // Start heartbeat to clean up dead connections
      this.startHeartbeat();

      console.log('✅ WebSocket service initialized successfully');
    } catch (error) {
      console.error('🚨 Failed to initialize WebSocket service:', error);
    }
  }

  private handleConnection(ws: WebSocket, request: any) {
    const clientId = this.generateClientId();
    const client: WebSocketClient = {
      id: clientId,
      ws,
      isAlive: true,
      subscriptions: new Set(),
      lastSeen: new Date()
    };

    this.clients.set(clientId, client);
    console.log(`👤 Client ${clientId} connected (${this.clients.size} total)`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'welcome',
      clientId,
      timestamp: new Date().toISOString()
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(clientId, message);
        client.lastSeen = new Date(); // Update last seen on message
      } catch (error) {
        console.warn(`⚠️ Invalid message from client ${clientId}:`, error);
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Invalid message format'
        });
      }
    });

    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.isAlive = true;
        client.lastSeen = new Date();
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`👋 Client ${clientId} disconnected: ${code} ${reason}`);
      this.clients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error(`🚨 Client ${clientId} error:`, error);
      this.clients.delete(clientId);
    });
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastSeen = new Date();

    switch (message.type) {
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        break;

      case 'subscribe':
        if (Array.isArray(message.channels)) {
          message.channels.forEach((channel: string) => {
            client.subscriptions.add(channel);
          });
          this.sendToClient(clientId, { 
            type: 'subscribed', 
            channels: message.channels,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'unsubscribe':
        if (Array.isArray(message.channels)) {
          message.channels.forEach((channel: string) => {
            client.subscriptions.delete(channel);
          });
          this.sendToClient(clientId, { 
            type: 'unsubscribed', 
            channels: message.channels,
            timestamp: new Date().toISOString()
          });
        }
        break;

      default:
        console.log(`📨 Received message from ${clientId}:`, message.type);
    }
  }

  private sendToClient(clientId: string, data: any): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`🚨 Failed to send message to ${clientId}:`, error);
      this.clients.delete(clientId);
      return false;
    }
  }

  broadcast(channel: string, data: any) {
    let sent = 0;
    const message = {
      ...data,
      channel,
      timestamp: new Date().toISOString()
    };

    for (const [clientId, client] of this.clients) {
      if (client.subscriptions.has(channel)) {
        if (this.sendToClient(clientId, message)) {
          sent++;
        }
      }
    }

    return sent;
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isShuttingDown) return;

      const deadClients: string[] = [];

      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          deadClients.push(clientId);
          continue;
        }

        // Check for stale connections based on last activity
        const now = new Date();
        const inactivityDuration = now.getTime() - client.lastSeen.getTime();
        const maxInactivity = 5 * 60 * 1000; // 5 minutes

        if (inactivityDuration > maxInactivity) {
          console.log(`💀 Terminating stale connection: ${clientId}`);
          deadClients.push(clientId);
          client.ws.close(1001, 'Idle timeout'); // Inform client of timeout
          continue;
        }

        client.isAlive = false;

        try {
          client.ws.ping();
        } catch (error) {
          console.error(`🚨 Ping failed for client ${clientId}:`, error);
          deadClients.push(clientId);
          client.ws.close(1011, 'Ping failed'); // Inform client of ping failure
        }
      }

      // Clean up dead clients
      deadClients.forEach(clientId => {
        console.log(`🧹 Cleaning up dead client: ${clientId}`);
        this.clients.delete(clientId);
      });

      if (this.clients.size > 0) {
        console.log(`💓 Heartbeat: ${this.clients.size} active connections`);
      }
    }, 30000); // 30 seconds
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    const subscriptionCounts: Record<string, number> = {};

    for (const client of this.clients.values()) {
      for (const channel of client.subscriptions) {
        subscriptionCounts[channel] = (subscriptionCounts[channel] || 0) + 1;
      }
    }

    return {
      totalClients: this.clients.size,
      subscriptionCounts,
      uptime: process.uptime()
    };
  }

  shutdown() {
    console.log('🔌 Shutting down WebSocket service...');
    this.isShuttingDown = true;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all client connections
    for (const [clientId, client] of this.clients) {
      try {
        client.ws.close(1001, 'Server shutting down');
      } catch (error) {
        console.error(`Error closing client ${clientId}:`, error);
      }
    }

    if (this.wss) {
      this.wss.close();
    }

    console.log('✅ WebSocket service shut down');
  }
}

export const websocketService = new WebSocketService();

export function initializeWebSocketService(server: HTTPServer) {
  websocketService.initialize(server);

  // Graceful shutdown
  process.on('SIGTERM', () => websocketService.shutdown());
  process.on('SIGINT', () => websocketService.shutdown());
}

// Export for use in routes
export { websocketService as default };