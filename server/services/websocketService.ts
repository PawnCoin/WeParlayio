// WebSocket functionality disabled to prevent port conflicts with Replit infrastructure
// Using polling-based fallback for real-time features

import { Server } from 'http';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface ConnectedClient {
  ws: any;
  userId?: string;
  subscriptions: Set<string>;
  lastPing: number;
  id: string;
}

class WebSocketService {
  private wss: any = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private server: Server | null = null;
  private initialized = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  public initialize(server: Server): boolean {
    console.log('⚠️ WebSocket service disabled - Using polling fallback for real-time features');
    return false;
  }

  private setupWebSocketServer(): void {
    // WebSocket server completely disabled to prevent port conflicts
    return;
  }

  private startHeartbeat(): void {
    // Heartbeat disabled
  }

  private handleMessage(clientId: string, message: WebSocketMessage): void {
    // Message handling disabled
  }

  private subscribe(clientId: string, channel: string): void {
    // Subscription disabled
  }

  private unsubscribe(clientId: string, channel: string): void {
    // Unsubscription disabled
  }

  private handleDisconnect(clientId: string): void {
    // Disconnect handling disabled
  }

  public sendToClient(clientId: string, message: WebSocketMessage): void {
    // Send to client disabled - use polling fallback
  }

  public broadcast(channel: string, message: WebSocketMessage): void {
    // Broadcast disabled - use polling fallback
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public getStats(): { totalClients: number, subscriptions: any, apiHealth?: any } {
    return {
      totalClients: 0,
      subscriptions: {},
      apiHealth: { status: 'disabled', reason: 'port_conflict_prevention' }
    };
  }

  public isInitialized(): boolean {
    return false;
  }

  public close(): void {
    console.log('🔌 WebSocket service was disabled - no cleanup needed');
  }
}

// WebSocket service disabled to prevent port conflicts
export const websocketService = {
  initialize: () => false,
  isInitialized: () => false,
  broadcast: () => {},
  subscribeToChannel: () => {},
  broadcastToChannel: () => {},
  getStats: () => ({ totalClients: 0, subscriptions: {}, apiHealth: { status: 'disabled' } }),
  close: () => {}
};

export const initializeWebSocketService = (server: Server): void => {
  console.log('⚠️ WebSocket service disabled - Using polling fallback for real-time features');
};

export { websocketService as default };