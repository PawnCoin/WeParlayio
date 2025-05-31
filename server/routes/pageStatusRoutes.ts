
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const PageCheckSchema = z.object({
  path: z.string()
});

// Known routes in the application
const knownRoutes = [
  '/',
  '/live-betting-enhanced',
  '/unified-sports',
  '/esports-hub',
  '/my-bets',
  '/results',
  '/wallet-management-enhanced',
  '/weparlay-cash',
  '/payment-demo',
  '/user-profile-banking',
  '/crypto-information',
  '/video-gaming',
  '/gaming-integration',
  '/unified-gaming',
  '/fantasy-sports-enhanced',
  '/tournaments',
  '/trivia',
  '/social-betting',
  '/head-to-head-betting',
  '/user-directory',
  '/social-media-dashboard',
  '/sms-challenge',
  '/betting-dashboard',
  '/comprehensive-betting',
  '/betting-manager',
  '/parlays',
  '/odds',
  '/live-heatmap',
  '/login-enhanced',
  '/signup-enhanced',
  '/user-profile-page',
  '/settings',
  '/security-settings',
  '/mobile-login',
  '/admin-dashboard',
  '/admin-login',
  '/admin-bypass',
  '/email-monitoring',
  '/theme-color-manager',
  '/vip-features',
  '/enhanced-features',
  '/betting-academy',
  '/live-sports-streaming',
  '/betting-experience',
  '/support',
  '/terms-of-service',
  '/privacy-policy',
  '/security-info',
  '/onboarding-demo',
  '/auth-test-demo',
  '/notification-test',
  '/theme-settings-page',
  '/wallet-test',
  '/site-navigation',
  '/social-media-bots',
  '/page-status-checker'
];

// Known broken/problematic routes
const knownIssues = {
  '/admin-dashboard': 'Component error in AdminDashboard.tsx',
  '/esports-hub': 'Potential component issues',
  '/live-betting-enhanced': 'WebSocket connection issues'
};

router.get('/check-page-status', (req, res) => {
  try {
    const { path } = PageCheckSchema.parse(req.query);
    
    const isKnownRoute = knownRoutes.includes(path);
    const hasKnownIssues = knownIssues[path as keyof typeof knownIssues];
    
    if (!isKnownRoute) {
      return res.json({
        status: 'not-found',
        message: 'Route not found in application',
        path
      });
    }
    
    if (hasKnownIssues) {
      return res.json({
        status: 'error',
        message: hasKnownIssues,
        path
      });
    }
    
    return res.json({
      status: 'success',
      message: 'Route exists and should be functional',
      path
    });
    
  } catch (error) {
    console.error('Page status check error:', error);
    res.status(400).json({
      error: 'Invalid request parameters'
    });
  }
});

router.get('/all-page-statuses', (req, res) => {
  try {
    const pageStatuses = knownRoutes.map(path => {
      const hasKnownIssues = knownIssues[path as keyof typeof knownIssues];
      
      return {
        path,
        status: hasKnownIssues ? 'error' : 'success',
        message: hasKnownIssues || 'Route exists and should be functional'
      };
    });
    
    res.json({
      success: true,
      pages: pageStatuses,
      summary: {
        total: knownRoutes.length,
        working: knownRoutes.length - Object.keys(knownIssues).length,
        errors: Object.keys(knownIssues).length,
        notFound: 0
      }
    });
    
  } catch (error) {
    console.error('All page status check error:', error);
    res.status(500).json({
      error: 'Failed to check page statuses'
    });
  }
});

export default router;
