import { Server } from 'http';

// WebSocket service completely disabled to prevent port conflicts
class WebSocketService {
  private initialized = false;

  public initialize(server: Server): boolean {
    console.log('⚠️ WebSocket service permanently disabled');
    this.initialized = false;
    return false;
  }

  public getStats(): { totalClients: number, subscriptions: any, apiHealth?: any } {
    return {
      totalClients: 0,
      subscriptions: {},
      apiHealth: null
    };
  }

  public isInitialized(): boolean {
    return false;
  }

  public close(): void {
    // No-op since service is disabled
  }

  public broadcast(channel: string, message: any): void {
    // No-op since service is disabled
  }
}

export const websocketService = new WebSocketService();

export const initializeWebSocketService = (server: Server): void => {
  console.log('🔌 WebSocket service disabled to prevent conflicts');
};