import type { Express } from "express";

export function registerGamingRoutes(app: Express): void {
  // Gaming API Status
  app.get('/api/gaming/status', async (req, res) => {
    try {
      const status = {
        fortnite: 'connected',
        xbox: 'connected',
        sportsGameOdds: 'connected',
        riot: 'connected',
        twitch: 'connected',
        grid: 'connected',
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Gaming status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gaming API status'
      });
    }
  });

  // Gaming Tournaments (GRID + Riot)
  app.get('/api/gaming/tournaments', async (req, res) => {
    try {
      // This would integrate with GRID and Riot APIs
      const tournaments = [
        {
          id: '1',
          name: 'League of Legends World Championship',
          game: 'League of Legends',
          startDate: '2024-10-15',
          endDate: '2024-11-15',
          prizePool: '$2,000,000',
          teams: 16,
          status: 'upcoming',
          source: 'riot'
        },
        {
          id: '2',
          name: 'Fortnite Championship Series',
          game: 'Fortnite',
          startDate: '2024-09-01',
          endDate: '2024-12-31',
          prizePool: '$5,000,000',
          teams: 100,
          status: 'live',
          source: 'fortnite'
        },
        {
          id: '3',
          name: 'GRID Esports Tournament',
          game: 'CS:GO',
          startDate: '2024-08-10',
          endDate: '2024-08-20',
          prizePool: '$500,000',
          teams: 32,
          status: 'live',
          source: 'grid'
        }
      ];

      res.json({
        success: true,
        data: tournaments
      });
    } catch (error) {
      console.error('Gaming tournaments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gaming tournaments'
      });
    }
  });

  // Live Gaming Matches (SportsGameOdds + others)
  app.get('/api/gaming/live-matches', async (req, res) => {
    try {
      const liveMatches = [
        {
          id: '1',
          homeTeam: 'Cloud9',
          awayTeam: 'Team Liquid',
          game: 'League of Legends',
          tournament: 'LCS Finals',
          status: 'LIVE',
          startTime: new Date().toISOString(),
          odds: {
            home: 1.85,
            away: 1.95
          },
          source: 'sportsGameOdds'
        },
        {
          id: '2',
          homeTeam: 'NRG Esports',
          awayTeam: 'TSM',
          game: 'Fortnite',
          tournament: 'FNCS',
          status: 'LIVE',
          startTime: new Date().toISOString(),
          odds: {
            home: 2.10,
            away: 1.75
          },
          source: 'fortnite'
        },
        {
          id: '3',
          homeTeam: 'FaZe Clan',
          awayTeam: 'G2 Esports',
          game: 'CS:GO',
          tournament: 'BLAST Premier',
          status: 'LIVE',
          startTime: new Date().toISOString(),
          odds: {
            home: 1.65,
            away: 2.30
          },
          source: 'grid'
        }
      ];

      res.json({
        success: true,
        data: liveMatches
      });
    } catch (error) {
      console.error('Gaming live matches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch live gaming matches'
      });
    }
  });

  // Twitch Streams
  app.get('/api/gaming/twitch/streams', async (req, res) => {
    try {
      const streams = [
        {
          id: '1',
          streamer: 'Ninja',
          game: 'Fortnite',
          viewers: 45000,
          title: 'FNCS Championship Practice',
          isLive: true,
          thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_ninja.jpg',
          url: 'https://twitch.tv/ninja'
        },
        {
          id: '2',
          streamer: 'Shroud',
          game: 'CS:GO',
          viewers: 32000,
          title: 'Ranked Grind - Road to Global Elite',
          isLive: true,
          thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_shroud.jpg',
          url: 'https://twitch.tv/shroud'
        },
        {
          id: '3',
          streamer: 'Pokimane',
          game: 'League of Legends',
          viewers: 28000,
          title: 'Climbing to Challenger',
          isLive: true,
          thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_pokimane.jpg',
          url: 'https://twitch.tv/pokimane'
        }
      ];

      res.json({
        success: true,
        data: streams
      });
    } catch (error) {
      console.error('Twitch streams error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Twitch streams'
      });
    }
  });

  // Fortnite Stats
  app.get('/api/gaming/fortnite/stats', async (req, res) => {
    try {
      const stats = {
        totalPlayers: 400000000,
        activePlayers: 12500000,
        currentSeason: 'Chapter 5 Season 4',
        nextEvent: 'FNCS Championship',
        prizePool: '$5,000,000',
        topPlayer: {
          username: 'Bugha',
          earnings: '$3,135,000',
          wins: 2847
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Fortnite stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Fortnite stats'
      });
    }
  });

  // Xbox Gaming Data
  app.get('/api/gaming/xbox/data', async (req, res) => {
    try {
      const xboxData = {
        topGames: [
          { name: 'Halo Infinite', players: 2500000 },
          { name: 'Gears 5', players: 1800000 },
          { name: 'Forza Horizon 5', players: 3200000 }
        ],
        gamePass: {
          subscribers: 25000000,
          gamesAvailable: 463
        },
        esportsEvents: [
          {
            name: 'Halo Championship Series',
            prizePool: '$1,000,000',
            date: '2024-12-15'
          }
        ]
      };

      res.json({
        success: true,
        data: xboxData
      });
    } catch (error) {
      console.error('Xbox data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Xbox gaming data'
      });
    }
  });
}