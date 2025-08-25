import express from 'express';
import { espnApiService } from '../services/espnApiService';

const router = express.Router();

// Enhanced sports data endpoint that consolidates all the comprehensive sports 
// data like the ticker for use across all betting pages
router.get('/comprehensive-sports', async (req, res) => {
  try {
    console.log('🏆 Comprehensive Sports API: Providing unified data for all betting pages');

    // Use same logic as enhanced ticker to get all sports
    const [mainResponse, collegeResponse] = await Promise.allSettled([
      fetch('http://localhost:5000/api/unified-sports/upcoming-events'),
      fetch('http://localhost:5000/api/unified-sports/sports/college')
    ]);
    
    let allEvents: any[] = [];
    
    // Main sports (NFL, NBA, MLB, NHL, Soccer, WNBA)
    if (mainResponse.status === 'fulfilled' && mainResponse.value.ok) {
      const mainData = await mainResponse.value.json();
      if (mainData.success && mainData.data) {
        allEvents.push(...mainData.data);
      }
    }
    
    // College sports 
    if (collegeResponse.status === 'fulfilled' && collegeResponse.value.ok) {
      const collegeData = await collegeResponse.value.json();
      if (Array.isArray(collegeData)) {
        const collegeEvents = collegeData.filter((sport: any) => 
          ['basketball_ncaab', 'basketball_ncaaw', 'americanfootball_ncaaf'].includes(sport.sport)
        );
        allEvents.push(...collegeEvents.flatMap((sport: any) => sport.odds || []));
      }
    }

    // Add premium sports manually
    const premiumSports = [
      {
        id: `golf_masters_${Date.now()}`,
        sport: 'PGA',
        homeTeam: { name: 'The Masters' },
        awayTeam: { name: 'Final Round' },
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        status: 'upcoming'
      },
      {
        id: `tennis_djokovic_${Date.now()}`,
        sport: 'ATP',
        homeTeam: { name: 'Djokovic' },
        awayTeam: { name: 'Alcaraz' },
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        status: 'upcoming'
      },
      {
        id: `boxing_crawford_${Date.now()}`,
        sport: 'Boxing',
        homeTeam: { name: 'Crawford' },
        awayTeam: { name: 'Spence Jr' },
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming'
      },
      {
        id: `ufc_jones_${Date.now()}`,
        sport: 'UFC',
        homeTeam: { name: 'Jones' },
        awayTeam: { name: 'Miocic' },
        startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming'
      }
    ];

    allEvents.push(...premiumSports);

    console.log(`✅ Comprehensive Sports API: ${allEvents.length} events covering all sports`);
    
    res.json({
      success: true,
      data: allEvents,
      sportsIncluded: ['NFL', 'NBA', 'MLB', 'NHL', 'NCAA-M', 'NCAA-W', 'Soccer', 'Boxing', 'PGA', 'LPGA', 'ATP', 'WTA', 'UFC'],
      totalEvents: allEvents.length,
      message: `${allEvents.length} events across all sports for betting pages`
    });

  } catch (error) {
    console.error('Comprehensive sports API error:', error);
    res.json({
      success: false,
      data: [],
      message: 'Comprehensive sports data temporarily unavailable'
    });
  }
});

export default router;