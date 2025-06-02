import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Clock, Trophy, DollarSign, Users, AlertCircle } from "lucide-react";

interface LiveEvent {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'live' | 'upcoming' | 'completed';
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  currentScore?: {
    home: number;
    away: number;
  };
  period?: string;
  timeRemaining?: string;
}

interface BetData {
  eventId: string;
  betType: 'moneyline' | 'spread' | 'total' | 'custom';
  selection: string;
  odds: number;
  amount: number;
  currency: 'USD' | 'WeParlay Cash';
}

export const LiveEventsBetting: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [betData, setBetData] = useState<BetData>({
    eventId: '',
    betType: 'moneyline',
    selection: '',
    odds: 0,
    amount: 10,
    currency: 'USD'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Load live and upcoming events
  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/betting/live-events');
      setEvents(response.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast({
        title: "Error",
        description: "Failed to load live events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = (event: LiveEvent) => {
    setSelectedEvent(event);
    setBetData(prev => ({
      ...prev,
      eventId: event.id,
      selection: '',
      odds: 0
    }));
  };

  const handleSelectionChange = (selection: string) => {
    if (!selectedEvent) return;
    
    let odds = 0;
    switch (selection) {
      case selectedEvent.homeTeam:
        odds = selectedEvent.homeOdds;
        break;
      case selectedEvent.awayTeam:
        odds = selectedEvent.awayOdds;
        break;
      case 'Draw':
        odds = selectedEvent.drawOdds || 0;
        break;
    }
    
    setBetData(prev => ({
      ...prev,
      selection,
      odds
    }));
  };

  const calculatePayout = () => {
    if (betData.odds > 0) {
      return betData.amount * (betData.odds / 100);
    } else {
      return betData.amount * (100 / Math.abs(betData.odds));
    }
  };

  const placeBet = async () => {
    if (!selectedEvent || !betData.selection || betData.amount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please select an event, outcome, and valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPlacingBet(true);
      
      const betPayload = {
        eventId: selectedEvent.id,
        eventName: `${selectedEvent.homeTeam} vs ${selectedEvent.awayTeam}`,
        betType: betData.betType,
        selection: betData.selection,
        odds: betData.odds,
        amount: betData.amount,
        currency: betData.currency,
        potentialPayout: calculatePayout()
      };

      await apiRequest('POST', '/api/betting/place-bet', betPayload);
      
      toast({
        title: "Bet Placed Successfully",
        description: `Your bet of $${betData.amount} on ${betData.selection} has been placed`,
        variant: "default"
      });

      // Reset form
      setBetData({
        eventId: '',
        betType: 'moneyline',
        selection: '',
        odds: 0,
        amount: 10,
        currency: 'USD'
      });
      setSelectedEvent(null);
      
    } catch (error: any) {
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet",
        variant: "destructive"
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getEventStatus = (event: LiveEvent) => {
    switch (event.status) {
      case 'live':
        return <Badge variant="destructive">LIVE</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Live & Upcoming Events Betting
          </CardTitle>
          <CardDescription>
            Bet on live and upcoming sports events with real-time odds
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                No events available at this time
              </div>
            ) : (
              events.map((event) => (
                <Card 
                  key={event.id}
                  className={`cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleEventSelect(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.sport}</span>
                        {getEventStatus(event)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(event.startTime).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>{event.homeTeam}</span>
                        <span className="font-mono text-sm">{formatOdds(event.homeOdds)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{event.awayTeam}</span>
                        <span className="font-mono text-sm">{formatOdds(event.awayOdds)}</span>
                      </div>
                      {event.drawOdds && (
                        <div className="flex justify-between items-center">
                          <span>Draw</span>
                          <span className="font-mono text-sm">{formatOdds(event.drawOdds)}</span>
                        </div>
                      )}
                    </div>

                    {event.status === 'live' && event.currentScore && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Score: {event.homeTeam} {event.currentScore.home}</span>
                          <span>{event.awayTeam} {event.currentScore.away}</span>
                        </div>
                        {event.timeRemaining && (
                          <div className="text-center text-xs text-gray-500 mt-1">
                            {event.period} - {event.timeRemaining}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Betting Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Place Your Bet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedEvent ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2" />
                Select an event to place a bet
              </div>
            ) : (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">
                    {selectedEvent.homeTeam} vs {selectedEvent.awayTeam}
                  </div>
                  <div className="text-sm text-blue-700">
                    {selectedEvent.sport} • {getEventStatus(selectedEvent)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="selection">Your Pick</Label>
                    <Select value={betData.selection} onValueChange={handleSelectionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your selection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={selectedEvent.homeTeam}>
                          {selectedEvent.homeTeam} ({formatOdds(selectedEvent.homeOdds)})
                        </SelectItem>
                        <SelectItem value={selectedEvent.awayTeam}>
                          {selectedEvent.awayTeam} ({formatOdds(selectedEvent.awayOdds)})
                        </SelectItem>
                        {selectedEvent.drawOdds && (
                          <SelectItem value="Draw">
                            Draw ({formatOdds(selectedEvent.drawOdds)})
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="betType">Bet Type</Label>
                    <Select 
                      value={betData.betType} 
                      onValueChange={(value: any) => setBetData(prev => ({ ...prev, betType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moneyline">Moneyline (Win/Lose)</SelectItem>
                        <SelectItem value="spread">Point Spread</SelectItem>
                        <SelectItem value="total">Over/Under</SelectItem>
                        <SelectItem value="custom">Custom Bet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="amount">Bet Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        value={betData.amount}
                        onChange={(e) => setBetData(prev => ({ 
                          ...prev, 
                          amount: parseFloat(e.target.value) || 0 
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={betData.currency}
                        onValueChange={(value: any) => setBetData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="WeParlay Cash">WeParlay Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {betData.selection && betData.amount > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-800">
                        <div className="flex justify-between">
                          <span>Potential Payout:</span>
                          <span className="font-medium">
                            ${(calculatePayout() + betData.amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit:</span>
                          <span className="font-medium">
                            ${calculatePayout().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Button 
                    onClick={placeBet}
                    disabled={!betData.selection || betData.amount <= 0 || isPlacingBet}
                    className="w-full"
                  >
                    {isPlacingBet ? 'Placing Bet...' : `Place Bet - $${betData.amount}`}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveEventsBetting;