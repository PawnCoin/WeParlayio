
// Comprehensive API Configuration for WeParlay
// All real APIs - no mock data

export const API_CONFIGS = {
  // Gaming APIs
  RIOT_GAMES: {
    name: 'Riot Games API',
    baseUrl: 'https://na1.api.riotgames.com',
    keyName: 'RIOT_API_KEY',
    dailyLimit: 20000,
    priority: 1,
    endpoints: {
      summoner: '/lol/summoner/v4/summoners/by-name/',
      ranked: '/lol/league/v4/entries/by-summoner/',
      matches: '/lol/match/v5/matches/by-puuid/',
      liveGame: '/lol/spectator/v4/active-games/by-summoner/'
    }
  },
  
  PANDASCORE: {
    name: 'PandaScore Esports API',
    baseUrl: 'https://api.pandascore.co',
    keyName: 'PANDA_API_KEY',
    dailyLimit: 1000,
    priority: 1,
    endpoints: {
      tournaments: '/{game}/tournaments',
      matches: '/{game}/matches',
      players: '/{game}/players',
      teams: '/{game}/teams'
    }
  },

  TRACKER_GG: {
    name: 'Tracker.gg API',
    baseUrl: 'https://api.tracker.gg/api/v2',
    keyName: 'TRACKER_API_KEY',
    dailyLimit: 100,
    priority: 2,
    endpoints: {
      valorant: '/valorant/standard/profile/riot/',
      csgo: '/csgo/standard/profile/steam/',
      fortnite: '/fortnite/standard/profile/'
    }
  },

  // Sports APIs
  ESPN: {
    name: 'ESPN API',
    baseUrl: 'https://site.api.espn.com/apis/site/v2/sports',
    keyName: null, // Free API
    dailyLimit: 10000,
    priority: 3,
    endpoints: {
      nfl: '/football/nfl/scoreboard',
      nba: '/basketball/nba/scoreboard',
      mlb: '/baseball/mlb/scoreboard',
      nhl: '/hockey/nhl/scoreboard'
    }
  },

  ODDS_API: {
    name: 'The Odds API',
    baseUrl: 'https://api.the-odds-api.com/v4',
    keyName: 'ODDS_API_KEY',
    dailyLimit: 500,
    priority: 1,
    endpoints: {
      sports: '/sports',
      odds: '/sports/{sport}/odds',
      scores: '/sports/{sport}/scores'
    }
  },

  RAPID_API_SPORTS: {
    name: 'RapidAPI Sports',
    baseUrl: 'https://api-basketball.p.rapidapi.com',
    keyName: 'RAPIDAPI_KEY',
    dailyLimit: 500,
    priority: 2,
    endpoints: {
      games: '/games',
      standings: '/standings',
      players: '/players'
    }
  }
};

// API Health Check
export function getAPIHealth() {
  const health = {};
  
  for (const [apiName, config] of Object.entries(API_CONFIGS)) {
    const apiKey = config.keyName ? process.env[config.keyName] : 'FREE';
    health[apiName] = {
      configured: !!apiKey || config.keyName === null,
      keyPresent: !!apiKey,
      status: !!apiKey || config.keyName === null ? 'READY' : 'MISSING_KEY'
    };
  }
  
  return health;
}

// Required environment variables
export const REQUIRED_ENV_VARS = [
  'RIOT_API_KEY',
  'PANDA_API_KEY', 
  'ODDS_API_KEY',
  'TRACKER_API_KEY',
  'RAPIDAPI_KEY'
];

export function validateAPIConfiguration() {
  const missing = [];
  const configured = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (process.env[envVar]) {
      configured.push(envVar);
    } else {
      missing.push(envVar);
    }
  }
  
  return {
    configured,
    missing,
    allConfigured: missing.length === 0
  };
}
