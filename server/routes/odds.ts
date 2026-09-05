// Real odds endpoints using The Odds API
import { Request, Response } from 'express';

export async function getRealOdds(req: Request, res: Response) {
  try {
    const { TheOddsApiService } = await import('../services/theOddsApiService');
    const oddsService = new TheOddsApiService();
    
    // Fetch real odds for major sports
    const [nflOdds, nbaOdds, soccerOdds] = await Promise.allSettled([
      oddsService.getOdds('americanfootball_nfl'),
      oddsService.getOdds('basketball_nba'), 
      oddsService.getOdds('soccer_epl')
    ]);

    const allOdds = [];
    
    if (nflOdds.status === 'fulfilled') allOdds.push(...nflOdds.value);
    if (nbaOdds.status === 'fulfilled') allOdds.push(...nbaOdds.value);
    if (soccerOdds.status === 'fulfilled') allOdds.push(...soccerOdds.value);

    console.log(`✅ REAL ODDS: Serving ${allOdds.length} verified betting odds`);
    res.json(allOdds);
    
  } catch (error: any) {
    console.error('Real odds error:', error);
    
    res.status(503).json({ message: 'Verified odds are temporarily unavailable', data: [] });
  }
}

export async function getSportOdds(req: Request, res: Response) {
  try {
    const { sport } = req.params;
    const { TheOddsApiService } = await import('../services/theOddsApiService');
    const oddsService = new TheOddsApiService();
    
    const odds = await oddsService.getOdds(sport);
    console.log(`✅ REAL ODDS: ${sport} - ${odds.length} games with odds`);
    res.json(odds);
    
  } catch (error: any) {
    console.error(`Real odds error for ${req.params.sport}:`, error);
    res.status(500).json({ error: 'Failed to fetch sport odds' });
  }
}
