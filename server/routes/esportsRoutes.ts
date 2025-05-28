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

// Live esports matches with real-time data
router.get('/live-matches/:game?', async (req, res) => {
  try {
    const { game } = req.params;

    // In production, integrate with real APIs:
    // - Riot Games API for LoL
    // - Steam API for CS2  
    // - PandaScore for tournament data
    // - HLTV API for CS rankings

    const mockLiveMatches = [
      {
        id: 'lol-worlds-2025-final',
        game: 'League of Legends',
        tournament: 'Worlds 2025 Finals',
        team1: { 
          name: 'T1', 
          logo: '🏆', 
          score: 2,
          players: ['Faker', 'Oner', 'Zeus', 'Gumayusi', 'Keria']
        },
        team2: { 
          name: 'JDG', 
          logo: '⚡', 
          score: 1,
          players: ['Knight', 'Kanavi', '369', 'Ruler', 'Missing']
        },
        status: 'live',
        viewers: 2840000,
        gameState: {
          currentGame: 4,
          timeElapsed: '28:43',
          goldDifference: 4500,
          nextObjective: 'Baron spawns in 1:23',
          killScore: [18, 12]
        },
        liveOdds: {
          matchWinner: { team1: 1.65, team2: 2.35 },
          nextKill: { team1: 1.85, team2: 2.10 },
          nextObjective: { team1: 1.75, team2: 2.25 },
          firstBlood: { team1: 1.90, team2: 1.95 }
        },
        microBets: [
          { type: 'next_kill', odds: { team1: 1.85, team2: 2.10 } },
          { type: 'next_tower', odds: { team1: 1.70, team2: 2.40 } },
          { type: 'next_dragon', odds: { team1: 1.95, team2: 1.90 } }
        ]
      },
      {
        id: 'cs2-major-semifinal',
        game: 'CS2',
        tournament: 'CS2 Major Copenhagen 2025',
        team1: { 
          name: 'NAVI', 
          logo: '🌟', 
          score: 13,
          players: ['s1mple', 'electronic', 'Perfecto', 'b1t', 'Boombl4']
        },
        team2: { 
          name: 'FaZe', 
          logo: '🔥', 
          score: 11,
          players: ['karrigan', 'rain', 'Twistzz', 'ropz', 'broky']
        },
        status: 'live',
        viewers: 892000,
        gameState: {
          currentMap: 'Mirage',
          round: 25,
          halfTime: 'Second Half',
          economy: 'NAVI: $23,400 | FaZe: $18,200',
          weaponStats: {
            navi: { rifles: 4, awp: 1 },
            faze: { rifles: 3, awp: 1, pistols: 1 }
          }
        },
        liveOdds: {
          roundWinner: { team1: 1.95, team2: 1.90 },
          firstKill: { team1: 1.88, team2: 1.97 },
          bombPlant: { yes: 1.65, no: 2.35 },
          ecoRound: { yes: 2.80, no: 1.45 }
        },
        microBets: [
          { type: 'round_winner', odds: { team1: 1.95, team2: 1.90 } },
          { type: 'first_kill', odds: { team1: 1.88, team2: 1.97 } },
          { type: 'ace_this_round', odds: { yes: 15.0, no: 1.08 } }
        ]
      }
    ];

    const filteredMatches = game 
      ? mockLiveMatches.filter(match => match.game.toLowerCase().includes(game.toLowerCase()))
      : mockLiveMatches;

    res.json(filteredMatches);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
});

// Player statistics and performance data
router.get('/player-stats/:game?', async (req, res) => {
  try {
    const { game } = req.params;

    const mockPlayerStats = [
      {
        id: 'faker-lol-stats',
        player: 'Faker',
        team: 'T1',
        game: 'League of Legends',
        role: 'Mid',
        stats: {
          kda: '4.8/1.2/6.3',
          winRate: '78%',
          avgKills: 4.8,
          avgDeaths: 1.2,
          avgAssists: 6.3,
          cs_per_min: 8.9,
          gold_per_min: 425,
          dmg_per_min: 512
        },
        recentForm: [
          { match: 'vs JDG', kills: 6, deaths: 0, assists: 8, result: 'W' },
          { match: 'vs BLG', kills: 3, deaths: 2, assists: 7, result: 'W' },
          { match: 'vs WBG', kills: 5, deaths: 1, assists: 5, result: 'W' }
        ],
        props: [
          { type: 'kills', line: 4.5, over: -110, under: -110 },
          { type: 'assists', line: 6.5, over: -105, under: -115 },
          { type: 'cs', line: 195.5, over: -120, under: 100 }
        ]
      },
      {
        id: 's1mple-cs2-stats',
        player: 's1mple',
        team: 'NAVI',
        game: 'CS2',
        role: 'AWPer',
        stats: {
          rating: 1.28,
          kd_ratio: 1.45,
          adr: 87.3,
          headshot_pct: 62.1,
          maps_played: 124,
          clutch_success: '43%'
        },
        recentForm: [
          { match: 'vs FaZe', kills: 24, deaths: 16, adr: 92.4, result: 'W' },
          { match: 'vs G2', kills: 19, deaths: 18, adr: 78.2, result: 'L' },
          { match: 'vs Vitality', kills: 26, deaths: 14, adr: 95.7, result: 'W' }
        ],
        props: [
          { type: 'kills', line: 21.5, over: -115, under: -105 },
          { type: 'adr', line: 85.5, over: -110, under: -110 },
          { type: 'first_kills', line: 2.5, over: +105, under: -125 }
        ]
      }
    ];

    const filteredStats = game 
      ? mockPlayerStats.filter(player => player.game.toLowerCase().includes(game.toLowerCase()))
      : mockPlayerStats;

    res.json(filteredStats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
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