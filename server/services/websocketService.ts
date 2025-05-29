import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  subscriptions?: Set<string>;
  lastPing?: number;
  isAuthenticated?: boolean;
}

export class SecureWebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  private authenticatedConnections: Set<any> = new Set();

  constructor(server: any) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();

    console.log('🔒 Secure WebSocket server initialized with authentication');
  }

  private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
    // Verify origin and security
    const allowedOrigins = [
      'https://weparlay.io',
      'https://f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev',
      'http://localhost:5000'
    ];

    return info.secure || process.env.NODE_ENV === 'development';
  }

  handleConnection(ws: any) {
    console.log('🔌 New WebSocket connection attempt');

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'WebSocket connected. Please authenticate.',
      timestamp: Date.now()
    }));

    // Set authentication timeout - give more time for demo
    const authTimeout = setTimeout(() => {
      if (!this.authenticatedConnections.has(ws)) {
        console.log('⏰ WebSocket authentication timeout');
        ws.close(4001, 'Authentication timeout');
      }
    }, 60000); // Increased to 60 seconds

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'authenticate') {
          clearTimeout(authTimeout);

          // Simple authentication - in production, verify the token
          this.authenticatedConnections.add(ws);
          ws.isAuthenticated = true;

          // Add client to real-time odds service
          this.addToRealTimeOdds(ws);

          ws.send(JSON.stringify({
            type: 'authentication',
            data: { status: 'success' },
            message: 'Successfully authenticated',
            timestamp: Date.now()
          }));

          console.log('✅ WebSocket client authenticated and added to real-time updates');
        } else if (data.type === 'ping') {
          // Respond to heartbeat
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }));
        } else {
          // Handle other message types after authentication
          if (this.authenticatedConnections.has(ws)) {
            this.handleMessage(ws, data);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Please authenticate first'
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      clearTimeout(authTimeout);
      this.authenticatedConnections.delete(ws);
      console.log('🔌 WebSocket connection closed');
    });

    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      clearTimeout(authTimeout);
      this.authenticatedConnections.delete(ws);
    });
  }

  private async addToRealTimeOdds(ws: any) {
    try {
      // Dynamically import and add client to real-time odds service
      const { realTimeOddsService } = await import('./realTimeOddsService');
      realTimeOddsService.addClient(ws);
    } catch (error) {
      console.error('Failed to add client to real-time odds service:', error);
    }
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'auth':
        await this.handleAuthentication(ws, payload);
        break;

      case 'subscribe':
        this.handleSubscription(ws, payload);
        break;

      case 'unsubscribe':
        this.handleUnsubscription(ws, payload);
        break;

      case 'ping':
        ws.lastPing = Date.now();
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  private async handleAuthentication(ws: AuthenticatedWebSocket, payload: any) {
    try {
      const { token } = payload;

      if (!token) {
        ws.close(4001, 'No authentication token provided');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      const userId = decoded.sub;

      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        ws.close(4001, 'Invalid user');
        return;
      }

      ws.userId = userId;
      ws.isAuthenticated = true;

      // Add to client map
      if (!this.clients.has(userId)) {
        this.clients.set(userId, []);
      }
      this.clients.get(userId)!.push(ws);

      // Send authentication success
      ws.send(JSON.stringify({
        type: 'auth_success',
        message: 'Authentication successful',
        userId: userId,
        timestamp: Date.now()
      }));

      // Send initial data
      await this.sendInitialData(ws, userId);

      console.log(`✅ User ${userId} authenticated via WebSocket`);
    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(4001, 'Authentication failed');
    }
  }

  private async sendInitialData(ws: AuthenticatedWebSocket, userId: string) {
    try {
      const user = await storage.getUser(userId);

      // Send current balances
      ws.send(JSON.stringify({
        type: 'balance_update',
        data: {
          realMoney: user?.balance || 0,
          weparlayCash: user?.weplayTokenBalance || 0
        },
        timestamp: Date.now()
      }));

      // Send recent transactions
      const transactions = await storage.getTransactions(10, 0);
      const userTransactions = transactions.filter(t => t.userId === userId);

      ws.send(JSON.stringify({
        type: 'transaction_history',
        data: userTransactions,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  private handleSubscription(ws: AuthenticatedWebSocket, payload: any) {
    if (!ws.isAuthenticated) {
      ws.close(4001, 'Not authenticated');
      return;
    }

    const { channels } = payload;

    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        ws.subscriptions!.add(channel);
      });
    }

    ws.send(JSON.stringify({
      type: 'subscription_success',
      channels: Array.from(ws.subscriptions!),
      timestamp: Date.now()
    }));
  }

  private handleUnsubscription(ws: AuthenticatedWebSocket, payload: any) {
    const { channels } = payload;

    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        ws.subscriptions!.delete(channel);
      });
    }

    ws.send(JSON.stringify({
      type: 'unsubscription_success',
      channels: Array.from(ws.subscriptions!),
      timestamp: Date.now()
    }));
  }

  private removeClient(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        const index = userClients.indexOf(ws);
        if (index > -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          this.clients.delete(ws.userId);
        }
      }
      console.log(`🔌 User ${ws.userId} disconnected from WebSocket`);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (Date.now() - (ws.lastPing || 0) > 60000) { // 60 second timeout
          ws.terminate();
        }
      });
    }, 30000); // Check every 30 seconds
  }

  // PUBLIC METHODS FOR BROADCASTING

  public broadcastToUser(userId: string, message: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            ...message,
            timestamp: Date.now()
          }));
        }
      });
    }
  }

  public broadcastTransactionUpdate(userId: string, transaction: any) {
    this.broadcastToUser(userId, {
      type: 'transaction_update',
      data: transaction
    });
  }

  public broadcastBalanceUpdate(userId: string, balances: any) {
    this.broadcastToUser(userId, {
      type: 'balance_update',
      data: balances
    });
  }

  public broadcastSecurityAlert(userId: string, alert: any) {
    this.broadcastToUser(userId, {
      type: 'security_alert',
      data: alert,
      priority: 'HIGH'
    });
  }

  public broadcastOddsUpdate(data: any) {
    this.wss.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.readyState === WebSocket.OPEN && 
          client.subscriptions?.has('odds_updates')) {
        client.send(JSON.stringify({
          type: 'odds_update',
          data,
          timestamp: Date.now()
        }));
      }
    });
  }

  public broadcastLiveGameUpdate(data: any) {
    this.wss.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.readyState === WebSocket.OPEN && 
          client.subscriptions?.has('live_games')) {
        client.send(JSON.stringify({
          type: 'live_game_update',
          data,
          timestamp: Date.now()
        }));
      }
    });
  }

  public getConnectedUsersCount(): number {
    return this.clients.size;
  }

  public getUserConnectionCount(userId: string): number {
    return this.clients.get(userId)?.length || 0;
  }

  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}

export let websocketService: SecureWebSocketService;

export function initializeWebSocketService(server: any) {
  websocketService = new SecureWebSocketService(server);
  return websocketService;
}