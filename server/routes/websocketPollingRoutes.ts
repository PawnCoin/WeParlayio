
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Message queues for fallback polling
const messageQueues = new Map<string, any[]>();
const lastPollTime = new Map<string, number>();

// Polling endpoint for WebSocket fallback
router.get('/poll', isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const since = parseInt(req.query.since as string) || Date.now() - 30000; // Last 30 seconds
  
  try {
    // Get messages for this user since last poll
    const messages = messageQueues.get(userId) || [];
    const newMessages = messages.filter(msg => msg.timestamp > since);
    
    // Update last poll time
    lastPollTime.set(userId, Date.now());
    
    res.json({
      messages: newMessages,
      timestamp: Date.now(),
      hasMore: newMessages.length === 50 // Pagination hint
    });
    
    // Clean up old messages
    if (messages.length > 100) {
      messageQueues.set(userId, messages.slice(-50));
    }
    
  } catch (error) {
    console.error('❌ Polling endpoint error:', error);
    res.status(500).json({ error: 'Polling failed' });
  }
});

// Endpoint to queue messages for users (called by other services)
router.post('/queue/:userId', (req, res) => {
  const { userId } = req.params;
  const message = req.body;
  
  try {
    if (!messageQueues.has(userId)) {
      messageQueues.set(userId, []);
    }
    
    const queue = messageQueues.get(userId)!;
    queue.push({
      ...message,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    // Limit queue size
    if (queue.length > 100) {
      queue.shift();
    }
    
    res.json({ success: true, queueSize: queue.length });
    
  } catch (error) {
    console.error('❌ Message queue error:', error);
    res.status(500).json({ error: 'Failed to queue message' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    activeQueues: messageQueues.size,
    totalQueuedMessages: Array.from(messageQueues.values()).reduce((total, queue) => total + queue.length, 0),
    timestamp: Date.now()
  });
});

export default router;
