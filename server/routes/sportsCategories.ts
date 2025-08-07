/**
 * Sports Categories Routes - All connected to Pinnacle Odds API first
 * Handles: Basketball, Football, Soccer, Tennis, Baseball, Ice Hockey, Combat Sports, Other Sports
 */

import express from 'express';
import { pinnacleOddsService } from '../services/pinnacleOddsService';

const router = express.Router();

// Basketball - NBA, WNBA, College Basketball, International
router.get('/basketball', async (req, res) => {
  try {
    console.log('🏀 Basketball: Connecting to Pinnacle Odds (Priority 1)');
    const pinnacleData = await pinnacleOddsService.getPinnacleOdds('basketball');
    
    if (pinnacleData.length > 0) {
      res.json({
        success: true,
        sport: 'Basketball',
        source: 'Pinnacle Odds API',
        count: pinnacleData.length,
        odds: pinnacleData,
        priority: 1
      });
      return;
    }

    // Fallback to other sources if Pinnacle unavailable
    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Basketball',
      sport: 'Basketball',
      odds: []
    });
  } catch (error) {
    console.error('Basketball odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch basketball odds' });
  }
});

// American Football - NFL, College Football
router.get('/football', async (req, res) => {
  try {
    console.log('🏈 Football: Connecting to Pinnacle Odds (Priority 1)');
    const pinnacleData = await pinnacleOddsService.getPinnacleOdds('americanfootball_nfl');
    
    if (pinnacleData.length > 0) {
      res.json({
        success: true,
        sport: 'American Football',
        source: 'Pinnacle Odds API',
        count: pinnacleData.length,
        odds: pinnacleData,
        priority: 1
      });
      return;
    }

    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Football',
      sport: 'Football',
      odds: []
    });
  } catch (error) {
    console.error('Football odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch football odds' });
  }
});

// Soccer - Premier League, Champions League, World Cup, etc.
router.get('/soccer', async (req, res) => {
  try {
    console.log('⚽ Soccer: Connecting to Pinnacle Odds (Priority 1)');
    const pinnacleData = await pinnacleOddsService.getPinnacleOdds('soccer');
    
    if (pinnacleData.length > 0) {
      res.json({
        success: true,
        sport: 'Soccer',
        source: 'Pinnacle Odds API',
        count: pinnacleData.length,
        odds: pinnacleData,
        priority: 1
      });
      return;
    }

    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Soccer',
      sport: 'Soccer',
      odds: []
    });
  } catch (error) {
    console.error('Soccer odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch soccer odds' });
  }
});

// Tennis - ATP, WTA, Grand Slams
router.get('/tennis', async (req, res) => {
  try {
    console.log('🎾 Tennis: Connecting to Pinnacle Odds (Priority 1)');
    const pinnacleData = await pinnacleOddsService.getPinnacleOdds('tennis');
    
    if (pinnacleData.length > 0) {
      res.json({
        success: true,
        sport: 'Tennis',
        source: 'Pinnacle Odds API',
        count: pinnacleData.length,
        odds: pinnacleData,
        priority: 1
      });
      return;
    }

    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Tennis',
      sport: 'Tennis',
      odds: []
    });
  } catch (error) {
    console.error('Tennis odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tennis odds' });
  }
});

// Baseball - MLB, Minor League, International
router.get('/baseball', async (req, res) => {
  try {
    console.log('⚾ Baseball: Connecting to Pinnacle Odds (Priority 1)');
    const pinnacleData = await pinnacleOddsService.getPinnacleOdds('baseball');
    
    if (pinnacleData.length > 0) {
      res.json({
        success: true,
        sport: 'Baseball',
        source: 'Pinnacle Odds API',
        count: pinnacleData.length,
        odds: pinnacleData,
        priority: 1
      });
      return;
    }

    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Baseball',
      sport: 'Baseball',
      odds: []
    });
  } catch (error) {
    console.error('Baseball odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch baseball odds' });
  }
});

// Ice Hockey - NHL, International Hockey
router.get('/ice-hockey', async (req, res) => {
  try {
    console.log('🏒 Ice Hockey: Connecting to Pinnacle Odds (Priority 1)');
    const pinnacleData = await pinnacleOddsService.getPinnacleOdds('icehockey');
    
    if (pinnacleData.length > 0) {
      res.json({
        success: true,
        sport: 'Ice Hockey',
        source: 'Pinnacle Odds API',
        count: pinnacleData.length,
        odds: pinnacleData,
        priority: 1
      });
      return;
    }

    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Ice Hockey',
      sport: 'Ice Hockey',
      odds: []
    });
  } catch (error) {
    console.error('Ice Hockey odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ice hockey odds' });
  }
});

// Combat Sports - MMA, Boxing, UFC
router.get('/combat-sports', async (req, res) => {
  try {
    console.log('🥊 Combat Sports: Connecting to Pinnacle Odds (Priority 1)');
    
    // Try both MMA and Boxing
    const [mmaData, boxingData] = await Promise.allSettled([
      pinnacleOddsService.getPinnacleOdds('mma'),
      pinnacleOddsService.getPinnacleOdds('boxing')
    ]);

    const combinedData = [];
    
    if (mmaData.status === 'fulfilled' && mmaData.value.length > 0) {
      combinedData.push(...mmaData.value);
    }
    
    if (boxingData.status === 'fulfilled' && boxingData.value.length > 0) {
      combinedData.push(...boxingData.value);
    }
    
    if (combinedData.length > 0) {
      res.json({
        success: true,
        sport: 'Combat Sports',
        source: 'Pinnacle Odds API',
        count: combinedData.length,
        odds: combinedData,
        priority: 1,
        breakdown: {
          mma: mmaData.status === 'fulfilled' ? mmaData.value.length : 0,
          boxing: boxingData.status === 'fulfilled' ? boxingData.value.length : 0
        }
      });
      return;
    }

    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Combat Sports',
      sport: 'Combat Sports',
      odds: []
    });
  } catch (error) {
    console.error('Combat Sports odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch combat sports odds' });
  }
});

// Other Sports - Golf, Cricket, etc.
router.get('/other-sports', async (req, res) => {
  try {
    console.log('🏆 Other Sports: Connecting to Pinnacle Odds (Priority 1)');
    
    // Try multiple other sports
    const [golfData, cricketData] = await Promise.allSettled([
      pinnacleOddsService.getPinnacleOdds('golf'),
      pinnacleOddsService.getPinnacleOdds('cricket')
    ]);

    const combinedData = [];
    
    if (golfData.status === 'fulfilled' && golfData.value.length > 0) {
      combinedData.push(...golfData.value);
    }
    
    if (cricketData.status === 'fulfilled' && cricketData.value.length > 0) {
      combinedData.push(...cricketData.value);
    }
    
    if (combinedData.length > 0) {
      res.json({
        success: true,
        sport: 'Other Sports',
        source: 'Pinnacle Odds API',
        count: combinedData.length,
        odds: combinedData,
        priority: 1,
        breakdown: {
          golf: golfData.status === 'fulfilled' ? golfData.value.length : 0,
          cricket: cricketData.status === 'fulfilled' ? cricketData.value.length : 0
        }
      });
      return;
    }

    res.json({
      success: false,
      message: 'Pinnacle Odds unavailable for Other Sports',
      sport: 'Other Sports',
      odds: []
    });
  } catch (error) {
    console.error('Other Sports odds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch other sports odds' });
  }
});

// Get all sports categories with Pinnacle integration status
router.get('/all-categories', async (req, res) => {
  try {
    const categories = [
      'basketball',
      'americanfootball_nfl',
      'soccer',
      'tennis', 
      'baseball',
      'icehockey',
      'mma',
      'boxing',
      'golf',
      'cricket'
    ];

    console.log('🎯 All Categories: Checking Pinnacle Odds connectivity');
    
    const results = await pinnacleOddsService.getMultiSportOdds(categories);
    
    const categoryStatus = {
      'Basketball': { 
        available: results.basketball?.length > 0 || false,
        count: results.basketball?.length || 0,
        source: 'Pinnacle'
      },
      'Football': { 
        available: results.americanfootball_nfl?.length > 0 || false,
        count: results.americanfootball_nfl?.length || 0,
        source: 'Pinnacle'
      },
      'Soccer': { 
        available: results.soccer?.length > 0 || false,
        count: results.soccer?.length || 0,
        source: 'Pinnacle'
      },
      'Tennis': { 
        available: results.tennis?.length > 0 || false,
        count: results.tennis?.length || 0,
        source: 'Pinnacle'
      },
      'Baseball': { 
        available: results.baseball?.length > 0 || false,
        count: results.baseball?.length || 0,
        source: 'Pinnacle'
      },
      'Ice Hockey': { 
        available: results.icehockey?.length > 0 || false,
        count: results.icehockey?.length || 0,
        source: 'Pinnacle'
      },
      'Combat Sports': { 
        available: (results.mma?.length > 0 || results.boxing?.length > 0) || false,
        count: (results.mma?.length || 0) + (results.boxing?.length || 0),
        source: 'Pinnacle'
      },
      'Other Sports': { 
        available: (results.golf?.length > 0 || results.cricket?.length > 0) || false,
        count: (results.golf?.length || 0) + (results.cricket?.length || 0),
        source: 'Pinnacle'
      }
    };

    const totalCategories = Object.keys(categoryStatus).length;
    const availableCategories = Object.values(categoryStatus).filter(cat => cat.available).length;
    
    res.json({
      success: true,
      message: 'Sports categories connected to Pinnacle Odds API',
      totalCategories,
      availableCategories,
      pinnacleConnectivity: `${availableCategories}/${totalCategories}`,
      categories: categoryStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('All categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to check sports categories' });
  }
});

export default router;