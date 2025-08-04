import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface VipGuardProps {
  children: React.ReactNode;
  requiredTier?: 'silver' | 'gold' | 'platinum';
  feature?: string;
}

export default function VipGuard({ 
  children, 
  requiredTier = 'silver',
  feature = 'this feature' 
}: VipGuardProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-300">
                Please log in to access {feature}.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="border-slate-600 text-slate-300"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ADMIN USERS ALWAYS HAVE FULL ACCESS - NO EXCEPTIONS
  const isAdminUser = user?.isAdmin === true || 
                     user?.role === 'admin' || 
                     user?.email === 'support@weparlay.io' ||
                     user?.email === 'admin@weparlay.io' ||
                     user?.email === 'weparlay@admin.com';

  console.log('VipGuard Debug:', {
    userIsAdmin: user?.isAdmin,
    userRole: user?.role,
    userEmail: user?.email,
    userTier: user?.tier,
    adminCheck: isAdminUser
  });

  // IMMEDIATE ADMIN ACCESS - NO QUESTIONS ASKED
  if (isAdminUser) {
    console.log('✅ Admin access granted, bypassing VIP guard');
    return <>{children}</>;
  }

  // Define tier hierarchy
  const tierHierarchy = {
    bronze: 0,
    silver: 1,
    gold: 2,
    platinum: 3
  };

  const userTierLevel = tierHierarchy[user.tier?.toLowerCase() as keyof typeof tierHierarchy] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier];

  // Check if user has required tier
  if (userTierLevel < requiredTierLevel) {
    const getTierColor = (tier: string) => {
      switch (tier) {
        case 'silver': return 'bg-slate-500 text-white';
        case 'gold': return 'bg-yellow-500 text-black';
        case 'platinum': return 'bg-purple-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    };

    const getTierIcon = (tier: string) => {
      switch (tier) {
        case 'gold':
        case 'platinum':
          return <Crown className="w-5 h-5" />;
        default:
          return <Sparkles className="w-5 h-5" />;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl">VIP Access Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-slate-300">
                  {feature} requires a 
                  <Badge className={`mx-2 ${getTierColor(requiredTier)}`}>
                    {getTierIcon(requiredTier)}
                    {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Tier
                  </Badge>
                  membership or higher.
                </p>
                <p className="text-sm text-slate-400">
                  Your current tier: 
                  <Badge className={`ml-2 ${getTierColor(user.tier || 'bronze')}`}>
                    {user.tier?.charAt(0).toUpperCase() + user.tier?.slice(1) || 'Bronze'}
                  </Badge>
                </p>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">
                  Upgrade Benefits:
                </h3>
                <ul className="text-sm text-slate-300 space-y-1 text-left">
                  <li>• Access to exclusive gaming features</li>
                  <li>• Advanced tournament betting</li>
                  <li>• Enhanced odds and statistics</li>
                  <li>• Priority customer support</li>
                  <li>• Exclusive VIP events and promotions</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/upgrade-tier')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="border-slate-600 text-slate-300"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User has sufficient tier access
  return <>{children}</>;
}