
import express from 'express';
import { apiRateLimitManager } from '../services/apiRateLimitManager';
import { validateAPIConfiguration, getAPIHealth } from '../config/apiConfiguration';

const router = express.Router();

// Comprehensive API health dashboard
router.get('/health-dashboard', async (req, res) => {
  try {
    const apiStatus = await apiRateLimitManager.getAPIStatus();
    const warnings = await apiRateLimitManager.checkAPIHealth();
    const configValidation = validateAPIConfiguration();
    const apiHealth = getAPIHealth();

    const healthDashboard = {
      timestamp: new Date().toISOString(),
      overall_status: warnings.length === 0 ? 'healthy' : warnings.length < 3 ? 'warning' : 'critical',
      api_limits: apiStatus,
      warnings,
      configuration: {
        ...configValidation,
        api_health: apiHealth
      },
      recommendations: []
    };

    // Generate recommendations
    if (warnings.length > 0) {
      healthDashboard.recommendations.push('⚠️ Some APIs are approaching their limits');
    }
    
    if (!configValidation.allConfigured) {
      healthDashboard.recommendations.push('🔑 Configure missing API keys for full functionality');
    }

    if (configValidation.criticalFailure) {
      healthDashboard.recommendations.push('🚨 CRITICAL: Too many APIs missing - platform severely limited');
    }

    res.json(healthDashboard);
  } catch (error) {
    console.error('API health dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to generate health dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

// Individual API status
router.get('/api/:apiName/status', async (req, res) => {
  try {
    const { apiName } = req.params;
    const remaining = await apiRateLimitManager.getRemainingCalls(apiName);
    const canMake = await apiRateLimitManager.canMakeRequest(apiName);

    res.json({
      apiName,
      remainingCalls: remaining,
      canMakeRequest: canMake,
      status: canMake ? 'available' : 'limit_exceeded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`API status error for ${req.params.apiName}:`, error);
    res.status(500).json({ error: 'Failed to get API status' });
  }
});

// Reset API limits (admin only)
router.post('/reset-limits', async (req, res) => {
  try {
    // This would normally check admin permissions
    const { apiName } = req.body;
    
    if (apiName) {
      // Reset specific API
      await apiRateLimitManager.recordRequest(apiName, -999999); // Reset to 0
      res.json({ message: `Reset limits for ${apiName}` });
    } else {
      // Reset all APIs
      res.json({ message: 'All API limits reset (implement as needed)' });
    }
  } catch (error) {
    console.error('Reset limits error:', error);
    res.status(500).json({ error: 'Failed to reset limits' });
  }
});

export default router;
