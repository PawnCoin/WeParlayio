import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
  lastPing: number;
  id: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private server: Server | null = null;
  private initialized = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  public initialize(server: Server): boolean {
    // Disable WebSocket service to prevent port conflicts
    console.log('⚠️ WebSocket service disabled - Fantasy Analytics Dashboard running without real-time features');
    return false;
  }

  private setupWebSocketServer(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket, request: any) => {
      const clientId = this.generateClientId();
      const client: ConnectedClient = {
        ws,
        subscriptions: new Set(),
        lastPing: Date.now(),
        id: clientId
      };
      this.clients.set(clientId, client);

      console.log(`🔌 Client ${clientId} connected. Total clients: ${this.clients.size}`);

      // Configure WebSocket
      ws.on('open', () => {
        console.log(`✅ WebSocket opened for client ${clientId}`);
      });

      // Send welcome message after connection is fully established
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'connection',
            data: { 
              status: 'connected', 
              clientId,
              serverTime: Date.now(),
              features: ['live-odds', 'bet-updates', 'notifications']
            },
            timestamp: Date.now()
          }));
        }
      }, 100);

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          this.sendToClient(clientId, {
            type: 'error',
            data: { message: 'Invalid message format' },
            timestamp: Date.now()
          });
        }
      });

      ws.on('close', (code, reason) => {
        console.log(`🔌 Client ${clientId} disconnected with code ${code}: ${reason}`);
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for client ${clientId}:`, error);
        this.handleDisconnect(clientId);
      });

      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      ws.on('pong', () => {
        console.log(`💓 Pong received from client ${clientId}`);
      });
    });

    console.log('🎧 WebSocket server is listening on 0.0.0.0');
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          // Find and remove dead connection
          for (const [clientId, client] of Array.from(this.clients.entries())) {
            if (client.ws === ws) {
              this.handleDisconnect(clientId);
              break;
            }
          }
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 second heartbeat
  }

  private handleMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) {
      console.log(`❌ Client ${clientId} not found`);
      return;
    }

    switch (message.type) {
      case 'subscribe':
        if (typeof message.data === 'string') {
          this.subscribe(clientId, message.data);
        } else if (Array.isArray(message.data)) {
          message.data.forEach(channel => this.subscribe(clientId, channel));
        }
        break;
      case 'unsubscribe':
        if (typeof message.data === 'string') {
          this.unsubscribe(clientId, message.data);
        } else if (Array.isArray(message.data)) {
          message.data.forEach(channel => this.unsubscribe(clientId, channel));
        }
        break;
      case 'ping':
        client.lastPing = Date.now();
        this.sendToClient(clientId, { type: 'pong', data: null, timestamp: Date.now() });
        break;
      default:
        console.warn(`⚠️ Unknown message type from client ${clientId}: ${message.type}`);
        this.sendToClient(clientId, {
          type: 'error',
          data: { message: 'Unknown message type' },
          timestamp: Date.now()
        });
    }
  }

  private subscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!client.subscriptions.has(channel)) {
      client.subscriptions.add(channel);
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel)?.add(clientId);
      console.log(`✅ Client ${clientId} subscribed to ${channel}`);
    }
  }

  private unsubscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.subscriptions.has(channel)) {
      client.subscriptions.delete(channel);
      this.subscriptions.get(channel)?.delete(clientId);
      console.log(`✅ Client ${clientId} unsubscribed from ${channel}`);
    }
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove client from all subscriptions
    client.subscriptions.forEach(channel => {
      this.subscriptions.get(channel)?.delete(clientId);
      if (this.subscriptions.get(channel)?.size === 0) {
        this.subscriptions.delete(channel);
      }
    });

    this.clients.delete(clientId);
    console.log(`🔌 Client ${clientId} disconnected. Total clients: ${this.clients.size}`);
  }

  public sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message), err => {
        if (err) {
          console.error(`❌ Error sending message to client ${clientId}:`, err);
        }
      });
    } else {
      console.log(`❌ Cannot send message to client ${clientId} - not connected`);
      this.handleDisconnect(clientId);
    }
  }

  public broadcast(channel: string, message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(channel);
    if (subscribers) {
      subscribers.forEach(clientId => {
        this.sendToClient(clientId, message);
      });
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  public getStats(): { totalClients: number, subscriptions: any, apiHealth?: any } {
    const subscriptionStats: any = {};
    for (const [channel, clients] of Array.from(this.subscriptions.entries())) {
      subscriptionStats[channel] = clients.size;
    }

    // Check API health if available
    let apiHealth = null;
    try {
      const { validateAPIConfiguration } = require('../config/apiConfiguration');
      const validation = validateAPIConfiguration();
      apiHealth = {
        configured: validation.configured.length,
        missing: validation.missing.length,
        critical: validation.criticalFailure
      };
    } catch (error) {
      console.warn('Could not check API health:', (error as Error).message);
    }

    return {
      totalClients: this.clients.size,
      subscriptions: subscriptionStats,
      apiHealth
    };
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public close(): void {
    console.log('🔌 Closing WebSocket server...');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach(client => {
      client.ws.close(1000, 'Server is closing');
    });

    if (this.wss) {
      this.wss.close(err => {
        if (err) {
          console.error('❌ Error closing WebSocket server:', err);
        } else {
          console.log('✅ WebSocket server closed');
        }
      });
    }
  }
}

// WebSocket service disabled to prevent port conflicts
// export const websocketService = new WebSocketService();
export const websocketService = {
  initialize: () => false,
  isInitialized: () => false,
  broadcast: () => {},
  subscribeToChannel: () => {},
  broadcastToChannel: () => {}
};

export const initializeWebSocketService = (server: Server): void => {
  if (websocketService.isInitialized()) {
    console.log('⚠️ WebSocket service already initialized');
    return;
  }

  console.log('🔌 Initializing WebSocket service...');
}

export { websocketService as default };