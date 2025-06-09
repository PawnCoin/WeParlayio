import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock } from 'lucide-react';

interface LiveStatsBarProps {
  totalEvents: number;
  activeSports: string[];
  lastUpdate: string;
}

const LiveStatsBar: React.FC<LiveStatsBarProps> = ({ totalEvents, activeSports, lastUpdate }) => {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-700 dark:text-green-300">
                {totalEvents} Live Events
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {activeSports.length} Sports Active
              </span>
            </div>
            
            <div className="flex gap-2">
              {activeSports.slice(0, 4).map((sport, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {sport}
                </Badge>
              ))}
              {activeSports.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{activeSports.length - 4} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveStatsBar;