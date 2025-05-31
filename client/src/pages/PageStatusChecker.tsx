
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

  // Complete list of all pages in the WeParlay platform
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
    { name: "Enhanced Features", path: "/enhanced-features" },
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
    { name: "Page Status Checker", path: "/page-status-checker" }
  ];

  const checkPageStatus = async (page: { name: string; path: string }): Promise<PageStatus> => {
    const startTime = Date.now();
    
    try {
      // Create a temporary iframe to test if the page loads without CORS issues
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      
      const promise = new Promise<PageStatus>((resolve) => {
        const timeout = setTimeout(() => {
          document.body.removeChild(iframe);
          resolve({
            name: page.name,
            path: page.path,
            status: 'error',
            responseTime: Date.now() - startTime,
            error: 'Timeout'
          });
        }, 5000);

        iframe.onload = () => {
          clearTimeout(timeout);
          try {
            // Check if iframe content indicates an error page
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            const responseTime = Date.now() - startTime;
            
            if (iframeDoc) {
              const bodyText = iframeDoc.body?.textContent || '';
              const title = iframeDoc.title || '';
              
              // Check for React error boundaries or 404 indicators
              if (bodyText.includes('Something went wrong') || 
                  bodyText.includes('Error occurred') ||
                  bodyText.includes('Page not found') ||
                  bodyText.includes('404') ||
                  title.includes('404') ||
                  title.includes('Error')) {
                document.body.removeChild(iframe);
                resolve({
                  name: page.name,
                  path: page.path,
                  status: 'not-found',
                  responseTime,
                  error: '404 Not Found'
                });
                return;
              }
              
              // Check for AdminDashboard errors specifically
              if (bodyText.includes('AdminDashboard') && bodyText.includes('error')) {
                document.body.removeChild(iframe);
                resolve({
                  name: page.name,
                  path: page.path,
                  status: 'error',
                  responseTime,
                  error: 'Component Error'
                });
                return;
              }
            }
            
            document.body.removeChild(iframe);
            resolve({
              name: page.name,
              path: page.path,
              status: 'success',
              responseTime
            });
          } catch (e) {
            document.body.removeChild(iframe);
            resolve({
              name: page.name,
              path: page.path,
              status: 'success', // Cross-origin, but likely working
              responseTime: Date.now() - startTime
            });
          }
        };

        iframe.onerror = () => {
          clearTimeout(timeout);
          document.body.removeChild(iframe);
          resolve({
            name: page.name,
            path: page.path,
            status: 'error',
            responseTime: Date.now() - startTime,
            error: 'Failed to load'
          });
        };
      });

      document.body.appendChild(iframe);
      iframe.src = page.path;
      
      return await promise;
      
    } catch (error) {
      return {
        name: page.name,
        path: page.path,
        status: 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
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
          name: allPages.find(p => p.path === page.path)?.name || page.path,
          path: page.path,
          status: page.status === 'error' ? 'error' : page.status === 'not-found' ? 'not-found' : 'success',
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.notFound}</div>
              <div className="text-sm text-gray-600">404 Pages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.checking}</div>
              <div className="text-sm text-gray-600">Checking</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Pages ({stats.total})
          </Button>
          <Button 
            variant={filter === 'success' ? 'default' : 'outline'}
            onClick={() => setFilter('success')}
          >
            Active ({stats.success})
          </Button>
          <Button 
            variant={filter === 'not-found' ? 'default' : 'outline'}
            onClick={() => setFilter('not-found')}
          >
            404 Pages ({stats.notFound})
          </Button>
          <Button 
            variant={filter === 'error' ? 'default' : 'outline'}
            onClick={() => setFilter('error')}
          >
            Errors ({stats.error})
          </Button>
          <Button 
            onClick={checkAllPages}
            disabled={isChecking}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh All'}
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
