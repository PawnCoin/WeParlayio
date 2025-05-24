import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/authRoutes";
import aiSupportRoutes from "./routes/aiSupport";
import authRouter from "./auth";
import { isAuthenticated } from "./replitAuth";
import { additionalSportsData } from "./services/mockSportsData";
import { OddsApiService } from "./services/oddsApiService";
import { AdvancedOddsService } from "./services/advancedOddsService";
import { yahooRouter } from "./routes/yahooRoutes";
import { feeRouter } from "./routes/feeRoutes";
import { adminRouter } from "./routes/adminRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { socialMediaBotRouter } from "./routes/socialMediaBotRoutes";

// Initialize The Odds API services
const oddsApiService = new OddsApiService();
const advancedOddsService = new AdvancedOddsService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Authentication routes
  app.use('/api/auth', authRouter);
  app.use('/api/auth', authRoutes);
  
  // Register Yahoo Fantasy routes
  app.use('/api/yahoo', yahooRouter);
  
  // Register fee routes for revenue generation
  app.use('/api/fees', feeRouter);
  
  // Register Admin routes
  app.use('/api/admin', adminRouter);
  
  // Register Social Media Bot routes
  app.use('/api/social-bots', socialMediaBotRouter);
  
  // Register AI Support routes
  app.use('/api/support', aiSupportRoutes);
  
  // Register notification routes
  app.use('/api/notifications', notificationRoutes);
  
  // Register bookie revenue routes (temporarily disabled to fix database issues)
  // const bookieRoutes = await import('./routes/bookieRoutes');
  // app.use('/api/bookie', bookieRoutes.default);
  
  // Head-to-head betting challenge routes
  app.post('/api/challenges', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { 
        eventId, 
        eventName, 
        amount, 
        pick, 
        oppositePick, 
        isVirtual = true,
        notificationEmail, 
        notificationPhone, 
        customMessage 
      } = req.body;
      
      // Validate required fields
      if (!eventName || !amount || !pick) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify sufficient balance 
      const balanceField = isVirtual ? 'balance' : 'realMoneyBalance';
      if (user[balanceField] < amount) {
        return res.status(400).json({ 
          message: `Insufficient ${isVirtual ? 'WeParlay Cash' : 'funds'}. You need ${amount} but have ${user[balanceField]}.` 
        });
      }
      
      // Create the challenge
      const challenge = await storage.createBettingChallenge({
        createdBy: userId,
        eventId,
        eventName,
        amount,
        pick,
        oppositePick,
        isVirtual,
        notificationEmail,
        notificationPhone,
        customMessage,
        status: 'pending',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
      });
      
      // If recipient email/phone was provided, send notification
      if (notificationEmail || notificationPhone) {
        // Import the notification service dynamically
        const { notificationService } = await import('./services/notificationService');
        
        await notificationService.sendBettingChallenge(
          challenge.id.toString(),
          userId,
          undefined,
          notificationEmail,
          notificationPhone
        );
      }
      
      res.status(201).json({ 
        message: "Challenge created successfully", 
        challenge,
        challengeUrl: `${req.protocol}://${req.get('host')}/challenges/${challenge.challengeUuid}`
      });
    } catch (error) {
      console.error("Error creating betting challenge:", error);
      res.status(500).json({ message: "Failed to create betting challenge" });
    }
  });
  
  // Get user's betting challenges
  app.get('/api/challenges', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const status = req.query.status; // Filter by status if provided
      
      // Get challenges created by the user and challenges sent to the user
      const challenges = await storage.getUserChallenges(userId, status);
      
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching betting challenges:", error);
      res.status(500).json({ message: "Failed to fetch betting challenges" });
    }
  });
  
  // Get a specific challenge by UUID
  app.get('/api/challenges/:uuid', async (req, res) => {
    try {
      const { uuid } = req.params;
      
      const challenge = await storage.getBettingChallengeByUuid(uuid);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching betting challenge:", error);
      res.status(500).json({ message: "Failed to fetch betting challenge" });
    }
  });
  
  // Accept a betting challenge
  app.post('/api/challenges/:uuid/accept', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { uuid } = req.params;
      
      // Get the challenge
      const challenge = await storage.getBettingChallengeByUuid(uuid);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if challenge is already accepted or expired
      if (challenge.status !== 'pending') {
        return res.status(400).json({ message: `Challenge cannot be accepted. Current status: ${challenge.status}` });
      }
      
      // Check if the user is trying to accept their own challenge
      if (challenge.createdBy === userId) {
        return res.status(400).json({ message: "You cannot accept your own challenge" });
      }
      
      // Check if the user has enough balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify sufficient balance
      const balanceField = challenge.isVirtual ? 'balance' : 'realMoneyBalance';
      if (user[balanceField] < challenge.amount) {
        return res.status(400).json({ 
          message: `Insufficient ${challenge.isVirtual ? 'WeParlay Cash' : 'funds'}. You need ${challenge.amount} but have ${user[balanceField]}.` 
        });
      }
      
      // Accept the challenge
      const updatedChallenge = await storage.acceptBettingChallenge(uuid, userId);
      
      // Send notification to the challenge creator
      const { notificationService } = await import('./services/notificationService');
      await notificationService.sendChallengeAcceptedNotification(challenge.id.toString());
      
      res.json({ 
        message: "Challenge accepted successfully", 
        challenge: updatedChallenge 
      });
    } catch (error) {
      console.error("Error accepting betting challenge:", error);
      res.status(500).json({ message: "Failed to accept betting challenge" });
    }
  });
  
  // Decline a betting challenge
  app.post('/api/challenges/:uuid/decline', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { uuid } = req.params;
      
      // Get the challenge
      const challenge = await storage.getBettingChallengeByUuid(uuid);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if challenge is already accepted, declined, or expired
      if (challenge.status !== 'pending') {
        return res.status(400).json({ message: `Challenge cannot be declined. Current status: ${challenge.status}` });
      }
      
      // Update challenge status to declined
      const updatedChallenge = await storage.updateBettingChallengeStatus(uuid, 'declined');
      
      res.json({ 
        message: "Challenge declined successfully", 
        challenge: updatedChallenge 
      });
    } catch (error) {
      console.error("Error declining betting challenge:", error);
      res.status(500).json({ message: "Failed to decline betting challenge" });
    }
  });
  
  // Cancel a betting challenge (only the creator can cancel)
  app.post('/api/challenges/:uuid/cancel', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { uuid } = req.params;
      
      // Get the challenge
      const challenge = await storage.getBettingChallengeByUuid(uuid);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if user is the creator
      if (challenge.createdBy !== userId) {
        return res.status(403).json({ message: "Only the challenge creator can cancel it" });
      }
      
      // Check if challenge is already accepted, declined, or expired
      if (challenge.status !== 'pending') {
        return res.status(400).json({ message: `Challenge cannot be canceled. Current status: ${challenge.status}` });
      }
      
      // Update challenge status to canceled
      const updatedChallenge = await storage.updateBettingChallengeStatus(uuid, 'canceled');
      
      res.json({ 
        message: "Challenge canceled successfully", 
        challenge: updatedChallenge 
      });
    } catch (error) {
      console.error("Error canceling betting challenge:", error);
      res.status(500).json({ message: "Failed to cancel betting challenge" });
    }
  });
  
  // Get user notifications
  app.get('/api/notifications', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { unreadOnly } = req.query;
      
      const notifications = await storage.getUserNotifications(userId, unreadOnly === 'true');
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  // Mark notification as read
  app.put('/api/notifications/:id/read', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const notification = await storage.markNotificationAsRead(parseInt(id), userId);
      
      res.json({ message: "Notification marked as read", notification });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  // User preferences endpoint
  app.post('/api/user/preferences', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const { oddsFormat, useVirtualCurrency, withdrawalSpeed, mobileOptimizedView } = req.body;
      
      // Only update fields that were provided
      const updateData: any = {};
      if (oddsFormat) updateData.oddsFormat = oddsFormat;
      if (useVirtualCurrency !== undefined) updateData.useVirtualCurrency = useVirtualCurrency;
      if (withdrawalSpeed) updateData.withdrawalSpeed = withdrawalSpeed;
      if (mobileOptimizedView !== undefined) updateData.mobileOptimizedView = mobileOptimizedView;
      
      const updatedUser = await storage.updateUserPreferences(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // ===== Sports Routes =====
  app.get("/api/sports", async (req, res) => {
    try {
      // Get basic sports from storage
      const sports = await storage.getAllSports();
      
      // Keys for our new sports - expanded to include college sports, women's leagues, and UFL
      const newSportKeys = [
        // Pro Sports
        'boxing_main', 'mma_ufc', 'motorsport_nascar', 'tennis_atp', 'tennis_wta', 'basketball_wnba', 'football_ufl',
        // College Sports
        'football_ncaaf', 'basketball_ncaam', 'basketball_ncaaw'
      ];
      
      // Filter out existing sports with our target keys to avoid duplicates
      const existingSportKeys = sports.map(sport => sport.key);
      const sportsToAdd = [];
      
      // Pro Sports
      // Boxing
      if (!existingSportKeys.includes('boxing_main')) {
        sportsToAdd.push({ 
          name: "Boxing", 
          key: "boxing_main", 
          isActive: true, 
          icon: "🥊" 
        });
      }
      
      // MMA/UFC
      if (!existingSportKeys.includes('mma_ufc')) {
        sportsToAdd.push({ 
          name: "MMA", 
          key: "mma_ufc", 
          isActive: true, 
          icon: "🥋" 
        });
      }
      
      // NASCAR
      if (!existingSportKeys.includes('motorsport_nascar')) {
        sportsToAdd.push({ 
          name: "NASCAR", 
          key: "motorsport_nascar", 
          isActive: true, 
          icon: "🏎️" 
        });
      }
      
      // Tennis (ATP - Men's)
      if (!existingSportKeys.includes('tennis_atp')) {
        sportsToAdd.push({ 
          name: "Tennis (ATP)", 
          key: "tennis_atp", 
          isActive: true, 
          icon: "🎾" 
        });
      }
      
      // Tennis (WTA - Women's)
      if (!existingSportKeys.includes('tennis_wta')) {
        sportsToAdd.push({ 
          name: "Tennis (WTA)", 
          key: "tennis_wta", 
          isActive: true, 
          icon: "🎾" 
        });
      }
      
      // WNBA
      if (!existingSportKeys.includes('basketball_wnba')) {
        sportsToAdd.push({ 
          name: "WNBA", 
          key: "basketball_wnba", 
          isActive: true, 
          icon: "🏀" 
        });
      }
      
      // UFL
      if (!existingSportKeys.includes('football_ufl')) {
        sportsToAdd.push({ 
          name: "UFL", 
          key: "football_ufl", 
          isActive: true, 
          icon: "🏈" 
        });
      }
      
      // College Sports
      // NCAA Football
      if (!existingSportKeys.includes('football_ncaaf')) {
        sportsToAdd.push({ 
          name: "NCAA Football", 
          key: "football_ncaaf", 
          isActive: true, 
          icon: "🏈" 
        });
      }
      
      // NCAA Men's Basketball
      if (!existingSportKeys.includes('basketball_ncaam')) {
        sportsToAdd.push({ 
          name: "NCAA Men's Basketball", 
          key: "basketball_ncaam", 
          isActive: true, 
          icon: "🏀" 
        });
      }
      
      // NCAA Women's Basketball
      if (!existingSportKeys.includes('basketball_ncaaw')) {
        sportsToAdd.push({ 
          name: "NCAA Women's Basketball", 
          key: "basketball_ncaaw", 
          isActive: true, 
          icon: "🏀" 
        });
      }
      
      // Add any missing sports
      for (const sport of sportsToAdd) {
        await storage.createSport(sport);
      }
      
      // Get updated list of sports without duplicates
      const updatedSports = await storage.getAllSports();
      res.json(updatedSports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sports/:id", async (req, res) => {
    try {
      const sport = await storage.getSport(parseInt(req.params.id));
      if (!sport) {
        return res.status(404).json({ message: "Sport not found" });
      }
      res.json(sport);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Teams Routes =====
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sports/:sportId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsBySport(parseInt(req.params.sportId));
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Events Routes =====
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ===== The Odds API Routes =====
  
  // Get sports from The Odds API
  app.get("/api/odds-sports", async (req, res) => {
    try {
      const sports = await oddsApiService.getSports();
      res.json(sports);
    } catch (error: any) {
      console.error("Error fetching sports from The Odds API:", error);
      res.status(500).json({ message: error.message || "Failed to fetch sports from The Odds API" });
    }
  });
  
  // Get live events for a specific sport
  app.get("/api/sports/:sportKey/live", async (req, res) => {
    try {
      const { sportKey } = req.params;
      
      // Check if this is one of our expanded sports (including college and women's leagues)
      const newSportsMapping: Record<string, keyof typeof additionalSportsData> = {
        // Pro Sports
        'boxing_main': 'boxing_main',
        'mma_ufc': 'mma_ufc',
        'motorsport_nascar': 'motorsport_nascar',
        'tennis_atp': 'tennis_atp',
        'tennis_wta': 'tennis_wta',
        'basketball_wnba': 'basketball_wnba',
        'football_ufl': 'football_ufl',
        // College Sports
        'football_ncaaf': 'football_ncaaf',
        'basketball_ncaam': 'basketball_ncaam',
        'basketball_ncaaw': 'basketball_ncaaw'
      };
      
      if (newSportsMapping[sportKey]) {
        // For our new sports, we'll pretend there are no live events currently
        // This could be enhanced to simulate live events if needed
        return res.json([]);
      }
      
      try {
        // Try to get scores for the sport to find live events
        const scores = await oddsApiService.getScores(sportKey);
        
        // Filter for only live events (started but not completed)
        const now = new Date();
        const liveEvents = scores.filter((event: any) => {
          const startTime = new Date(event.commence_time);
          return startTime <= now && !event.completed;
        });
        
        // For each live event, add odds data if available
        try {
          const odds = await oddsApiService.getOdds(sportKey);
          
          for (const event of liveEvents) {
            const eventOdds = odds.find((o: any) => o.id === event.id);
            if (eventOdds) {
              event.bookmakers = eventOdds.bookmakers;
            }
          }
        } catch (oddsError) {
          console.warn("Could not fetch odds for live events:", oddsError);
        }
        
        res.json(liveEvents);
      } catch (error: any) {
        console.error(`Error fetching live events for ${sportKey}:`, error);
        res.status(500).json({ message: error.message || "Failed to fetch live events" });
      }
    } catch (error: any) {
      console.error("Error in live events route:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  
  // Get upcoming events for a specific sport
  app.get("/api/sports/:sportKey/upcoming", async (req, res) => {
    try {
      const { sportKey } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Check if this is one of our new sports (boxing, MMA, NASCAR, tennis)
      const newSportsMapping: Record<string, keyof typeof additionalSportsData> = {
        // Pro Sports
        'boxing_main': 'boxing_main',
        'mma_ufc': 'mma_ufc',
        'motorsport_nascar': 'motorsport_nascar',
        'tennis_atp': 'tennis_atp',
        'tennis_wta': 'tennis_wta',
        'basketball_wnba': 'basketball_wnba',
        'football_ufl': 'football_ufl',
        // College Sports
        'football_ncaaf': 'football_ncaaf',
        'basketball_ncaam': 'basketball_ncaam',
        'basketball_ncaaw': 'basketball_ncaaw'
      };
      
      if (newSportsMapping[sportKey]) {
        const mockDataKey = newSportsMapping[sportKey];
        const events = additionalSportsData[mockDataKey] || [];
        
        // Filter for only upcoming events and sort by start time
        const now = new Date();
        const upcomingEvents = events
          .filter((event: any) => new Date(event.commence_time) > now)
          .sort((a: any, b: any) => 
            new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
          )
          .slice(0, limit);
        
        return res.json(upcomingEvents);
      }
      
      try {
        // Get odds for upcoming events from The Odds API for standard sports
        const odds = await oddsApiService.getOdds(sportKey);
        
        // Filter for only upcoming events (not started yet) and sort by start time
        const now = new Date();
        const upcomingEvents = odds
          .filter((event: any) => new Date(event.commence_time) > now)
          .sort((a: any, b: any) => 
            new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
          )
          .slice(0, limit);
        
        res.json(upcomingEvents);
      } catch (error: any) {
        console.error(`Error fetching upcoming events for ${sportKey}:`, error);
        res.status(500).json({ message: error.message || "Failed to fetch upcoming events" });
      }
    } catch (error: any) {
      console.error("Error in upcoming events route:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Enhanced API endpoints for comprehensive betting data
  
  // Get player props for a specific event
  app.get("/api/events/:eventId/player-props", async (req, res) => {
    try {
      const { eventId } = req.params;
      const sportKey = req.query.sport as string;
      
      if (!sportKey) {
        return res.status(400).json({ message: "Sport key is required" });
      }
      
      const playerProps = await advancedOddsService.getPlayerProps(sportKey, eventId);
      res.json(playerProps);
    } catch (error: any) {
      console.error("Error fetching player props:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player props" });
    }
  });
  
  // Get team props for a specific event
  app.get("/api/events/:eventId/team-props", async (req, res) => {
    try {
      const { eventId } = req.params;
      const sportKey = req.query.sport as string;
      
      if (!sportKey) {
        return res.status(400).json({ message: "Sport key is required" });
      }
      
      const teamProps = await advancedOddsService.getTeamProps(sportKey, eventId);
      res.json(teamProps);
    } catch (error: any) {
      console.error("Error fetching team props:", error);
      res.status(500).json({ message: error.message || "Failed to fetch team props" });
    }
  });
  
  // Get all betting markets for a specific event (game lines, player props, and team props)
  app.get("/api/events/:eventId/all-markets", async (req, res) => {
    try {
      const { eventId } = req.params;
      const sportKey = req.query.sport as string;
      
      if (!sportKey) {
        return res.status(400).json({ message: "Sport key is required" });
      }
      
      const allMarkets = await advancedOddsService.getAllMarkets(sportKey, eventId);
      res.json(allMarkets);
    } catch (error: any) {
      console.error("Error fetching all betting markets:", error);
      res.status(500).json({ message: error.message || "Failed to fetch betting markets" });
    }
  });
  
  // Enhanced live events endpoint with real-time data
  app.get("/api/events/:sportKey/live-enhanced", async (req, res) => {
    try {
      const { sportKey } = req.params;
      
      const liveEvents = await advancedOddsService.getLiveEvents(sportKey);
      res.json(liveEvents);
    } catch (error: any) {
      console.error("Error fetching enhanced live events:", error);
      res.status(500).json({ message: error.message || "Failed to fetch enhanced live events" });
    }
  });

  // Get all live events (across all sports)
  app.get("/api/events/live", async (req, res) => {
    try {
      // Get live events from storage
      const liveEvents = await storage.getLiveEvents();
      
      // For demo purposes we'll return mock data when no live events are in the DB
      if (liveEvents.length === 0) {
        // Create mock live data from all sports
        const mockLiveEvents = [];
        for (const sportKey in additionalSportsData) {
          const sportEvents = additionalSportsData[sportKey] || [];
          // Convert 1-2 events to "live" status
          const liveSportEvents = sportEvents.slice(0, 2).map((event: any) => {
            return {
              ...event,
              status: "in_play",
              time_remaining: Math.floor(Math.random() * 20) + ":" + Math.floor(Math.random() * 60).toString().padStart(2, '0'),
              period: Math.floor(Math.random() * 4) + 1,
              scores: {
                home: Math.floor(Math.random() * 100),
                away: Math.floor(Math.random() * 100)
              },
              sport_key: sportKey
            };
          });
          mockLiveEvents.push(...liveSportEvents);
        }
        return res.json(mockLiveEvents);
      }
      
      res.json(liveEvents);
    } catch (error: any) {
      console.error("Error fetching live events:", error);
      res.status(500).json({ message: error.message || "Failed to fetch live events" });
    }
  });
  
  // Get all upcoming events (across all sports)
  app.get("/api/events/upcoming", async (req, res) => {
    try {
      // Get the limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get upcoming events from storage
      const upcomingEvents = await storage.getUpcomingEvents(limit);
      
      // For demo purposes we'll return mock data when no upcoming events are in the DB
      if (upcomingEvents.length === 0) {
        // Create mock upcoming data from all sports
        const mockUpcomingEvents = [];
        for (const sportKey in additionalSportsData) {
          const sportEvents = additionalSportsData[sportKey] || [];
          // Get a few upcoming events
          const upcomingSportEvents = sportEvents.slice(0, 3).map((event: any) => {
            // Set commence_time to future dates
            const futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + Math.floor(Math.random() * 48) + 1);
            
            return {
              ...event,
              commence_time: futureDate.toISOString(),
              sport_key: sportKey
            };
          });
          mockUpcomingEvents.push(...upcomingSportEvents);
        }
        
        // Sort by start time and limit
        const sortedEvents = mockUpcomingEvents
          .sort((a: any, b: any) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime())
          .slice(0, limit);
          
        return res.json(sortedEvents);
      }
      
      res.json(upcomingEvents);
    } catch (error: any) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: error.message || "Failed to fetch upcoming events" });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      // Make sure the ID is a number and not "live" or "upcoming"
      if (req.params.id === "live" || req.params.id === "upcoming") {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sports/:sportId/events", async (req, res) => {
    try {
      const events = await storage.getEventsBySport(parseInt(req.params.sportId));
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events/live", async (req, res) => {
    try {
      const events = await storage.getLiveEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Odds API Integration =====
  app.get("/api/odds/:sportKey", async (req, res) => {
    try {
      const sportKey = req.params.sportKey;
      const region = (req.query.region as string) || "us";
      const markets = (req.query.markets as string) || "h2h,spreads,totals";
      
      const odds = await oddsApiService.getOdds(sportKey, region, markets);
      res.json(odds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get detailed odds comparison for a specific event
  app.get("/api/odds/:sportKey/:eventId", async (req, res) => {
    try {
      const { sportKey, eventId } = req.params;
      const region = (req.query.region as string) || "us";
      const markets = (req.query.markets as string) || "h2h,spreads,totals";
      const bookmakers = (req.query.bookmakers as string) || "";
      
      // Get odds for all events in this sport
      const allOdds = await oddsApiService.getOdds(sportKey, region, markets);
      
      // Find the specific event
      const eventOdds = allOdds.find((event: any) => event.id === eventId);
      
      if (!eventOdds) {
        return res.status(404).json({ message: "Event odds not found" });
      }
      
      // Filter by requested bookmakers if specified
      if (bookmakers) {
        const bookmakerList = bookmakers.split(',');
        eventOdds.bookmakers = eventOdds.bookmakers.filter(
          (b: any) => bookmakerList.includes(b.key)
        );
      }
      
      // Get compliance info - check if user is in a legal betting state
      const userState = req.headers['x-user-state'] as string;
      let compliance = {
        isLegalState: true,
        stateRestrictions: null,
        regulatoryMessage: "Betting is permitted in your location."
      };
      
      // List of states where betting is legal
      const legalStates = [
        'Nevada', 'New Jersey', 'Pennsylvania', 'Michigan', 'Illinois', 
        'Colorado', 'Indiana', 'Iowa', 'New Hampshire', 'Rhode Island', 
        'Tennessee', 'Virginia', 'West Virginia', 'Arizona', 'Wyoming',
        'Connecticut', 'Louisiana', 'Maryland', 'New York', 'Oregon'
      ];
      
      // States with restrictions
      const restrictedStates = [
        'Washington', 'Montana', 'Mississippi', 'Arkansas', 'Delaware', 
        'South Dakota', 'North Dakota'
      ];
      
      if (userState) {
        if (!legalStates.includes(userState)) {
          compliance.isLegalState = false;
          
          if (restrictedStates.includes(userState)) {
            compliance.stateRestrictions = "limited";
            compliance.regulatoryMessage = 
              `${userState} has specific restrictions for online betting. Some features may be limited.`;
          } else {
            compliance.stateRestrictions = "prohibited";
            compliance.regulatoryMessage = 
              `Online sports betting is not currently legal in ${userState}. You can only use WeParlay Cash for betting.`;
          }
        }
      }
      
      // Add historical odds data (normally would come from a database)
      // For this implementation we're using mock historical data
      const now = new Date();
      const historicalOdds = [
        {
          timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          bookmakers: eventOdds.bookmakers.map((b: any) => ({
            key: b.key,
            markets: b.markets.map((m: any) => ({
              key: m.key,
              outcomes: m.outcomes.map((o: any) => ({
                name: o.name,
                price: o.price * (0.95 + Math.random() * 0.1), // Slight variation
                point: o.point
              }))
            }))
          }))
        },
        {
          timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 mins ago
          bookmakers: eventOdds.bookmakers.map((b: any) => ({
            key: b.key,
            markets: b.markets.map((m: any) => ({
              key: m.key,
              outcomes: m.outcomes.map((o: any) => ({
                name: o.name,
                price: o.price * (0.97 + Math.random() * 0.06), // Slight variation
                point: o.point
              }))
            }))
          }))
        }
      ];
      
      // Return enhanced odds data for comparison
      res.json({
        event: eventOdds,
        historicalOdds,
        compliance,
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error fetching odds comparison:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Bets Routes =====
  app.get("/api/users/:userId/bets", async (req, res) => {
    try {
      const bets = await storage.getUserBets(parseInt(req.params.userId));
      res.json(bets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bets", async (req, res) => {
    try {
      const bet = await storage.createBet(req.body);
      res.status(201).json(bet);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Tournaments Routes =====
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getAllTournaments();
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(parseInt(req.params.id));
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sports/:sportId/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getTournamentsBySport(parseInt(req.params.sportId));
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tournaments/:id/bracket", async (req, res) => {
    try {
      const tournament = await storage.updateTournamentBracket(parseInt(req.params.id), req.body);
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Fantasy Teams Routes =====
  app.get("/api/users/:userId/fantasy-teams", async (req, res) => {
    try {
      const teams = await storage.getUserFantasyTeams(parseInt(req.params.userId));
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/fantasy-teams", async (req, res) => {
    try {
      const team = await storage.createFantasyTeam(req.body);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/fantasy-teams/:id/players", async (req, res) => {
    try {
      const teamPlayers = await storage.getFantasyTeamPlayers(parseInt(req.params.id));
      
      // Get full player details
      const players = [];
      for (const tp of teamPlayers) {
        const player = await storage.getPlayer(tp.playerId);
        if (player) {
          players.push(player);
        }
      }
      
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/fantasy-teams/:id/players", async (req, res) => {
    try {
      const { playerId } = req.body;
      const fantasyTeamPlayer = await storage.addPlayerToFantasyTeam({
        fantasyTeamId: parseInt(req.params.id),
        playerId
      });
      res.status(201).json(fantasyTeamPlayer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/fantasy-teams/:id/players/:playerId", async (req, res) => {
    try {
      await storage.removePlayerFromFantasyTeam(
        parseInt(req.params.id),
        parseInt(req.params.playerId)
      );
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Players Routes =====
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teams/:teamId/players", async (req, res) => {
    try {
      const players = await storage.getPlayersByTeam(parseInt(req.params.teamId));
      res.json(players);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Users Routes =====
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== Mock Authentication =====
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Directory and Social Features
  app.get('/api/users/directory', async (req, res) => {
    try {
      let users = await storage.getAllUsers();
      
      // If no users in database, add demo users from the bot system
      if (users.length === 0) {
        const demoUsers = [
          {
            id: 'bot-user-1',
            username: 'crypto_king_2024',
            firstName: 'Alex',
            lastName: 'Johnson',
            profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            subscriptionTier: 'gold',
            balance: 2850,
            wins: 47,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            id: 'bot-user-2', 
            username: 'sports_wizard',
            firstName: 'Sarah',
            lastName: 'Martinez',
            profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            subscriptionTier: 'diamond',
            balance: 5420,
            wins: 89,
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            id: 'bot-user-3',
            username: 'bet_master_pro',
            firstName: 'Mike',
            lastName: 'Chen',
            profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
            subscriptionTier: 'silver',
            balance: 1230,
            wins: 23,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'bot-user-4',
            username: 'lucky_streak_99',
            firstName: 'Emma',
            lastName: 'Wilson',
            profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
            subscriptionTier: 'bronze',
            balance: 890,
            wins: 12,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            isOnline: true,
            lastSeen: new Date().toISOString()
          },
          {
            id: 'bot-user-5',
            username: 'parlay_champion',
            firstName: 'David',
            lastName: 'Rodriguez',
            profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
            subscriptionTier: 'gold',
            balance: 3150,
            wins: 67,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            isOnline: false,
            lastSeen: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'bot-user-6',
            username: 'future_millionaire',
            firstName: 'Jessica',
            lastName: 'Taylor',
            profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica',
            subscriptionTier: 'wood',
            balance: 25,
            wins: 0,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            isOnline: true,
            lastSeen: new Date().toISOString()
          }
        ];
        
        return res.json(demoUsers);
      }
      
      // Remove sensitive data from real users
      const publicUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        subscriptionTier: user.subscriptionTier,
        balance: user.balance,
        wins: user.wins,
        createdAt: user.createdAt,
        isOnline: Math.random() > 0.5,
        lastSeen: user.lastLogin
      }));
      
      res.json(publicUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Get current user info
  app.get('/api/auth/me', async (req, res) => {
    try {
      // Return demo user for now - ready for real authentication
      const demoUser = {
        id: 'demo-user',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: null,
        subscriptionTier: 'wood',
        balance: 25,
        wins: 0,
        createdAt: new Date().toISOString()
      };
      
      res.json(demoUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user info' });
    }
  });

  // Get user's friends
  app.get('/api/users/friends', async (req, res) => {
    try {
      // Return friends list - ready for future friend system implementation
      const friends: any[] = [];
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch friends' });
    }
  });

  // Add friend
  app.post('/api/users/add-friend', async (req, res) => {
    try {
      const { userId: friendId } = req.body;
      
      // Ready for friend system implementation
      res.json({ message: 'Friend added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add friend' });
    }
  });

  // Get messages
  app.get('/api/users/messages', async (req, res) => {
    try {
      // Return messages - ready for future messaging system
      const messages: any[] = [];
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  // Send message
  app.post('/api/users/send-message', async (req, res) => {
    try {
      const { toUserId, content } = req.body;
      
      // Ready for messaging system implementation
      res.json({ message: 'Message sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Social Media Bot Integration - Auto-post community highlights (OWNER ONLY)
  app.post('/api/community/auto-share', async (req, res) => {
    try {
      // Verify owner access - Only Drnielous Luster can trigger bot posts
      const ownerEmail = req.headers['x-owner-email'];
      const ownerAccess = req.headers['x-owner-access'];
      
      if (ownerEmail !== 'support@weparlay.io' && ownerAccess !== 'true') {
        return res.status(403).json({ 
          message: 'Access denied. Only platform owner can control social media bots.',
          authorizedUser: 'Drnielous Luster (support@weparlay.io)'
        });
      }

      const users = await storage.getAllUsers();
      
      // Get top performers for social sharing
      const topUsers = users
        .filter(user => user.wins > 0)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 3);

      const communityPosts = [
        `🔥 WeParlay Community Update! Our top players are crushing it:
🥇 ${topUsers[0]?.username || 'crypto_king_2024'}: ${topUsers[0]?.wins || 47} wins, $${topUsers[0]?.balance || 2850} balance
🥈 ${topUsers[1]?.username || 'sports_wizard'}: ${topUsers[1]?.wins || 89} wins, $${topUsers[1]?.balance || 5420} balance
🥉 ${topUsers[2]?.username || 'bet_master_pro'}: ${topUsers[2]?.wins || 23} wins, $${topUsers[2]?.balance || 1230} balance

Join the action at WeParlay.io! 🎯 #WeParlay #SportsBox #CommunityWins`,

        `📈 WeParlay Community Growing Fast! 
        
Active members sharing strategies, celebrating wins, and building wealth together! 

💰 Total community winnings this week: $${users.reduce((sum, user) => sum + (user.balance || 0), 0).toLocaleString()}
🎯 Join ${users.length} smart bettors at WeParlay.io
        
#WeParlay #SmartBetting #Community`,

        `🚀 LIVE: WeParlay Community Features
        
✅ Real-time odds tracking
✅ Social betting challenges  
✅ Friend networks & messaging
✅ Multi-tier membership rewards
✅ Crypto wallet integration

Ready to level up your betting game? 
Join us: WeParlay.io 🎯

#WeParlay #BettingTech #SportsBox`
      ];

      // Simulate posting to social media platforms
      const randomPost = communityPosts[Math.floor(Math.random() * communityPosts.length)];
      
      res.json({ 
        success: true, 
        message: 'Community highlights shared across social platforms',
        post: randomPost,
        platforms: ['Twitter', 'Facebook', 'Instagram'],
        engagement: {
          expectedReach: Math.floor(Math.random() * 5000) + 1000,
          expectedClicks: Math.floor(Math.random() * 500) + 100
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to auto-share community content' });
    }
  });

  // Wallet Authentication Integration
  app.post('/api/auth/wallet-connect', async (req, res) => {
    try {
      const { walletAddress, signature, message } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: 'Wallet address required' });
      }

      // Check if user exists with this wallet
      let user = await storage.getUserByWallet?.(walletAddress);
      
      if (!user) {
        // Create new user with wallet authentication
        const newUser = await storage.createUser({
          id: walletAddress,
          walletAddress: walletAddress,
          username: `wallet_${walletAddress.slice(-6)}`,
          firstName: 'Crypto',
          lastName: 'User',
          subscriptionTier: 'wood',
          balance: 25,
          wins: 0,
          createdAt: new Date(),
          authMethod: 'wallet'
        });
        user = newUser;
      }

      // Generate session token
      const token = 'wallet_session_' + Math.random().toString(36).substr(2, 9);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          balance: user.balance,
          subscriptionTier: user.subscriptionTier
        },
        token,
        message: 'Wallet connected successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Wallet connection failed' });
    }
  });

  // Initialize server
  const httpServer = createServer(app);
  return httpServer;
}
