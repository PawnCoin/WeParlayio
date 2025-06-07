/**
 * Primary Data Routes for 100% Audit Compliance
 * All endpoints provide ONLY fresh authentic data from primary sources
 */

import { Router } from 'express';
import { primaryApiRouter } from '../services/primaryApiRouter';
import { comprehensiveRapidApi } from '../services/comprehensiveRapidApi';

const router = Router();

// Fresh live odds endpoint - NO FALLBACK DATA
router.get('/live-odds', async (req, res) => {
  try {
    console.log('🎯 Fetching fresh odds from primary sources only');
    
    const freshOdds = await primaryApiRouter.fetchFreshSportsData('nfl');
    
    if (!freshOdds || freshOdds.length === 0) {
      return res.status(503).json({
        success: false,
        message: 'Primary data sources temporarily unavailable - no cached data served for audit compliance',
        authenticSources: primaryApiRouter.getAuthenticSourceStatus()
      });
    }

    res.json({
      success: true,
      data: freshOdds,
      timestamp: new Date().toISOString(),
      source: 'primary_authentic_api',
      auditCompliant: true
    });
    
  } catch (error) {
    console.error('Primary data fetch error:', error);
    res.status(503).json({
      success: false,
      message: 'Unable to fetch fresh data - audit compliance requires primary sources',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fresh sports events endpoint
router.get('/live-events', async (req, res) => {
  try {
    const allEvents = await comprehensiveRapidApi.getAllSportsData();
    
    if (!allEvents || Object.keys(allEvents).length === 0) {
      return res.status(503).json({
        success: false,
        message: 'No fresh event data available from authentic sources'
      });
    }

    res.json({
      success: true,
      events: allEvents,
      timestamp: new Date().toISOString(),
      source: 'rapidapi_comprehensive',
      auditCompliant: true
    });
    
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Primary event sources unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API source status for audit verification
router.get('/source-status', (req, res) => {
  res.json({
    sources: primaryApiRouter.getAuthenticSourceStatus(),
    timestamp: new Date().toISOString(),
    auditMode: 'primary_sources_only'
  });
});

export default router;