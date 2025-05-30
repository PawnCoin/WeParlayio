
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  Users, 
  Trophy, 
  Zap, 
  ArrowRightLeft,
  DollarSign,
  Star,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WeParlayCash: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: cashBalance } = useQuery({
    queryKey: ['/api/user/cash-balance'],
    enabled: isAuthenticated,
  });

  

  const handleEarnCash = async (method: string, amount: number) => {
    try {
      const response = await fetch('/api/users/earn-weparlay-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          reason: `Earned via ${method}` 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "WeParlay Cash Earned!",
          description: `You earned ${amount} WPC via ${method}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to earn WeParlay Cash",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Coins className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-4">Please log in to access WeParlay Cash</h2>
            <Button onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Coins className="h-12 w-12 text-blue-500 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WeParlay Cash Hub
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your virtual currency for risk-free betting, learning, and earning rewards on WeParlay
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">WeParlay Cash Balance</p>
                <p className="text-3xl font-bold">
                  {(cashBalance?.balance || user?.weplayTokenBalance || 10000).toLocaleString()} WPC
                </p>
              </div>
              <Coins className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Real Money Balance</p>
                <p className="text-2xl font-bold">${user?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Virtual Currency</p>
                <p className="text-2xl font-bold">Practice Only</p>
                <p className="text-xs text-gray-500">Cannot be converted to real money</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Earn WeParlay Cash */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Earn More WeParlay Cash
            </CardTitle>
            <CardDescription>
              Multiple ways to earn free WeParlay Cash
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleEarnCash('Daily Login', 100)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Daily Login Bonus - 100 WPC
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleEarnCash('Referral', 500)}
              >
                <Users className="h-4 w-4 mr-2" />
                Refer a Friend - 500 WPC
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleEarnCash('Social Share', 50)}
              >
                <Star className="h-4 w-4 mr-2" />
                Share on Social - 50 WPC
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits & Features */}
      <Card>
        <CardHeader>
          <CardTitle>WeParlay Cash Benefits</CardTitle>
          <CardDescription>What you can do with your virtual currency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold mb-1">Risk-Free Betting</h3>
              <p className="text-sm text-gray-600">Practice betting without losing real money</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-gold-500" />
              <h3 className="font-semibold mb-1">Learn Strategies</h3>
              <p className="text-sm text-gray-600">Master betting strategies before going live</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold mb-1">Track Performance</h3>
              <p className="text-sm text-gray-600">Monitor your betting skills and improve</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Gift className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold mb-1">Earn Rewards</h3>
              <p className="text-sm text-gray-600">Unlock achievements and bonus WPC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How WeParlay Cash Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge className="bg-blue-500">1</Badge>
              <div>
                <h4 className="font-semibold">Earn WeParlay Cash</h4>
                <p className="text-sm text-gray-600">Get free WPC through daily logins, referrals, and activities</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-blue-500">2</Badge>
              <div>
                <h4 className="font-semibold">Practice Betting</h4>
                <p className="text-sm text-gray-600">Use WPC to bet on real games and learn strategies</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-blue-500">3</Badge>
              <div>
                <h4 className="font-semibold">Build Your Skills</h4>
                <p className="text-sm text-gray-600">Track your performance and improve your betting accuracy</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge className="bg-blue-500">4</Badge>
              <div>
                <h4 className="font-semibold">Transition to Real Betting</h4>
                <p className="text-sm text-gray-600">Apply your learned skills to real money betting when ready</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeParlayCash;
