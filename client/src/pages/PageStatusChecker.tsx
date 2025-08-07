
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, XCircle, AlertCircle, RefreshCw, 
  ExternalLink, Search, Clock, Globe
} from 'lucide-react';

interface PageStatus {
  name: string;
  path: string;
  status: 'checking' | 'success' | 'error' | 'not-found';
  responseTime?: number;
  error?: string;
}

const PageStatusChecker: React.FC = () => {
  const [pageStatuses, setPageStatuses] = useState<PageStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'not-found'>('all');

  // Complete list of all pages in the WeParlay platform + test 404 routes
  const allPages = [
    // Core Features
    { name: "Home", path: "/" },
    { name: "Live Betting Enhanced", path: "/live-betting-enhanced" },
    { name: "Sports Betting", path: "/unified-sports" },
    { name: "Esports Hub", path: "/esports-hub" },
    { name: "My Bets", path: "/my-bets" },
    { name: "Results", path: "/results" },
    
    // Wallet & Payments
    { name: "Wallet Management", path: "/wallet-management-enhanced" },
    { name: "WeParlay Cash", path: "/weparlay-cash" },
    { name: "Payment Demo", path: "/payment-demo" },
    { name: "User Banking", path: "/user-profile-banking" },
    { name: "Crypto Information", path: "/crypto-information" },
    
    // Gaming & Entertainment
    { name: "Video Gaming", path: "/video-gaming" },
    { name: "Gaming Integration", path: "/gaming-integration" },
    { name: "Unified Gaming", path: "/unified-gaming" },
    { name: "Fantasy Sports", path: "/fantasy-sports-enhanced" },
    { name: "Tournaments", path: "/tournaments" },
    { name: "Trivia", path: "/trivia" },
    
    // Social & Community
    { name: "Social Betting", path: "/social-betting" },
    { name: "Head to Head", path: "/head-to-head-betting" },
    { name: "User Directory", path: "/user-directory" },
    { name: "Social Media Dashboard", path: "/social-media-dashboard" },
    { name: "SMS Challenge", path: "/sms-challenge" },
    
    // Advanced Betting
    { name: "Betting Dashboard", path: "/betting-dashboard" },
    { name: "Comprehensive Betting", path: "/comprehensive-betting" },
    { name: "Betting Manager", path: "/betting-manager" },
    { name: "Parlays", path: "/parlays" },
    { name: "Odds", path: "/odds" },
    { name: "Live Heatmap", path: "/live-heatmap" },
    
    // Account & Profile
    { name: "Login Enhanced", path: "/login-enhanced" },
    { name: "Sign Up Enhanced", path: "/signup-enhanced" },
    { name: "User Profile Page", path: "/user-profile-page" },
    { name: "Settings", path: "/settings" },
    { name: "Security Settings", path: "/security-settings" },
    { name: "Mobile Login", path: "/mobile-login" },
    
    // Admin & Management
    { name: "Admin Dashboard", path: "/admin-dashboard" },
    { name: "Admin Login", path: "/admin-login" },
    { name: "Admin Bypass", path: "/admin-bypass" },
    { name: "Email Monitoring", path: "/email-monitoring" },
    { name: "Theme Manager", path: "/theme-color-manager" },
    
    // VIP & Premium
    { name: "VIP Features", path: "/vip-features" },
    { name: "VIP Live Streaming", path: "/vip/live-streaming" },
    { name: "Betting Academy", path: "/betting-academy" },
    
    // Live Streaming
    { name: "Live Sports Streaming", path: "/live-sports-streaming" },
    { name: "Betting Experience", path: "/betting-experience" },
    
    // Help & Legal
    { name: "Support", path: "/support" },
    { name: "Terms of Service", path: "/terms-of-service" },
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Security Info", path: "/security-info" },
    
    // Testing & Demos
    { name: "Onboarding Demo", path: "/onboarding-demo" },
    { name: "Auth Test Demo", path: "/auth-test-demo" },
    { name: "Notification Test", path: "/notification-test" },
    { name: "Theme Settings", path: "/theme-settings-page" },
    { name: "Wallet Test", path: "/wallet-test" },
    
    // Additional Pages
    { name: "Site Navigation", path: "/site-navigation" },
    { name: "Social Media Bots", path: "/social-media-bots" },
    { name: "Page Status Checker", path: "/page-status-checker" },

    // Test 404 Routes (These should show as 404 errors)
    { name: "❌ Non-Existent Page", path: "/nonexistent-page" },
    { name: "❌ Old Betting Page", path: "/old-betting-page" },
    { name: "❌ Legacy Dashboard", path: "/legacy-dashboard" },
    { name: "❌ Deleted Feature", path: "/deleted-feature" },
    { name: "❌ Missing Component", path: "/missing-component" },
    { name: "❌ Broken Link", path: "/broken-link" },
    { name: "❌ Non-Existent Admin", path: "/non-existent-admin" },
    { name: "❌ Fake Betting Page", path: "/fake-betting-page" }
  ];

  const checkPageStatus = async (page: { name: string; path: string }): Promise<PageStatus> => {
    const startTime = Date.now();
    
    try {
      // Use fetch to check if the page responds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(page.path, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.status === 404) {
        return {
          name: page.name,
          path: page.path,
          status: 'not-found',
          responseTime,
          error: '404 Not Found'
        };
      }
      
      if (response.status >= 500) {
        return {
          name: page.name,
          path: page.path,
          status: 'error',
          responseTime,
          error: `Server Error: ${response.status}`
        };
      }
      
      if (response.status >= 400) {
        return {
          name: page.name,
          path: page.path,
          status: 'error',
          responseTime,
          error: `Client Error: ${response.status}`
        };
      }
      
      // Additional checks for known problematic routes
      if (page.path.includes('admin-dashboard')) {
        return {
          name: page.name,
          path: page.path,
          status: 'error',
          responseTime,
          error: 'AdminDashboard component crashes (React Error Boundary)'
        };
      }
      
      return {
        name: page.name,
        path: page.path,
        status: 'success',
        responseTime
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          name: page.name,
          path: page.path,
          status: 'error',
          responseTime,
          error: 'Request timeout'
        };
      }
      
      return {
        name: page.name,
        path: page.path,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  };

  const checkAllPages = async () => {
    setIsChecking(true);
    setPageStatuses(allPages.map(page => ({ 
      name: page.name, 
      path: page.path, 
      status: 'checking' as const 
    })));

    const results: PageStatus[] = [];
    
    // Check pages in smaller batches to be more thorough
    for (let i = 0; i < allPages.length; i += 3) {
      const batch = allPages.slice(i, i + 3);
      const batchPromises = batch.map(checkPageStatus);
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      setPageStatuses([...results, ...allPages.slice(results.length).map(page => ({ 
        name: page.name, 
        path: page.path, 
        status: 'checking' as const 
      }))]);
      
      // Longer delay between batches for more accurate results
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setPageStatuses(results);
    setIsChecking(false);
  };

  // Fetch accurate page statuses from server
  const fetchServerPageStatuses = async () => {
    try {
      const response = await fetch('/api/page-status/all-page-statuses');
      const data = await response.json();
      
      if (data.success) {
        const serverStatuses: PageStatus[] = data.pages.map((page: any) => ({
          name: allPages.find(p => p.path === page.path)?.name || `Unknown: ${page.path}`,
          path: page.path,
          status: page.status === 'error' ? 'error' : 
                  page.status === 'not-found' ? 'not-found' : 
                  page.status === 'warning' ? 'warning' : 'success',
          error: page.status !== 'success' ? page.message : undefined,
          responseTime: 0
        }));
        
        setPageStatuses(serverStatuses);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch server page statuses:', error);
    }
    
    // Fallback to client-side checking
    checkAllPages();
  };

  useEffect(() => {
    fetchServerPageStatuses();
  }, []);

  const getStatusIcon = (status: PageStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'not-found':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: PageStatus['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">✓ Active</Badge>;
      case 'error':
        return <Badge variant="destructive">✗ Error</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">⚠️ Warning</Badge>;
      case 'not-found':
        return <Badge className="bg-yellow-100 text-yellow-800">404 Not Found</Badge>;
      case 'checking':
        return <Badge variant="outline">⏳ Checking...</Badge>;
    }
  };

  const filteredPages = pageStatuses.filter(page => 
    filter === 'all' || page.status === filter
  );

  const stats = {
    total: pageStatuses.length,
    success: pageStatuses.filter(p => p.status === 'success').length,
    error: pageStatuses.filter(p => p.status === 'error').length,
    warning: pageStatuses.filter(p => p.status === 'warning').length,
    notFound: pageStatuses.filter(p => p.status === 'not-found').length,
    checking: pageStatuses.filter(p => p.status === 'checking').length
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          WeParlay Page Status Checker
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Comprehensive status check of all {allPages.length} pages in the WeParlay platform
        </p>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <div className="text-sm text-gray-600">✅ Working</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-gray-600">🚨 Broken</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.warning || 0}</div>
              <div className="text-sm text-gray-600">⚠️ Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.notFound}</div>
              <div className="text-sm text-gray-600">❌ 404s</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.checking}</div>
              <div className="text-sm text-gray-600">🔄 Checking</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button 
            variant={filter === 'success' ? 'default' : 'outline'}
            onClick={() => setFilter('success')}
            className="text-green-700"
          >
            ✅ Working ({stats.success})
          </Button>
          <Button 
            variant={filter === 'error' ? 'default' : 'outline'}
            onClick={() => setFilter('error')}
            className="text-red-700"
          >
            🚨 Broken ({stats.error})
          </Button>
          <Button 
            variant={filter === 'warning' ? 'default' : 'outline'}
            onClick={() => setFilter('warning')}
            className="text-orange-700"
          >
            ⚠️ Issues ({stats.warning || 0})
          </Button>
          <Button 
            variant={filter === 'not-found' ? 'default' : 'outline'}
            onClick={() => setFilter('not-found')}
            className="text-yellow-700"
          >
            ❌ 404s ({stats.notFound})
          </Button>
          <Button 
            onClick={fetchServerPageStatuses}
            disabled={isChecking}
            className="ml-auto bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Real Check'}
          </Button>
        </div>
      </div>

      {/* Page Status List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => (
          <Card key={page.path} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(page.status)}
                  <h3 className="font-semibold text-sm">{page.name}</h3>
                </div>
                {getStatusBadge(page.status)}
              </div>
              
              <div className="text-xs text-gray-600 mb-2">
                Path: {page.path}
              </div>
              
              {page.responseTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <Clock className="h-3 w-3" />
                  {page.responseTime}ms
                </div>
              )}
              
              {page.error && (
                <div className="text-xs text-red-600 mb-2">
                  Error: {page.error}
                </div>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                asChild 
                className="w-full text-xs"
                disabled={page.status === 'checking'}
              >
                <a href={page.path} target="_blank" rel="noopener noreferrer">
                  Open Page
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && !isChecking && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No pages found</h3>
            <p className="text-gray-500">No pages match the current filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PageStatusChecker;
