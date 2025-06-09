import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SportData {
  name: string;
  count: number;
  percentage: number;
}

interface SportBreakdownProps {
  sportsData: SportData[];
}

const SportBreakdown: React.FC<SportBreakdownProps> = ({ sportsData }) => {
  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      'NFL': '🏈',
      'NBA': '🏀',
      'MLB': '⚾',
      'NHL': '🏒',
      'Soccer': '⚽',
      'WNBA': '🏀'
    };
    return icons[sport] || '🏆';
  };

  const getSportColor = (sport: string) => {
    const colors: { [key: string]: string } = {
      'NFL': 'bg-amber-500',
      'NBA': 'bg-orange-500',
      'MLB': 'bg-blue-500',
      'NHL': 'bg-cyan-500',
      'Soccer': 'bg-green-500',
      'WNBA': 'bg-purple-500'
    };
    return colors[sport] || 'bg-gray-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Live Sports Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sportsData.map((sport, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getSportIcon(sport.name)}</span>
                <div>
                  <span className="font-medium">{sport.name}</span>
                  <div className="text-sm text-gray-500">{sport.count} live events</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-20">
                  <Progress 
                    value={sport.percentage} 
                    className="h-2"
                  />
                </div>
                <Badge variant="outline" className="min-w-[3rem]">
                  {sport.percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SportBreakdown;