import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./simpleStorage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { smsService } from "./services/smsService";
import { espnApiService } from "./services/espnApiService";
import notificationRoutes from "./routes/notificationRoutes-simplified";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "No user ID found" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Sports data endpoints
  app.get('/api/sports', async (req, res) => {
    try {
      const sports = await storage.getAllSports();
      res.json(sports);
    } catch (error) {
      console.error('Error fetching sports:', error);
      res.status(500).json({ message: 'Failed to fetch sports' });
    }
  });

  app.get('/api/events/live', async (req, res) => {
    try {
      const events = await espnApiService.getLiveEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching live events:', error);
      res.status(500).json({ message: 'Failed to fetch live events' });
    }
  });

  // SMS service status
  app.get('/api/sms/status', async (req, res) => {
    try {
      res.json({
        configured: smsService.isServiceConfigured(),
        message: smsService.isServiceConfigured() 
          ? 'SMS service is ready' 
          : 'SMS service requires Twilio configuration'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check SMS status' });
    }
  });

  // Betting challenge creation (simplified)
  app.post('/api/betting-challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { eventName, amount, pick, phoneNumber } = req.body;
      
      if (!eventName || !amount || !pick) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const challenge = await storage.createBettingChallenge({
        createdBy: userId,
        eventName,
        amount: parseFloat(amount),
        pick,
        status: 'pending'
      });

      // Send SMS notification if phone number provided
      if (phoneNumber && smsService.isServiceConfigured()) {
        try {
          await smsService.sendBettingChallenge(phoneNumber, {
            challengerName: 'WeParlay User',
            amount: amount.toString(),
            event: eventName,
            odds: 'Even'
          });
        } catch (smsError) {
          console.error('SMS send failed:', smsError);
          // Don't fail the challenge creation if SMS fails
        }
      }

      res.json({ success: true, challenge });
    } catch (error) {
      console.error('Error creating betting challenge:', error);
      res.status(500).json({ message: 'Failed to create betting challenge' });
    }
  });

  // User challenges
  app.get('/api/user/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const challenges = await storage.getUserChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      res.status(500).json({ message: 'Failed to fetch challenges' });
    }
  });

  // SMS Opt-In/Opt-Out endpoints for Twilio compliance
  app.post('/api/sms/opt-in', async (req, res) => {
    try {
      const { phoneNumber, consent, marketingConsent, timestamp } = req.body;

      if (!phoneNumber || !consent) {
        return res.status(400).json({ 
          error: 'Phone number and consent are required' 
        });
      }

      // Store opt-in record (in production, this would go to database)
      const optInRecord = {
        phoneNumber,
        consent,
        marketingConsent: marketingConsent || false,
        timestamp: timestamp || new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      console.log('📱 SMS Opt-In Record:', optInRecord);

      // Send confirmation SMS
      const result = await smsService.sendSMS(
        phoneNumber,
        `Welcome to WeParlay! You've successfully opted in to receive SMS notifications. Reply STOP to opt out anytime. Help: support@weparlay.io`
      );

      res.json({ 
        success: true, 
        message: 'Successfully opted in to SMS notifications',
        record: optInRecord,
        smsResult: result
      });
    } catch (error) {
      console.error('SMS opt-in error:', error);
      res.status(500).json({ error: 'Failed to process opt-in request' });
    }
  });

  app.post('/api/sms/opt-out', async (req, res) => {
    try {
      const { phoneNumber, timestamp } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ 
          error: 'Phone number is required' 
        });
      }

      // Store opt-out record (in production, this would go to database)
      const optOutRecord = {
        phoneNumber,
        timestamp: timestamp || new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      console.log('📱 SMS Opt-Out Record:', optOutRecord);

      // Send confirmation SMS
      const result = await smsService.sendSMS(
        phoneNumber,
        `You've been successfully removed from WeParlay SMS notifications. You will no longer receive messages. Contact support@weparlay.io if you need assistance.`
      );

      res.json({ 
        success: true, 
        message: 'Successfully opted out of SMS notifications',
        record: optOutRecord,
        smsResult: result
      });
    } catch (error) {
      console.error('SMS opt-out error:', error);
      res.status(500).json({ error: 'Failed to process opt-out request' });
    }
  });

  // Notification routes
  app.use('/api/notifications', notificationRoutes);

  // Catch-all for unhandled routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });

  const httpServer = createServer(app);
  return httpServer;
}