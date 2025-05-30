
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, User, Wallet, Gamepad2, TrendingUp, 
  Settings, Shield, Trophy, MessageSquare, CreditCard,
  Search, ExternalLink, Zap, Smartphone, Crown,
  BarChart3, Users, Calendar, Gamepad, Monitor
} from 'lucide-react';

const SiteNavigation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Comprehensive page listings organized by category
  const pageCategories = {
    core: {
      title: "Core Features",
      icon: <Home className="h-5 w-5" />,
      pages: [
        { name: "Home", path: "/", description: "Main landing page", status: "live" },
        { name: "Live Betting", path: "/live-betting-enhanced", description: "Real-time betting with live odds", status: "live" },
        { name: "Sports Betting", path: "/unified-sports", description: "All sports betting in one place", status: "live" },
        { name: "Esports Hub", path: "/esports-hub", description: "Esports betting and streaming", status: "live" },
        { name: "My Bets", path: "/my-bets", description: "Track your betting history", status: "live" },
        { name: "Results", path: "/results", description: "View betting results and payouts", status: "live" }
      ]
    },
    wallet: {
      title: "Wallet & Payments",
      icon: <Wallet className="h-5 w-5" />,
      pages: [
        { name: "Wallet Management", path: "/wallet-management-enhanced", description: "Comprehensive wallet management", status: "live" },
        { name: "WeParlay Cash", path: "/weparlay-cash", description: "Virtual currency system", status: "live" },
        { name: "Payment Demo", path: "/payment-demo", description: "Payment gateway testing", status: "demo" },
        { name: "User Banking", path: "/user-profile-banking", description: "Banking and financial tools", status: "live" },
        { name: "Crypto Information", path: "/crypto-information", description: "Cryptocurrency guides", status: "live" }
      ]
    },
    gaming: {
      title: "Gaming & Entertainment",
      icon: <Gamepad2 className="h-5 w-5" />,
      pages: [
        { name: "Video Gaming", path: "/video-gaming", description: "Video game betting", status: "live" },
        { name: "Gaming Integration", path: "/gaming-integration", description: "Cross-platform gaming", status: "live" },
        { name: "Unified Gaming", path: "/unified-gaming", description: "All gaming in one hub", status: "live" },
        { name: "Fantasy Sports", path: "/fantasy-sports-enhanced", description: "Fantasy sports platform", status: "live" },
        { name: "Tournaments", path: "/tournaments", description: "Tournament brackets and betting", status: "live" },
        { name: "Trivia", path: "/trivia", description: "Sports trivia games", status: "live" }
      ]
    },
    social: {
      title: "Social & Community",
      icon: <Users className="h-5 w-5" />,
      pages: [
        { name: "Social Betting", path: "/social-betting", description: "Social features and challenges", status: "live" },
        { name: "Head to Head", path: "/head-to-head-betting", description: "Challenge other users", status: "live" },
        { name: "User Directory", path: "/user-directory", description: "Find and connect with users", status: "live" },
        { name: "Social Media Dashboard", path: "/social-media-dashboard", description: "Social media integration", status: "live" },
        { name: "SMS Challenge", path: "/sms-challenge", description: "SMS-based betting challenges", status: "live" }
      ]
    },
    betting: {
      title: "Advanced Betting",
      icon: <TrendingUp className="h-5 w-5" />,
      pages: [
        { name: "Betting Dashboard", path: "/betting-dashboard", description: "Advanced betting analytics", status: "live" },
        { name: "Comprehensive Betting", path: "/comprehensive-betting", description: "All betting options", status: "live" },
        { name: "Betting Manager", path: "/betting-manager", description: "Manage betting strategies", status: "live" },
        { name: "Parlays", path: "/parlays", description: "Multi-bet parlays", status: "live" },
        { name: "Odds", path: "/odds", description: "Live odds comparison", status: "live" },
        { name: "Live Heatmap", path: "/live-heatmap", description: "Betting activity heatmap", status: "live" }
      ]
    },
    account: {
      title: "Account & Profile",
      icon: <User className="h-5 w-5" />,
      pages: [
        { name: "Login", path: "/login-enhanced", description: "Enhanced login system", status: "live" },
        { name: "Sign Up", path: "/signup-enhanced", description: "User registration", status: "live" },
        { name: "User Profile", path: "/user-profile-page", description: "Profile management", status: "live" },
        { name: "Settings", path: "/settings", description: "Account settings", status: "live" },
        { name: "Security Settings", path: "/security-settings", description: "Security and privacy", status: "live" },
        { name: "Mobile Login", path: "/mobile-login", description: "Mobile-optimized login", status: "live" }
      ]
    },
    admin: {
      title: "Admin & Management",
      icon: <Shield className="h-5 w-5" />,
      pages: [
        { name: "Admin Dashboard", path: "/admin-dashboard", description: "Admin control panel", status: "admin" },
        { name: "Admin Login", path: "/admin-login", description: "Admin authentication", status: "admin" },
        { name: "Admin Bypass", path: "/admin-bypass", description: "Emergency admin access", status: "admin" },
        { name: "Email Monitoring", path: "/email-monitoring", description: "Email system monitoring", status: "admin" },
        { name: "Theme Manager", path: "/theme-color-manager", description: "Site theme management", status: "admin" }
      ]
    },
    vip: {
      title: "VIP & Premium",
      icon: <Crown className="h-5 w-5" />,
      pages: [
        { name: "VIP Features", path: "/vip-features", description: "Premium user features", status: "premium" },
        { name: "Enhanced Features", path: "/enhanced-features", description: "Advanced platform features", status: "premium" },
        { name: "Betting Academy", path: "/betting-academy", description: "Learn advanced betting", status: "live" }
      ]
    },
    streaming: {
      title: "Live Streaming",
      icon: <Monitor className="h-5 w-5" />,
      pages: [
        { name: "Live Sports Streaming", path: "/live-sports-streaming", description: "Watch live sports", status: "live" },
        { name: "Betting Experience", path: "/betting-experience", description: "Immersive betting experience", status: "live" }
      ]
    },
    support: {
      title: "Help & Legal",
      icon: <MessageSquare className="h-5 w-5" />,
      pages: [
        { name: "Support", path: "/support", description: "Customer support", status: "live" },
        { name: "Terms of Service", path: "/terms-of-service", description: "Legal terms", status: "live" },
        { name: "Privacy Policy", path: "/privacy-policy", description: "Privacy information", status: "live" },
        { name: "Security Info", path: "/security-info", description: "Security details", status: "live" }
      ]
    },
    testing: {
      title: "Testing & Demos",
      icon: <Zap className="h-5 w-5" />,
      pages: [
        { name: "Onboarding Demo", path: "/onboarding-demo", description: "User onboarding flow", status: "demo" },
        { name: "Auth Test Demo", path: "/auth-test-demo", description: "Authentication testing", status: "demo" },
        { name: "Notification Test", path: "/notification-test", description: "Push notification testing", status: "demo" },
        { name: "Theme Settings", path: "/theme-settings-page", description: "Theme customization", status: "demo" },
        { name: "Wallet Test", path: "/wallet-test", description: "Wallet functionality testing", status: "demo" }
      ]
    }
  };

  // Filter pages based on search
  const filteredCategories = Object.entries(pageCategories).reduce((acc, [key, category]) => {
    const filteredPages = category.pages.filter(page => 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredPages.length > 0) {
      acc[key] = { ...category, pages: filteredPages };
    }
    return acc;
  }, {} as typeof pageCategories);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800 border-green-200';
      case 'demo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'premium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPages = Object.values(pageCategories).reduce((sum, category) => sum + category.pages.length, 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Home className="h-8 w-8 text-primary" />
          WeParlay Site Navigation
        </h1>
        <p className="text-muted-foreground text-lg mb-4">
          Complete directory of all {totalPages} pages in the WeParlay platform. Click any link to navigate directly to that page.
        </p>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="gaming">Gaming</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="all">All Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(pageCategories).map(([key, category]) => (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    {category.pages.length} pages available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.pages.slice(0, 3).map((page) => (
                      <div key={page.path} className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-auto p-1 justify-start"
                        >
                          <a href={page.path} target="_blank" rel="noopener noreferrer">
                            {page.name}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                        <Badge variant="outline" className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
                      </div>
                    ))}
                    {category.pages.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{category.pages.length - 3} more pages
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual category tabs */}
        {Object.entries(filteredCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon}
                  {category.title}
                </CardTitle>
                <CardDescription>
                  {category.pages.length} pages in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.pages.map((page) => (
                    <Card key={page.path} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{page.name}</h3>
                          <Badge variant="outline" className={getStatusColor(page.status)}>
                            {page.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {page.description}
                        </p>
                        <Button asChild className="w-full">
                          <a href={page.path} target="_blank" rel="noopener noreferrer">
                            Open Page
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* All pages tab */}
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Pages ({totalPages})</CardTitle>
              <CardDescription>
                Complete alphabetical listing of all pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {Object.values(filteredCategories)
                  .flatMap(category => category.pages)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((page) => (
                    <Button
                      key={page.path}
                      variant="outline"
                      size="sm"
                      asChild
                      className="justify-between h-auto p-2"
                    >
                      <a href={page.path} target="_blank" rel="noopener noreferrer">
                        <span className="truncate">{page.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {page.status}
                          </Badge>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </a>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteNavigation;
