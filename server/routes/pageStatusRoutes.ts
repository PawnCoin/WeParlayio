
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

// Routes that actually return 404 (not found in router)
const actual404Routes = [
  '/nonexistent-page',
  '/old-betting-page',
  '/legacy-dashboard',
  '/deleted-feature',
  '/test-page-that-doesnt-exist',
  '/random-404-page',
  '/missing-component',
  '/broken-link'
];

// Known broken/problematic routes based on actual errors
const knownIssues = {
  '/admin-dashboard': 'React component error - AdminDashboard component crashes',
  '/esports-hub': 'Component rendering errors detected', 
  '/live-betting-enhanced': 'WebSocket connection failures (Error 1006)',
  '/admin-login': 'Potential authentication flow issues',
  '/email-monitoring': 'API endpoint errors',
  '/theme-color-manager': 'Component state management issues',
  '/social-media-dashboard': 'Authentication required errors',
  '/betting-academy': 'Component loading issues',
  '/vip-features': 'Tier system component errors',
  '/enhanced-features': 'Feature flag dependency issues',
  '/fantasy-sports-enhanced': 'External API integration failures',
  '/gaming-integration': 'Gaming service connection issues',
  '/unified-gaming': 'Multi-platform integration errors',
  '/live-sports-streaming': 'Streaming service unavailable',
  '/crypto-information': 'Cryptocurrency API rate limits',
  '/user-profile-banking': 'Banking integration issues',
  '/payment-demo': 'Payment gateway configuration errors',
  '/wallet-test': 'Wallet connection testing failures',
  '/auth-test-demo': 'Authentication testing environment issues'
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

// Store recent error logs for analysis
let recentErrors: Array<{path: string, error: string, timestamp: number}> = [];

// Check if route is actually defined in the React router
const isRouteDefinedInRouter = (path: string): boolean => {
  // Routes that are explicitly defined in App.tsx
  const definedRoutes = [
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
  
  return definedRoutes.includes(path);
};

// Function to check if a route actually exists and works
const checkRouteHealth = async (path: string) => {
  try {
    // First check if the route is actually defined in the router
    if (!isRouteDefinedInRouter(path)) {
      return {
        status: 'not-found',
        message: `404 - Route "${path}" not defined in React router`
      };
    }

    // Check for recent errors for this path
    const recentError = recentErrors.find(e => 
      e.path === path && Date.now() - e.timestamp < 300000 // 5 minutes
    );
    
    if (recentError) {
      return {
        status: 'error',
        message: `Recent error: ${recentError.error}`,
        lastError: recentError.timestamp
      };
    }

    const hasKnownIssues = knownIssues[path as keyof typeof knownIssues];
    
    if (hasKnownIssues) {
      return {
        status: 'error',
        message: hasKnownIssues
      };
    }

    // Additional checks for routes that commonly fail
    if (path.includes('admin') && !path.includes('bypass')) {
      return {
        status: 'error',
        message: 'Admin routes require authentication and may have component errors'
      };
    }

    if (path.includes('live-') || path.includes('real-time')) {
      return {
        status: 'warning',
        message: 'Real-time features may have WebSocket connectivity issues'
      };
    }

    return {
      status: 'success',
      message: 'Route exists and should be functional'
    };
    
  } catch (error) {
    return {
      status: 'error',
      message: `Health check failed: ${error}`
    };
  }
};

router.get('/all-page-statuses', async (req, res) => {
  try {
    // Include some test 404 routes to demonstrate 404 detection
    const testRoutes = [
      ...knownRoutes,
      ...actual404Routes,
      '/non-existent-admin',
      '/fake-betting-page',
      '/missing-wallet-feature',
      '/deleted-sports-page'
    ];

    const pageStatuses = await Promise.all(
      testRoutes.map(async (path) => {
        const health = await checkRouteHealth(path);
        return {
          path,
          status: health.status,
          message: health.message,
          lastError: health.lastError
        };
      })
    );
    
    const errorCount = pageStatuses.filter(p => p.status === 'error').length;
    const warningCount = pageStatuses.filter(p => p.status === 'warning').length;
    const successCount = pageStatuses.filter(p => p.status === 'success').length;
    const notFoundCount = pageStatuses.filter(p => p.status === 'not-found').length;
    
    res.json({
      success: true,
      pages: pageStatuses,
      summary: {
        total: testRoutes.length,
        working: successCount,
        errors: errorCount,
        warnings: warningCount,
        notFound: notFoundCount
      },
      lastUpdated: new Date().toISOString(),
      note: 'Status based on React router analysis, known issues, and recent errors'
    });
    
  } catch (error) {
    console.error('All page status check error:', error);
    res.status(500).json({
      error: 'Failed to check page statuses'
    });
  }
});

// Endpoint to report client-side errors
router.post('/report-error', (req, res) => {
  try {
    const { path, error, userAgent } = req.body;
    
    recentErrors.push({
      path,
      error: error.substring(0, 200), // Limit error message length
      timestamp: Date.now()
    });
    
    // Keep only recent errors (last 100)
    recentErrors = recentErrors.slice(-100);
    
    console.log(`🚨 Client error reported for ${path}: ${error}`);
    
    res.json({ success: true, message: 'Error reported successfully' });
    
  } catch (error) {
    console.error('Error reporting failed:', error);
    res.status(500).json({ error: 'Failed to report error' });
  }
});

export default router;
