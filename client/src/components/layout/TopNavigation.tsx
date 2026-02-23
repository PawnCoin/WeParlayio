import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import weparlayLogo from '@assets/weparlaylogo5.png';
import { 
  Home, 
  BarChart2, 
  Trophy, 
  Target, 
  TrendingUp,
  Medal,
  Gamepad2,
  Settings,
  DollarSign,
  Users
} from 'lucide-react';

const navigationItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/odds', label: 'Live Odds', icon: BarChart2, badge: 'FREE' },
  { path: '/vip/king-engine', label: 'King Engine', icon: Target },
  { path: '/tournaments', label: 'Tournaments', icon: Trophy },
  { path: '/fantasy', label: 'Fantasy', icon: Medal },
  { path: '/gaming', label: 'Gaming', icon: Gamepad2 },
  { path: '/social-betting', label: 'Social', icon: Users },
  { path: '/betting-challenges', label: 'Challenges', icon: DollarSign },
  { path: '/admin', label: 'Admin', icon: Settings }
];

export function TopNavigation() {
  const [location] = useLocation();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src={weparlayLogo} 
                alt="WeParlay Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-primary">WeParlay</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center gap-2 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 rounded-md px-3 py-1.5"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs border border-gray-600/40 rounded-sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button - for smaller screens */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 rounded-md">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-border">
          <div className="grid grid-cols-4 gap-2 py-2">
            {navigationItems.slice(0, 8).map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-2 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 rounded-md"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs border border-gray-600/40 rounded-sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}