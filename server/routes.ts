import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OddsApiService } from "./services/oddsApiService";

// Initialize The Odds API service
const oddsApiService = new OddsApiService();

export async function registerRoutes(app: Express): Promise<Server> {

  // ===== Sports Routes =====
  app.get("/api/sports", async (req, res) => {
    try {
      const sports = await storage.getAllSports();
      res.json(sports);
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
      
      try {
        // Get odds for upcoming events
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

  app.get("/api/events/:id", async (req, res) => {
    try {
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
