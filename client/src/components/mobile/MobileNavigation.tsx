import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useAuth } from '@/hooks/useAuth';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { 
  Home, 
  TrendingUp, 
  Trophy, 
  Tv, 
  User, 
  Menu,
  Wallet,
  Crown,
  GamepadIcon,
  BarChart3,
  Target,
  ShoppingBag,
  Star
} from 'lucide-react';

interface MobileNavProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { betSlip } = useBetSlip();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home', color: 'text-blue-400' },
    { path: '/custom-bets', icon: TrendingUp, label: 'Custom', color: 'text-green-400' },
    { path: '/live-betting', icon: Target, label: 'Live', color: 'text-red-400' },
    { path: '/tournaments', icon: Trophy, label: 'Tourney', color: 'text-purple-400' },
    ...(user?.tier && ['silver', 'gold', 'platinum', 'diamond'].includes(user.tier) ? 
      [{ path: '/live-tv', icon: Tv, label: 'Live TV', color: 'text-yellow-400' }] : []),
  ];

  const menuItems = [
    { path: '/my-bets', icon: BarChart3, label: 'My Bets', badge: null },
    { path: '/banking', icon: Wallet, label: 'Wallet', badge: null },
    { path: '/upgrade-tier', icon: Crown, label: 'Upgrade', badge: user?.tier === 'bronze' ? 'VIP' : null },
    { path: '/live-tv', icon: GamepadIcon, label: 'Watch Live', badge: null },
    { path: '/profile', icon: User, label: 'Profile', badge: null },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-50 ${className} lg:hidden`}>
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={`flex flex-col items-center h-auto py-2 px-3 relative ${
                  isActive(item.path) 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 mb-1 ${isActive(item.path) ? 'text-white' : item.color}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </Button>
            </Link>
          ))}
          
          {/* Hamburger Menu */}
          <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center h-auto py-2 px-3 text-gray-400 hover:text-white relative"
              >
                <Menu className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
                {betSlip?.items?.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                    {betSlip.items.length}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-gray-900 border-gray-800">
              <div className="p-4 pb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <Link key={item.path} href={item.path} onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full h-16 flex flex-col items-center gap-1 text-gray-300 border-gray-700 hover:bg-gray-800"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm">{item.label}</span>
                        {item.badge && (
                          <Badge className="text-xs bg-yellow-500 text-black">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
                
                {betSlip?.items?.length > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-white">Bet Slip</span>
                        <Badge className="bg-orange-500 text-black">
                          {betSlip.items.length}
                        </Badge>
                      </div>
                      <Link href="/bet-slip" onClick={() => setIsMenuOpen(false)}>
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {user && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.firstName?.[0] || user.username?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {user.firstName || user.username}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {user.tier?.charAt(0).toUpperCase() + user.tier?.slice(1) || 'Bronze'}
                          </Badge>
                          {user.isAdmin && (
                            <Badge className="text-xs bg-purple-500">
                              <Star className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>

      {/* Spacer for bottom navigation */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

export default MobileNavigation;
