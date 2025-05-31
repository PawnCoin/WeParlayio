import { Router } from 'express';
import { espnApiService } from '../services/espnApiService';

const router = Router();

// Test all configured APIs and show what's working
router.get('/test-apis', async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    apis: {}
  };

  // Test ESPN (should be free, no key required)
  try {
    const espnTest = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
    const espnData = await espnTest.json();
    results.apis.espn = {
      status: espnTest.ok ? 'WORKING' : 'FAILED',
      message: espnTest.ok ? `Found ${espnData.sports?.[0]?.leagues?.[0]?.teams?.length || 0} NBA teams` : 'Failed to connect',
      sampleData: espnTest.ok ? espnData.sports?.[0]?.leagues?.[0]?.teams?.slice(0, 2) : null
    };
  } catch (error) {
    results.apis.espn = { status: 'ERROR', message: error.message };
  }

  // Test RapidAPI (check what subscriptions are active)
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (rapidApiKey) {
    const rapidApiHosts = [
      'api-basketball.p.rapidapi.com',
      'api-football-v1.p.rapidapi.com', 
      'api-baseball.p.rapidapi.com',
      'free-nba.p.rapidapi.com',
      'livescore6.p.rapidapi.com'
    ];

    for (const host of rapidApiHosts) {
      try {
        const testResponse = await fetch(`https://${host}/status`, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': host
          }
        });
        
        results.apis[host] = {
          status: testResponse.ok ? 'SUBSCRIBED' : 'NOT_SUBSCRIBED',
          statusCode: testResponse.status,
          message: testResponse.ok ? 'Active subscription' : 'No subscription or API limit reached'
        };
      } catch (error) {
        results.apis[host] = { status: 'ERROR', message: error.message };
      }
    }
  } else {
    results.apis.rapidapi = { status: 'NO_KEY', message: 'RAPIDAPI_KEY not configured' };
  }

  // Test The Odds API
  const oddsApiKey = process.env.THE_ODDS_API_KEY;
  if (oddsApiKey) {
    try {
      const oddsTest = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${oddsApiKey}`);
      results.apis.odds_api = {
        status: oddsTest.status === 200 ? 'WORKING' : oddsTest.status === 401 ? 'QUOTA_EXCEEDED' : 'FAILED',
        statusCode: oddsTest.status,
        message: oddsTest.status === 200 ? 'Working' : oddsTest.status === 401 ? 'Quota exceeded (this is normal)' : 'Failed'
      };
    } catch (error) {
      results.apis.odds_api = { status: 'ERROR', message: error.message };
    }
  }

  res.json(results);
});

// Test specific ESPN endpoints for team logos
router.get('/test-espn-logos', async (req, res) => {
  try {
    // Test NBA teams
    const nbaResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
    const nbaData = await nbaResponse.json();
    
    const teamLogos = nbaData.sports?.[0]?.leagues?.[0]?.teams?.slice(0, 5).map(team => ({
      name: team.team.displayName,
      abbreviation: team.team.abbreviation,
      logo: team.team.logos?.[0]?.href,
      color: team.team.color
    }));

    res.json({
      status: 'success',
      message: 'ESPN team logos are available',
      sampleLogos: teamLogos,
      totalTeams: nbaData.sports?.[0]?.leagues?.[0]?.teams?.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch ESPN team data',
      error: error.message
    });
  }
});

export { router as apiTestRouter };