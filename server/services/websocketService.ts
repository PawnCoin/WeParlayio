import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAuthenticated?: boolean;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();

  initialize(server: Server) {
    console.log('🔒 Secure WebSocket server initialized with authentication');

    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false,
      maxPayload: 16 * 1024 * 1024,
      clientTracking: true,
      // Replit-specific configurations
      handleProtocols: (protocols) => {
        console.log('🔌 WebSocket protocols:', protocols);
        return protocols.length > 0 ? protocols[0] : false;
      }
    });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      console.log('🔌 New WebSocket connection attempt from:', request.socket.remoteAddress);

      // Set connection alive
      (ws as any).isAlive = true;

      ws.on('pong', () => {
        (ws as any).isAlive = true;
      });

      // Extract token from query params or headers
      const url = new URL(request.url || '', 'http://localhost');
      const token = url.searchParams.get('token') || request.headers.authorization?.split(' ')[1];

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
          ws.userId = decoded.userId;
          ws.isAuthenticated = true;
          this.clients.set(decoded.userId, ws);
          console.log(`✅ Authenticated WebSocket connection for user ${decoded.userId}`);
        } catch (error) {
          console.warn('⚠️ Invalid WebSocket token:', error);
          ws.isAuthenticated = false;
        }
      } else {
        console.log('🔓 Unauthenticated WebSocket connection (public mode)');
        ws.isAuthenticated = false;
        // Allow unauthenticated connections for public features
        const connectionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.clients.set(connectionId, ws);
        ws.userId = connectionId;
      }

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        authenticated: ws.isAuthenticated,
        timestamp: new Date().toISOString(),
        connectionId: ws.userId
      }));

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('❌ WebSocket message parse error:', error);
        }
      });

      ws.on('close', (code, reason) => {
        console.log(`🔌 WebSocket disconnected: ${code} ${reason}`);
        if (ws.userId) {
          this.clients.delete(ws.userId);
        }
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    });

    // Ping clients every 30 seconds to keep connection alive
    const interval = setInterval(() => {
      this.wss?.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          console.log('🔌 Terminating dead WebSocket connection');
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
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
        (ws as any).lastPing = Date.now();
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
    // Placeholder function to prevent errors during compilation
    console.warn("Authentication is not yet implemented");
  }

  private handleSubscription(ws: AuthenticatedWebSocket, payload: any) {
      // Placeholder function to prevent errors during compilation
      console.warn("Subscription is not yet implemented");
  }

  private handleUnsubscription(ws: AuthenticatedWebSocket, payload: any) {
      // Placeholder function to prevent errors during compilation
      console.warn("Unsubscription is not yet implemented");
  }

  public destroy() {
    if (this.wss) {
      this.wss.close();
    }
  }
}

export let websocketService: WebSocketService;

export function initializeWebSocketService(server: any) {
  websocketService = new WebSocketService(server);
  return websocketService;
}