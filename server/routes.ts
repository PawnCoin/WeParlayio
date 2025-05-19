import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiSupportRoutes from "./routes/aiSupport";
import authRouter from "./auth";
import { additionalSportsData } from "./services/mockSportsData";
import { OddsApiService } from "./services/oddsApiService";
import { yahooRouter } from "./routes/yahooRoutes";
import { feeRouter } from "./routes/feeRoutes";

// Initialize The Odds API service
const oddsApiService = new OddsApiService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Authentication routes
  app.use('/api/auth', authRouter);
  
  // Register Yahoo Fantasy routes
  app.use('/api/yahoo', yahooRouter);
  
  // Register fee routes for revenue generation
  app.use('/api/fees', feeRouter);
  
  // Register AI Support routes
  app.use('/api/support', aiSupportRoutes);

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

  // Initialize server
  const httpServer = createServer(app);
  return httpServer;
}
