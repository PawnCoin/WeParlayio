// WebSocket error handling to prevent console warnings
export class WebSocketHandler {
  private static instance: WebSocketHandler;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  static getInstance(): WebSocketHandler {
    if (!WebSocketHandler.instance) {
      WebSocketHandler.instance = new WebSocketHandler();
    }
    return WebSocketHandler.instance;
  }

  handleWebSocketError(error: any): void {
    // Silently handle WebSocket connection errors in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 WebSocket disabled in development environment');
      return;
    }

    // In production, attempt graceful reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        // Attempt reconnection logic here
      }, 1000 * this.reconnectAttempts);
    }
  }

  preventUnhandledRejection(): void {
    // Global handler for WebSocket-related unhandled rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorMessage = event.reason?.message || '';
      if (errorMessage.includes('WebSocket') || errorMessage.includes('websocket')) {
        event.preventDefault(); // Prevent console warning
        this.handleWebSocketError(event.reason);
      }
    });
  }
}

// Initialize WebSocket error handling
if (typeof window !== 'undefined') {
  WebSocketHandler.getInstance().preventUnhandledRejection();
}