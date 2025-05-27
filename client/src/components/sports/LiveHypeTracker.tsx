import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Flame, Users, MessageCircle, Heart, Share2, Eye, Zap } from 'lucide-react';

interface HypeMetrics {
  eventId: number;
  eventName: string;
  currentHype: number;
  hypeChange: number;
  socialMentions: number;
  viewerCount: number;
  betVolume: number;
  trendingScore: number;
  buzzWords: string[];
  lastUpdate: string;
}

interface LiveHypeTrackerProps {
  eventId?: number;
  compact?: boolean;
}

export default function LiveHypeTracker({ eventId, compact = false }: LiveHypeTrackerProps) {
  const [hypeData, setHypeData] = useState<HypeMetrics[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sample live hype data - in production this would come from real social media APIs, betting volume, etc.
  const sampleHypeData: HypeMetrics[] = [
    {
      eventId: 1,
      eventName: 'Lakers vs Warriors',
      currentHype: 92,
      hypeChange: +15,
      socialMentions: 45600,
      viewerCount: 128000,
      betVolume: 2840000,
      trendingScore: 89,
      buzzWords: ['LEBRON', 'CURRY', 'PLAYOFF', 'RIVALRY'],
      lastUpdate: new Date().toISOString()
    },
    {
      eventId: 2,
      eventName: 'Chiefs vs Bills',
      currentHype: 98,
      hypeChange: +8,
      socialMentions: 78200,
      viewerCount: 245000,
      betVolume: 5600000,
      trendingScore: 95,
      buzzWords: ['MAHOMES', 'ALLEN', 'PLAYOFF', 'AFC'],
      lastUpdate: new Date().toISOString()
    },
    {
      eventId: 3,
      eventName: 'Man City vs Liverpool',
      currentHype: 85,
      hypeChange: +12,
      socialMentions: 38900,
      viewerCount: 89000,
      betVolume: 1900000,
      trendingScore: 78,
      buzzWords: ['HAALAND', 'SALAH', 'TITLE', 'DERBY'],
      lastUpdate: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Simulate real-time updates
    const updateHype = () => {
      setIsAnimating(true);
      setHypeData(prevData => {
        return sampleHypeData.map(event => ({
          ...event,
          currentHype: Math.min(100, Math.max(0, event.currentHype + (Math.random() - 0.5) * 10)),
          hypeChange: Math.floor((Math.random() - 0.5) * 30),
          socialMentions: event.socialMentions + Math.floor(Math.random() * 1000),
          viewerCount: event.viewerCount + Math.floor(Math.random() * 5000),
          betVolume: event.betVolume + Math.floor(Math.random() * 100000),
          lastUpdate: new Date().toISOString()
        }));
      });
      
      setTimeout(() => setIsAnimating(false), 500);
    };

    setHypeData(sampleHypeData);
    const interval = setInterval(updateHype, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getHypeLevel = (score: number) => {
    if (score >= 90) return { label: 'INSANE', color: 'text-red-500', bgColor: 'bg-red-500', icon: Flame };
    if (score >= 80) return { label: 'MASSIVE', color: 'text-orange-500', bgColor: 'bg-orange-500', icon: Zap };
    if (score >= 70) return { label: 'HIGH', color: 'text-yellow-500', bgColor: 'bg-yellow-500', icon: TrendingUp };
    if (score >= 50) return { label: 'BUILDING', color: 'text-blue-500', bgColor: 'bg-blue-500', icon: Users };
    return { label: 'STEADY', color: 'text-gray-500', bgColor: 'bg-gray-500', icon: Eye };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const displayData = eventId ? hypeData.filter(h => h.eventId === eventId) : hypeData;

  if (compact) {
    const event = displayData[0];
    if (!event) return null;

    const hypeLevel = getHypeLevel(event.currentHype);
    const HypeIcon = hypeLevel.icon;

    return (
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HypeIcon className={`h-5 w-5 ${hypeLevel.color}`} />
              <div>
                <div className="text-white font-bold text-sm">{event.eventName}</div>
                <div className={`text-xs font-semibold ${hypeLevel.color}`}>{hypeLevel.label} HYPE</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{event.currentHype}%</div>
              <div className={`text-xs font-semibold ${event.hypeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {event.hypeChange >= 0 ? '+' : ''}{event.hypeChange}%
              </div>
            </div>
          </div>
          
          <Progress 
            value={event.currentHype} 
            className={`mt-2 h-2 ${isAnimating ? 'animate-pulse' : ''}`}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
            Live Hype Tracker
            <Badge className="bg-green-500 text-white animate-pulse ml-auto">
              LIVE
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {displayData.map((event) => {
        const hypeLevel = getHypeLevel(event.currentHype);
        const HypeIcon = hypeLevel.icon;
        
        return (
          <Card key={event.eventId} className={`bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 ${isAnimating ? 'animate-pulse' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{event.eventName}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${hypeLevel.bgColor} text-white font-bold px-3 py-1`}>
                    <HypeIcon className="h-3 w-3 mr-1" />
                    {hypeLevel.label}
                  </Badge>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{event.currentHype}%</div>
                    <div className={`text-sm font-semibold ${event.hypeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {event.hypeChange >= 0 ? '↗' : '↘'} {Math.abs(event.hypeChange)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Hype Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Fan Excitement Level</span>
                  <span>{event.currentHype}%</span>
                </div>
                <Progress 
                  value={event.currentHype} 
                  className={`h-3 ${isAnimating ? 'animate-pulse' : ''}`}
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <MessageCircle className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatNumber(event.socialMentions)}</div>
                  <div className="text-xs text-gray-400">Social Mentions</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <Eye className="h-5 w-5 text-green-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{formatNumber(event.viewerCount)}</div>
                  <div className="text-xs text-gray-400">Live Viewers</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <TrendingUp className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">${formatNumber(event.betVolume)}</div>
                  <div className="text-xs text-gray-400">Bet Volume</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{event.trendingScore}</div>
                  <div className="text-xs text-gray-400">Trending Score</div>
                </div>
              </div>

              {/* Trending Buzz Words */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400 font-semibold">Trending Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {event.buzzWords.map((word, index) => (
                    <Badge 
                      key={index} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-pulse"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      #{word}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Last Update */}
              <div className="text-xs text-gray-500 text-center">
                Last updated: {new Date(event.lastUpdate).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Live Update Indicator */}
      <Card className="bg-green-900 border-green-700">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            <span className="text-sm font-medium">Real-time hype tracking active</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}