import express from 'express';
import { unifiedGamingAPI } from '../services/unifiedGamingAPI';

const router = express.Router();

// Real Riot Games API endpoints
router.get('/riot/player/:summonerName', async (req, res) => {
  try {
    const { summonerName } = req.params;
    const { region = 'na1' } = req.query;

    const playerStats = await unifiedGamingAPI.getEsportsPlayerStats(summonerName, region as string);
    res.json(playerStats);
  } catch (error: any) {
    console.error('Riot player stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch player stats',
      message: error.message 
    });
  }
});

router.get('/riot/live-game/:summonerName', async (req, res) => {
  try {
    const { summonerName } = req.params;
    const { region = 'na1' } = req.query;

    const liveGame = await unifiedGamingAPI.checkLiveGame(summonerName, region as string);
    res.json(liveGame);
  } catch (error: any) {
    console.error('Riot live game error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch live game',
      message: error.message 
    });
  }
});

router.get('/riot/summoner/:summonerName', async (req, res) => {
  try {
    const { summonerName } = req.params;
    const { region = 'na1' } = req.query;

    const summoner = await unifiedGamingAPI.getSummonerByName(summonerName, region as string);
    res.json(summoner);
  } catch (error: any) {
    console.error('Riot summoner error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch summoner',
      message: error.message 
    });
  }
});

router.get('/riot/ranked/:summonerId', async (req, res) => {
  try {
    const { summonerId } = req.params;
    const { region = 'na1' } = req.query;

    const rankedStats = await unifiedGamingAPI.getRankedStats(summonerId, region as string);
    res.json(rankedStats);
  } catch (error: any) {
    console.error('Riot ranked stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ranked stats',
      message: error.message 
    });
  }
});

router.get('/riot/matches/:puuid', async (req, res) => {
  try {
    const { puuid } = req.params;
    const { region = 'americas', count = '10' } = req.query;

    const matches = await unifiedGamingAPI.getMatchHistory(puuid, region as string, parseInt(count as string));
    res.json(matches);
  } catch (error: any) {
    console.error('Riot match history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch match history',
      message: error.message 
    });
  }
});

router.get('/riot/match/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { region = 'americas' } = req.query;

    const matchDetails = await unifiedGamingAPI.getMatchDetails(matchId, region as string);
    res.json(matchDetails);
  } catch (error: any) {
    console.error('Riot match details error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch match details',
      message: error.message 
    });
  }
});

router.get('/riot/status', async (req, res) => {
  try {
    const status = unifiedGamingAPI.getAPIStatus();
    res.json(status);
  } catch (error: any) {
    console.error('Riot API status error:', error);
    res.status(500).json({ 
      error: 'Failed to get API status',
      message: error.message 
    });
  }
});

// Live esports matches with REAL API data only
router.get('/live-matches/:game?', async (req, res) => {
  try {
    const { game } = req.params;

    // Use real PandaScore API for live matches
    const realMatches = await unifiedGamingAPI.getEsportsMatches(game || 'lol');
    
    if (!realMatches || realMatches.length === 0) {
      return res.json([]);
    }

    // Transform real API data to our format
    const formattedMatches = realMatches.map((match: any) => ({
      id: match.id,
      game: match.videogame?.name || game,
      tournament: match.tournament?.name || 'Unknown Tournament',
      team1: {
        name: match.opponents?.[0]?.opponent?.name || 'Team 1',
        logo: match.opponents?.[0]?.opponent?.image_url || '',
        score: match.results?.[0]?.score || 0
      },
      team2: {
        name: match.opponents?.[1]?.opponent?.name || 'Team 2', 
        logo: match.opponents?.[1]?.opponent?.image_url || '',
        score: match.results?.[1]?.score || 0
      },
      status: match.status,
      scheduled_at: match.scheduled_at,
      live: match.status === 'running'
    }));

    res.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching real live matches:', error);
    res.status(500).json({ 
      error: 'Failed to fetch live matches. Please ensure PandaScore API key is configured.',
      message: error.message 
    });
  }
});

// Real player statistics from PandaScore API
router.get('/player-stats/:game?', async (req, res) => {
  try {
    const { game } = req.params;
    const pandaApiKey = process.env.PANDA_API_KEY;
    
    if (!pandaApiKey) {
      return res.status(500).json({ 
        error: 'PandaScore API key not configured. Please add PANDA_API_KEY to secrets.' 
      });
    }

    // Fetch real player stats from PandaScore
    const gameMapping: { [key: string]: string } = {
      'lol': 'lol',
      'cs2': 'cs',
      'csgo': 'cs',
      'valorant': 'valorant',
      'dota2': 'dota2'
    };

    const apiGame = gameMapping[game?.toLowerCase() || 'lol'] || 'lol';
    
    const response = await fetch(
      `https://api.pandascore.co/${apiGame}/players?sort=name&page=1&per_page=20`,
      {
        headers: { Authorization: `Bearer ${pandaApiKey}` }
      }
    );

    if (!response.ok) {
      throw new Error(`PandaScore API error: ${response.status}`);
    }

    const players = await response.json();
    
    // Transform real player data
    const playerStats = players.map((player: any) => ({
      id: player.id,
      player: player.name,
      team: player.current_team?.name || 'Free Agent',
      game: player.videogame?.name || apiGame,
      role: player.role || 'Unknown',
      image_url: player.image_url,
      nationality: player.nationality,
      stats: {
        // Real stats would come from additional API calls
        // For now, we'll indicate these need separate endpoints
        winRate: 'Requires match history API',
        totalWinnings: player.current_team?.total_winnings || 0
      }
    }));

    res.json(playerStats);
  } catch (error) {
    console.error('Error fetching real player stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch player stats from PandaScore API',
      message: error.message 
    });
  }
});

// Live betting odds with rapid updates
router.get('/live-odds', async (req, res) => {
  try {
    // Simulate real-time odds changes
    const liveOdds = {
      matches: [
        {
          matchId: 'lol-worlds-2025-final',
          odds: {
            match_winner: {
              team1: +(1.65 + (Math.random() - 0.5) * 0.1).toFixed(2),
              team2: +(2.35 + (Math.random() - 0.5) * 0.2).toFixed(2)
            },
            next_kill: {
              team1: +(1.85 + (Math.random() - 0.5) * 0.2).toFixed(2),
              team2: +(2.10 + (Math.random() - 0.5) * 0.2).toFixed(2)
            },
            next_objective: {
              team1: +(1.75 + (Math.random() - 0.5) * 0.15).toFixed(2),
              team2: +(2.25 + (Math.random() - 0.5) * 0.25).toFixed(2)
            }
          },
          lastUpdate: new Date().toISOString()
        },
        {
          matchId: 'cs2-major-semifinal',
          odds: {
            round_winner: {
              team1: +(1.95 + (Math.random() - 0.5) * 0.15).toFixed(2),
              team2: +(1.90 + (Math.random() - 0.5) * 0.15).toFixed(2)
            },
            first_kill: {
              team1: +(1.88 + (Math.random() - 0.5) * 0.12).toFixed(2),
              team2: +(1.97 + (Math.random() - 0.5) * 0.12).toFixed(2)
            }
          },
          lastUpdate: new Date().toISOString()
        }
      ]
    };

    res.json(liveOdds);
  } catch (error) {
    console.error('Error fetching live odds:', error);
    res.status(500).json({ error: 'Failed to fetch live odds' });
  }
});

// Place micro-bet
router.post('/micro-bet', async (req, res) => {
  try {
    const { betType, matchId, selection, odds, amount, userId } = req.body;

    // Validate bet parameters
    if (!betType || !matchId || !selection || !odds || !amount) {
      return res.status(400).json({ error: 'Missing required bet parameters' });
    }

    if (amount < 1 || amount > 1000) {
      return res.status(400).json({ error: 'Bet amount must be between $1 and $1000' });
    }

    // Create micro-bet record
    const microBet = {
      id: `micro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      matchId,
      betType,
      selection,
      odds,
      amount,
      potentialPayout: +(amount * Math.abs(odds)).toFixed(2),
      status: 'pending',
      placedAt: new Date().toISOString(),
      settledAt: null,
      result: null
    };

    // In production, save to database
    console.log('Micro-bet placed:', microBet);

    res.json({
      success: true,
      bet: microBet,
      message: 'Micro-bet placed successfully!'
    });
  } catch (error) {
    console.error('Error placing micro-bet:', error);
    res.status(500).json({ error: 'Failed to place micro-bet' });
  }
});

// Get tournament schedules
router.get('/tournaments/:game?', async (req, res) => {
  try {
    const { game } = req.params;

    const tournaments = await unifiedGamingAPI.getEsportsTournaments(game);
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// New Riot API specific endpoints
router.get('/riot/summoner/:summonerName/:region?', async (req, res) => {
  try {
    const { summonerName, region = 'na1' } = req.params;

    const playerStats = await unifiedGamingAPI.getRiotPlayerStats(summonerName, region);
    res.json(playerStats);
  } catch (error) {
    console.error('Error fetching Riot summoner:', error);
    res.status(500).json({ error: 'Failed to fetch summoner data' });
  }
});

router.get('/riot/live-game/:summonerName/:region?', async (req, res) => {
  try {
    const { summonerName, region = 'na1' } = req.params;

    const liveGame = await unifiedGamingAPI.getLiveGame(summonerName, region);

    if (!liveGame) {
      return res.json({ inGame: false, message: 'Player not currently in a game' });
    }

    res.json({ inGame: true, gameData: liveGame });
  } catch (error) {
    console.error('Error fetching live game:', error);
    res.status(500).json({ error: 'Failed to fetch live game data' });
  }
});

router.get('/riot/mastery/:summonerName/:region?', async (req, res) => {
  try {
    const { summonerName, region = 'na1' } = req.params;

    const mastery = await unifiedGamingAPI.getChampionMastery(summonerName, region);
    res.json(mastery);
  } catch (error) {
    console.error('Error fetching champion mastery:', error);
    res.status(500).json({ error: 'Failed to fetch champion mastery' });
  }
});

router.get('/valorant/player/:username/:tag/:region?', async (req, res) => {
  try {
    const { username, tag, region = 'na' } = req.params;

    const playerStats = await unifiedGamingAPI.getValorantStats(username, tag, region);
    res.json(playerStats);
  } catch (error) {
    console.error('Error fetching Valorant player:', error);
    res.status(500).json({ error: 'Failed to fetch Valorant player data' });
  }
});

router.get('/valorant/matches/:puuid/:region?', async (req, res) => {
  try {
    const { puuid, region = 'na' } = req.params;

    const matches = await unifiedGamingAPI.getValorantMatches(puuid, region);
    res.json(matches);
  } catch (error) {
    console.error('Error fetching Valorant matches:', error);
    res.status(500).json({ error: 'Failed to fetch Valorant matches' });
  }
});

// Real-time match events (for WebSocket simulation)
router.get('/match-events/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    // Simulate live match events
    const events = [
      {
        id: 'event_1',
        matchId,
        type: 'kill',
        timestamp: new Date().toISOString(),
        description: 'Faker eliminates Knight!',
        impact: 'high'
      },
      {
        id: 'event_2',
        matchId,
        type: 'objective',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        description: 'T1 secures Baron!',
        impact: 'very_high'
      }
    ];

    res.json(events);
  } catch (error) {
    console.error('Error fetching match events:', error);
    res.status(500).json({ error: 'Failed to fetch match events' });
  }
});

// Get gaming platform information
getGamingPlatforms() {
    return [

export default router;