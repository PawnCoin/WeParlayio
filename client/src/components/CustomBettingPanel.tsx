import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Clock,
  DollarSign,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export const CustomBettingPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newBet, setNewBet] = useState({
    title: '',
    description: '',
    odds: '',
    expiry: '',
    minAmount: '',
    maxAmount: ''
  });

  const customBetTemplates = [
    {
      id: 1,
      title: "Player Will Score 30+ Points",
      category: "Basketball",
      odds: 2.5,
      participants: 12,
      pool: 1250
    },
    {
      id: 2,
      title: "Team Will Win by 10+ Points",
      category: "Football",
      odds: 3.2,
      participants: 8,
      pool: 890
    },
    {
      id: 3,
      title: "Game Goes to Overtime",
      category: "Hockey",
      odds: 4.1,
      participants: 15,
      pool: 2100
    }
  ];

  const createCustomBet = async () => {
    if (!newBet.title || !newBet.description || !newBet.odds) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/custom-betting/create', {
        title: newBet.title,
        description: newBet.description,
        odds: parseFloat(newBet.odds),
        expiry: newBet.expiry || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        minAmount: parseFloat(newBet.minAmount) || 5,
        maxAmount: parseFloat(newBet.maxAmount) || 1000
      });

      toast({
        title: "Custom Bet Created! 🎯",
        description: `"${newBet.title}" is now live for other users to join`,
      });

      // Reset form
      setNewBet({
        title: '',
        description: '',
        odds: '',
        expiry: '',
        minAmount: '',
        maxAmount: ''
      });
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinCustomBet = async (betId: number, amount: number) => {
    try {
      const response = await apiRequest('POST', `/api/custom-betting/join/${betId}`, {
        amount
      });

      toast({
        title: "Joined Custom Bet! ✨",
        description: `You've entered with $${amount}`,
      });
    } catch (error: any) {
      toast({
        title: "Join Failed",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Custom Bet */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-600" />
            Create Custom Bet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bet-title">Bet Title *</Label>
            <Input
              id="bet-title"
              placeholder="e.g., Player will score 25+ points tonight"
              value={newBet.title}
              onChange={(e) => setNewBet({...newBet, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bet-description">Description *</Label>
            <Textarea
              id="bet-description"
              placeholder="Provide details about your custom bet..."
              value={newBet.description}
              onChange={(e) => setNewBet({...newBet, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bet-odds">Odds *</Label>
              <Input
                id="bet-odds"
                type="number"
                placeholder="2.5"
                step="0.1"
                value={newBet.odds}
                onChange={(e) => setNewBet({...newBet, odds: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bet-expiry">Expires</Label>
              <Input
                id="bet-expiry"
                type="datetime-local"
                value={newBet.expiry}
                onChange={(e) => setNewBet({...newBet, expiry: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Min Bet ($)</Label>
              <Input
                id="min-amount"
                type="number"
                placeholder="5"
                value={newBet.minAmount}
                onChange={(e) => setNewBet({...newBet, minAmount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount">Max Bet ($)</Label>
              <Input
                id="max-amount"
                type="number"
                placeholder="1000"
                value={newBet.maxAmount}
                onChange={(e) => setNewBet({...newBet, maxAmount: e.target.value})}
              />
            </div>
          </div>

          <Button 
            onClick={createCustomBet}
            disabled={isCreating}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isCreating ? 'Creating...' : 'Create Custom Bet'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Custom Bets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Active Custom Bets
            <Badge variant="outline">{customBetTemplates.length} Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customBetTemplates.map((bet) => (
            <Card key={bet.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{bet.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {bet.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {bet.odds}x
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Odds
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-500" />
                      <span>{bet.participants} joined</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span>${bet.pool} pool</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-500" />
                      <span>2h left</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => joinCustomBet(bet.id, 25)}
                    >
                      Join $25
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => joinCustomBet(bet.id, 50)}
                    >
                      Join $50
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => joinCustomBet(bet.id, 100)}
                    >
                      Join $100
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Bet Builder */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-600" />
            Advanced Bet Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-xs">Prop Builder</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Parlay Builder</span>
            </Button>
          </div>
          
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Custom Event
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};