import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import WebSocket from 'ws';

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private wss: WebSocket.Server | null = null;

  constructor(server: HTTPServer) {
    try {
      // Set up Socket.IO server
      this.io = new SocketIOServer(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
          credentials: true
        },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        allowEIO3: true
      });

      // Set up WebSocket server for /ws endpoint
      this.wss = new WebSocket.Server({ 
        server,
        path: '/ws'
      });

      this.setupSocketIOHandlers();
      this.setupWebSocketHandlers();

      console.log('🚀 WebSocket services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket services:', error);
    }
  }

  private setupSocketIOHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log('🔌 Socket.IO client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('🔌 Socket.IO client disconnected:', socket.id);
      });

      socket.on('error', (error) => {
        console.error('❌ Socket.IO error:', error);
      });

      // Join betting rooms
      socket.on('join-betting', (gameId) => {
        socket.join(`betting-${gameId}`);
        console.log(`📊 Client joined betting room: betting-${gameId}`);
      });

      // Handle live odds updates
      socket.on('subscribe-odds', (gameId) => {
        socket.join(`odds-${gameId}`);
        console.log(`📈 Client subscribed to odds: odds-${gameId}`);
      });
    });
  }

  private setupWebSocketHandlers() {
    if (!this.wss) return;

    this.wss.on('connection', (ws) => {
      console.log('🔌 WebSocket client connected');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📨 WebSocket message received:', data);

          // Echo back for testing
          ws.send(JSON.stringify({
            type: 'response',
            message: 'Message received',
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('❌ WebSocket message parsing error:', error);
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to WeParlay WebSocket',
        timestamp: new Date().toISOString()
      }));
    });
  }

  public broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  public sendToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(userId).emit(event, data);
    }
  }

  public broadcastToRoom(room: string, event: string, data: any) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  public broadcastOddsUpdate(gameId: string, odds: any) {
    this.broadcastToRoom(`odds-${gameId}`, 'odds-update', {
      gameId,
      odds,
      timestamp: new Date().toISOString()
    });
  }
}