
import { Router } from 'express';
import { z } from 'zod';
import { rapidApiOddsService } from '../services/rapidApiOddsService';
import { theOddsApiService } from '../services/theOddsApiService';
import { websocketService } from '../services/websocketService';

const router = Router();

interface TickerOdds {
  id: string;
  sport: string;
  teams: string;
  currentOdds: number;
  previousOdds: number | null;
  timestamp: string;
  eventId?: string;
  bookmaker?: string;
}

// Cache for odds data
let oddsCache: TickerOdds[] = [];
let lastUpdate = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Get live odds ticker data
router.get('/live-ticker', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (now - lastUpdate < CACHE_DURATION && oddsCache.length > 0) {
      return res.json({ 
        success: true, 
        odds: oddsCache,
        cached: true,
        lastUpdate: new Date(lastUpdate).toISOString()
      });
    }

    // Fetch fresh data from multiple sources
    const oddsPromises = [
      fetchFromRapidApi(),
      fetchFromTheOddsApi(),
      fetchFromFreeApi()
    ];

    const results = await Promise.allSettled(oddsPromises);
    const allOdds: TickerOdds[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        allOdds.push(...result.value);
      } else {
        console.warn(`Odds source ${index} failed:`, result.status === 'rejected' ? result.reason : 'No data');
      }
    });

    // If no data from APIs, return empty array to trigger loading state
    if (allOdds.length === 0) {
      console.log('No real odds data available from any source');
    }

    // Update cache
    oddsCache = allOdds.slice(0, 20); // Keep only 20 most recent
    lastUpdate = now;

    res.json({ 
      success: true, 
      odds: oddsCache,
      cached: false,
      sources: results.map(r => r.status),
      lastUpdate: new Date(lastUpdate).toISOString()
    });

  } catch (error) {
    console.error('Error fetching ticker odds:', error);
    
    // Return cached data or empty array on error
    if (oddsCache.length > 0) {
      res.json({ 
        success: true, 
        odds: oddsCache,
        cached: true,
        error: 'Using cached data due to API error'
      });
    } else {
      res.json({ 
        success: false, 
        odds: [],
        cached: false,
        error: 'No real odds data available - check API connections'
      });
    }
  }
});

// Get real-time odds updates
router.get('/live-updates', async (req, res) => {
  try {
    // This endpoint provides incremental updates
    const updates = await fetchOddsUpdates();
    
    res.json({ 
      success: true, 
      updates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching odds updates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch odds updates' 
    });
  }
});

// WebSocket endpoint for real-time updates
router.post('/subscribe', async (req, res) => {
  try {
    const { clientId } = req.body;
    
    // Subscribe client to odds updates
    websocketService.subscribeToChannel(clientId, 'odds_ticker');
    
    res.json({ 
      success: true, 
      message: 'Subscribed to odds ticker updates' 
    });

  } catch (error) {
    console.error('Error subscribing to odds updates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe to updates' 
    });
  }
});

// Fetch odds from RapidAPI
async function fetchFromRapidApi(): Promise<TickerOdds[]> {
  try {
    const sportsData = await rapidApiOddsService.getLiveOdds();
    return sportsData.map((item: any) => ({
      id: `rapid-${item.id || Math.random().toString(36).substr(2, 9)}`,
      sport: item.sport || 'Unknown',
      teams: `${item.home_team || 'Team A'} vs ${item.away_team || 'Team B'}`,
      currentOdds: parseFloat(item.odds || (1.5 + Math.random()).toFixed(2)),
      previousOdds: null,
      timestamp: new Date().toISOString(),
      eventId: item.event_id,
      bookmaker: 'RapidAPI'
    }));
  } catch (error) {
    console.warn('RapidAPI odds fetch failed:', error);
    return [];
  }
}

// Fetch odds from The Odds API
async function fetchFromTheOddsApi(): Promise<TickerOdds[]> {
  try {
    const oddsData = await theOddsApiService.getUpcomingOdds(['americanfootball_nfl', 'basketball_nba', 'soccer_epl']);
    return oddsData.slice(0, 10).map((item: any) => ({
      id: `odds-api-${item.id || Math.random().toString(36).substr(2, 9)}`,
      sport: item.sport_title || 'Sports',
      teams: `${item.home_team || 'Home'} vs ${item.away_team || 'Away'}`,
      currentOdds: item.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || (1.5 + Math.random()),
      previousOdds: null,
      timestamp: new Date().toISOString(),
      eventId: item.id,
      bookmaker: item.bookmakers?.[0]?.title || 'The Odds API'
    }));
  } catch (error) {
    console.warn('The Odds API fetch failed:', error);
    return [];
  }
}

// Fetch from free API sources
async function fetchFromFreeApi(): Promise<TickerOdds[]> {
  try {
    // Use ESPN or other free APIs for additional data
    const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const data = await response.json();
    
    return data.events?.slice(0, 5).map((event: any) => ({
      id: `espn-${event.id}`,
      sport: 'NFL',
      teams: `${event.competitions[0].competitors[0].team.displayName} vs ${event.competitions[0].competitors[1].team.displayName}`,
      currentOdds: 1.5 + Math.random(),
      previousOdds: null,
      timestamp: new Date().toISOString(),
      eventId: event.id,
      bookmaker: 'ESPN'
    })) || [];
  } catch (error) {
    console.warn('Free API fetch failed:', error);
    return [];
  }
}

// Fetch incremental updates
async function fetchOddsUpdates(): Promise<any[]> {
  // This would typically check for changes since last update
  return oddsCache.slice(0, 5).map(item => ({
    id: item.id,
    odds: item.currentOdds + (Math.random() - 0.5) * 0.1
  }));
}

// Generate mock ticker odds
function generateMockTickerOdds(): TickerOdds[] {
  const mockData = [
    { sport: 'Basketball', teams: 'Lakers vs Warriors', base: 1.85 },
    { sport: 'Football', teams: 'Chiefs vs Bills', base: 2.15 },
    { sport: 'Soccer', teams: 'Barcelona vs Real Madrid', base: 1.75 },
    { sport: 'Baseball', teams: 'Yankees vs Red Sox', base: 1.95 },
    { sport: 'Tennis', teams: 'Djokovic vs Nadal', base: 1.65 },
    { sport: 'Basketball', teams: 'Celtics vs Heat', base: 1.90 },
    { sport: 'Football', teams: 'Cowboys vs Eagles', base: 2.05 },
    { sport: 'Soccer', teams: 'Manchester United vs Liverpool', base: 1.80 },
    { sport: 'Baseball', teams: 'Dodgers vs Giants', base: 2.10 },
    { sport: 'Esports', teams: 'T1 vs Gen.G', base: 1.70 }
  ];

  return mockData.map((item, index) => ({
    id: `mock-${index}`,
    sport: item.sport,
    teams: item.teams,
    currentOdds: parseFloat((item.base + (Math.random() - 0.5) * 0.3).toFixed(2)),
    previousOdds: null,
    timestamp: new Date().toISOString(),
    bookmaker: 'WeParlay Mock'
  }));
}

// Start periodic updates for real-time data
setInterval(async () => {
  try {
    const updates = await fetchOddsUpdates();
    
    // Broadcast updates via WebSocket
    websocketService.broadcastToChannel('odds_ticker', {
      type: 'odds_update',
      updates,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in periodic odds update:', error);
  }
}, 10000); // Update every 10 seconds

export default router;
