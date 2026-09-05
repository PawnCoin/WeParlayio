import express from 'express';
import { espnApiService } from '../services/espnApiService';

const router = express.Router();

// The ticker is a schedule and score surface. It never derives betting lines:
// licensed odds must be requested through the verified odds endpoints.
router.get('/live-ticker', async (_req, res) => {
  try {
    const events = await espnApiService.getTodayEvents();
    const now = new Date().toISOString();
    const ticker = events.map((event: any) => ({
      id: `espn_${event.id}`,
      eventId: event.id,
      sport: event.sport,
      teams: `${event.awayTeam.name} vs ${event.homeTeam.name}`,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      currentOdds: null,
      previousOdds: null,
      timestamp: now,
      startTime: event.startTime,
      bookmaker: null,
      status: event.status,
      statusDetail: event.statusDetail,
      timeframe: 'Today',
      source: event.source,
      displayText: event.status === 'live' || event.status === 'final'
        ? `${event.awayTeam.name} ${event.awayTeam.score ?? '–'} - ${event.homeTeam.name} ${event.homeTeam.score ?? '–'}`
        : `Today • ${event.awayTeam.name} vs ${event.homeTeam.name}`,
    }));

    res.json({
      success: true,
      odds: ticker,
      cached: false,
      lastUpdate: now,
      timeframe: 'today only',
      totalEvents: ticker.length,
      source: 'ESPN',
      message: ticker.length ? 'Verified today-only schedule and score data' : 'No verified games are currently available',
    });
  } catch (error) {
    console.error('Error fetching verified ticker data:', error);
    res.status(503).json({
      success: false,
      odds: [],
      cached: false,
      lastUpdate: new Date().toISOString(),
      timeframe: 'today only',
      message: 'Verified ticker data is temporarily unavailable',
    });
  }
});

router.post('/subscribe', async (req, res) => {
  res.json({
    success: true,
    clientId: req.body?.clientId,
    message: 'Use the today-only ticker feed for refreshed verified event data',
  });
});

export default router;
