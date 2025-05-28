
import express from 'express';
import { apiRateLimitManager } from '../services/apiRateLimitManager';

const router = express.Router();

// Get API status and remaining calls
router.get('/api-status', async (req, res) => {
  try {
    const status = await apiRateLimitManager.getAPIStatus();
    const warnings = await apiRateLimitManager.checkAPIHealth();
    
    res.json({
      status,
      warnings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting API status:', error);
    res.status(500).json({ error: 'Failed to get API status' });
  }
});

// Get remaining calls for specific API
router.get('/api-status/:apiName', async (req, res) => {
  try {
    const { apiName } = req.params;
    const remaining = await apiRateLimitManager.getRemainingCalls(apiName);
    
    res.json({
      apiName,
      remainingCalls: remaining,
      canMakeRequest: await apiRateLimitManager.canMakeRequest(apiName)
    });
  } catch (error) {
    console.error('Error getting API status:', error);
    res.status(500).json({ error: 'Failed to get API status' });
  }
});

export default router;
