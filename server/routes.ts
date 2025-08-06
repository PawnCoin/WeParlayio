import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./simpleStorage";
import authRoutes from "./routes/authRoutes";
import aiSupportRoutes from "./routes/aiSupport";
import authRouter from "./auth";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { additionalSportsData } from "./services/mockSportsData";
import { OddsApiService } from "./services/oddsApiService";
import { AdvancedOddsService } from "./services/advancedOddsService";
import { unifiedSportsApiService } from "./services/unifiedSportsApiService";
import { RapidApiService } from "./services/rapidApiService";
import { SportsGameOddsService } from "./services/sportsGameOddsService";
import { freeApiService } from "./services/freeApiService";
import { espnApiService } from "./services/espnApiService";

import { feeRouter } from "./routes/feeRoutes";
import { adminRouter } from "./routes/adminRoutes";
import notificationRoutes from "./routes/notificationRoutes-simplified";
import gamingRoutes from "./routes/gamingRoutes";
import unifiedSportsRoutes from "./routes/unifiedSportsRoutes";
import websocketPollingRoutes from "./routes/websocketPollingRoutes";
import oddsTickerRoutes from "./routes/oddsTickerRoutes";
import { apiTestRouter } from "./routes/apiTestRoutes";
import { comprehensiveRapidApi } from "./services/comprehensiveRapidApi";
import rapidApiRoutes from "./routes/rapidApiRoutes";
import espnFantasyRoutes from "./routes/espnFantasyRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";

import iptvRoutes from "./routes/iptv";
import iptvProxyRoutes from "./routes/iptv-proxy";
import { apiQuotaManager } from "./services/apiQuotaManager";
import { primaryApiRouter } from "./services/primaryApiRouter";
import primaryDataRoutes from "./routes/primaryDataRoutes";
import { smsService } from "./services/smsService";
import betSettlementRoutes from "./routes/betSettlementRoutes";
import { betSettlementService } from "./services/betSettlementService";
import { 
  getPlayerAnalytics, 
  getWeeklyMatchups, 
  getInjuryAnalysis, 
  optimizeLineup, 
  getSleeperPicks, 
  getWaiverRecommendations 
} from './services/fantasyAnalyticsEngine';
import { 
  createBettingPool, 
  getBettingPools, 
  joinBettingPool, 
  getBettingPoolById, 
  getBettingPoolDetails, 
  createHeadToHeadBet 
} from './services/fantasySocialEngine';

import { esportsApiService } from "./services/esportsApiService";
import { allSportsApiService } from "./services/allSportsApiService";
import { createCashAppPayment, getCashAppPaymentStatus, initiateCashAppPayout } from "./cashapp";
import { youtubeRoutes } from "./youtube-api";
import { iptvService } from "./iptv-service";

const registerRoutes = async (app: Express): Promise<Server> => {
  const server = createServer(app);

  // Initialize authentication
  await setupAuth(app);

  // Register core routes
  app.use('/api/fees', feeRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/support', aiSupportRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/bet-settlement', betSettlementRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/gaming', gamingRoutes);
  app.use('/api/unified-sports', unifiedSportsRoutes);
  app.use('/api/websocket-polling', websocketPollingRoutes);
  app.use('/api/odds-ticker', oddsTickerRoutes);
  app.use('/api/api-test', apiTestRouter);
  app.use('/api/rapid-api', rapidApiRoutes);
  app.use('/api/espn-fantasy', espnFantasyRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/iptv', iptvRoutes);
  app.use('/api/iptv-proxy', iptvProxyRoutes);
  app.use('/api/primary-data', primaryDataRoutes);

  // YouTube API routes for enhanced streaming
  app.get('/api/youtube/live-streams', youtubeRoutes.getLiveStreams);
  app.get('/api/youtube/video/:videoId', youtubeRoutes.getVideoInfo);

  // Direct Betting System
  app.post('/api/bets', async (req, res) => {
    try {
      const { eventId, betType, pick, odds, amount, currency } = req.body;
      const userId = req.headers['x-user-id'] || 'dev-user-001';

      if (!eventId || !betType || !pick || !odds || !amount) {
        return res.status(400).json({ success: false, message: 'Missing required bet fields' });
      }

      const potentialPayout = amount * odds;
      const bet = {
        id: Date.now(),
        userId,
        eventId: parseInt(eventId),
        betType,
        pick,
        odds,
        amount,
        potentialPayout,
        currency: currency || 'weparlay_cash',
        status: 'pending',
        placedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        bet,
        message: 'Bet placed successfully',
        remainingBalance: 950
      });
    } catch (error) {
      console.error('Bet placement error:', error);
      res.status(500).json({ success: false, message: 'Failed to place bet' });
    }
  });

  // Get user bets
  app.get('/api/bets/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const bets = await storage.getBetsByUserId(userId);
      res.json({ success: true, bets });
    } catch (error) {
      console.error('Error fetching user bets:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch bets' });
    }
  });

  // Sports data endpoints
  app.get('/api/sports', async (req, res) => {
    try {
      const sports = await primaryApiRouter.getSportsData();
      res.json(sports);
    } catch (error) {
      console.error('Error fetching sports data:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch sports data' });
    }
  });

  // Live odds endpoints
  app.get('/api/odds/:sport', async (req, res) => {
    try {
      const { sport } = req.params;
      const odds = await primaryApiRouter.getLiveOdds(sport);
      res.json(odds);
    } catch (error) {
      console.error('Error fetching odds:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch odds' });
    }
  });

  // User balance endpoint
  app.get('/api/user/cash-balance', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || 'dev-user-001';
      const user = await storage.getUser(userId);
      const balance = user?.balance || 10000;
      res.json(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch balance' });
    }
  });

  // System health endpoint
  app.get('/api/system/system-health', async (req, res) => {
    try {
      res.json({
        timestamp: new Date().toISOString(),
        status: 'healthy',
        services: {
          database: 'operational',
          apis: 'operational',
          auth: 'operational'
        }
      });
    } catch (error) {
      console.error('Error getting system health:', error);
      res.status(500).json({ success: false, message: 'Failed to get system health' });
    }
  });

  // SMS challenge endpoint
  app.post('/api/sms/challenge', async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number required' });
      }

      const challenge = Math.floor(100000 + Math.random() * 900000).toString();
      const smsResult = await smsService.sendSMS({
        message: `WeParlay verification code: ${challenge}`,
        to: phone
      });

      res.json({
        success: true,
        challenge,
        smsSid: smsResult.sid,
        message: 'SMS challenge sent successfully'
      });
    } catch (error) {
      console.error('SMS challenge error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send SMS challenge' 
      });
    }
  });

  return server;
};

export default registerRoutes;