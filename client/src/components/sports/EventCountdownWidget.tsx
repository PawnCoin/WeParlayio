import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Trophy, Users, Star, Flame, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SportEvent {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  startTime: string;
  sport: string;
  league: string;
  venue?: string;
  importance: 'low' | 'medium' | 'high' | 'championship';
  odds?: {
    home: number;
    away: number;
    draw?: number;
  };
  hypeScore?: number;
  trending?: boolean;
}

interface EventCountdownWidgetProps {
  event: SportEvent;
  size?: 'compact' | 'standard' | 'large';
  showOdds?: boolean;
  onBetClick?: (event: SportEvent) => void;
}

export default function EventCountdownWidget({ 
  event, 
  size = 'standard', 
  showOdds = true,
  onBetClick 
}: EventCountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isLive, setIsLive] = useState(false);
  const [hypeLevel, setHypeLevel] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventTime = new Date(event.startTime).getTime();
      const now = new Date().getTime();
      const difference = eventTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsLive(false);
      } else {
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate hype level based on event importance and trending status
    const calculateHype = () => {
      let score = event.hypeScore || 0;
      if (event.importance === 'championship') score += 40;
      else if (event.importance === 'high') score += 25;
      else if (event.importance === 'medium') score += 15;
      else score += 5;
      
      if (event.trending) score += 20;
      
      setHypeLevel(Math.min(100, score));
    };

    calculateTimeLeft();
    calculateHype();
    
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [event]);

  const getImportanceBadge = () => {
    const badges = {
      championship: { label: 'CHAMPIONSHIP', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', icon: Trophy },
      high: { label: 'MARQUEE', color: 'bg-gradient-to-r from-red-500 to-pink-500', icon: Star },
      medium: { label: 'FEATURED', color: 'bg-gradient-to-r from-blue-500 to-purple-500', icon: Target },
      low: { label: 'REGULAR', color: 'bg-gradient-to-r from-gray-400 to-gray-500', icon: Users }
    };
    
    const badge = badges[event.importance];
    const IconComponent = badge.icon;
    
    return (
      <Badge className={`${badge.color} text-white font-bold px-3 py-1 text-xs`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const getHypeIndicator = () => {
    if (hypeLevel >= 80) return { text: 'MASSIVE HYPE!', color: 'text-red-500', icon: Flame };
    if (hypeLevel >= 60) return { text: 'HIGH HYPE', color: 'text-orange-500', icon: Flame };
    if (hypeLevel >= 40) return { text: 'BUILDING HYPE', color: 'text-yellow-500', icon: Star };
    return { text: 'STEADY INTEREST', color: 'text-blue-500', icon: Target };
  };

  const formatTime = (value: number) => String(value).padStart(2, '0');

  const handleBetClick = () => {
    if (onBetClick) {
      onBetClick(event);
    } else {
      toast({
        title: "Bet Placement",
        description: `Ready to bet on ${event.homeTeam} vs ${event.awayTeam}!`,
      });
    }
  };

  const sizeClasses = {
    compact: 'p-3',
    standard: 'p-4',
    large: 'p-6'
  };

  const hype = getHypeIndicator();
  const HypeIcon = hype.icon;

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 ${sizeClasses[size]}`}>
      {/* Trending Indicator */}
      {event.trending && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white animate-pulse">
            <Flame className="h-3 w-3 mr-1" />
            TRENDING
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {getImportanceBadge()}
          <div className={`flex items-center gap-1 text-sm font-bold ${hype.color}`}>
            <HypeIcon className="h-4 w-4" />
            {hype.text}
          </div>
        </div>
        
        <CardTitle className="text-white text-lg">
          {event.league}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {event.homeTeamLogo && (
              <img src={event.homeTeamLogo} alt={event.homeTeam} className="w-8 h-8 rounded" />
            )}
            <span className="text-white font-semibold">{event.homeTeam}</span>
          </div>
          
          <div className="text-slate-400 font-bold text-lg">VS</div>
          
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">{event.awayTeam}</span>
            {event.awayTeamLogo && (
              <img src={event.awayTeamLogo} alt={event.awayTeam} className="w-8 h-8 rounded" />
            )}
          </div>
        </div>

        {/* Countdown or Live Indicator */}
        {isLive ? (
          <div className="text-center">
            <Badge className="bg-red-500 text-white animate-pulse px-4 py-2 text-lg font-bold">
              🔴 LIVE NOW
            </Badge>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>Game starts in:</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HRS' },
                { value: timeLeft.minutes, label: 'MIN' },
                { value: timeLeft.seconds, label: 'SEC' }
              ].map((unit, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-2">
                  <div className="text-2xl font-bold text-white">
                    {formatTime(unit.value)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.startTime).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          
          {event.venue && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.venue}</span>
            </div>
          )}
        </div>

        {/* Odds */}
        {showOdds && event.odds && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-slate-400 text-xs font-semibold mb-2">LIVE ODDS</div>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-white font-bold">{event.homeTeam}</div>
                <div className="text-green-400 font-bold">+{event.odds.home}</div>
              </div>
              
              {event.odds.draw && (
                <div className="text-center">
                  <div className="text-white font-bold">Draw</div>
                  <div className="text-green-400 font-bold">+{event.odds.draw}</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-white font-bold">{event.awayTeam}</div>
                <div className="text-green-400 font-bold">+{event.odds.away}</div>
              </div>
            </div>
          </div>
        )}

        {/* Hype Level Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Fan Interest</span>
            <span>{hypeLevel}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                hypeLevel >= 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                hypeLevel >= 60 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                hypeLevel >= 40 ? 'bg-gradient-to-r from-yellow-500 to-green-500' :
                'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${hypeLevel}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleBetClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Place Bet Now
        </Button>
      </CardContent>
    </Card>
  );
}