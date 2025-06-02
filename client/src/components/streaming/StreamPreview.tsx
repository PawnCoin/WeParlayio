import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, Users, Zap } from 'lucide-react';

interface StreamPreviewProps {
  stream: any;
  userTier: string;
  onUpgrade: () => void;
}

export function StreamPreview({ stream, userTier, onUpgrade }: StreamPreviewProps) {
  const [previewTimeLeft, setPreviewTimeLeft] = useState(30);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  
  const hasFullAccess = ['Gold', 'Platinum', 'Diamond'].includes(userTier);
  const hasPreviewAccess = ['Silver', 'Gold', 'Platinum', 'Diamond'].includes(userTier);

  useEffect(() => {
    if (isPreviewActive && previewTimeLeft > 0 && !hasFullAccess) {
      const timer = setInterval(() => {
        setPreviewTimeLeft(prev => {
          if (prev <= 1) {
            setIsPreviewActive(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPreviewActive, previewTimeLeft, hasFullAccess]);

  const startPreview = () => {
    if (hasPreviewAccess) {
      setIsPreviewActive(true);
      setPreviewTimeLeft(30);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-600';
      case 'Silver': return 'bg-gray-400';
      case 'Gold': return 'bg-yellow-500';
      case 'Platinum': return 'bg-blue-500';
      case 'Diamond': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>{stream.title}</span>
          <Badge className={`${getTierBadgeColor(userTier)} text-white`}>
            <Crown className="w-3 h-3 mr-1" />
            {userTier}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stream thumbnail with overlay */}
        <div className="relative">
          <img 
            src={stream.thumbnailUrl} 
            alt={stream.title}
            className="w-full h-48 object-cover rounded"
          />
          
          {/* Tier-based access overlay */}
          {!hasFullAccess && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded">
              <div className="text-center text-white">
                {!hasPreviewAccess ? (
                  <div>
                    <Crown className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
                    <h3 className="font-bold mb-1">Silver+ Required</h3>
                    <p className="text-sm text-gray-300 mb-3">Upgrade to preview streams</p>
                  </div>
                ) : isPreviewActive ? (
                  <div>
                    <Clock className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <h3 className="font-bold mb-1">Preview Active</h3>
                    <p className="text-sm text-gray-300">{previewTimeLeft}s remaining</p>
                  </div>
                ) : (
                  <div>
                    <Zap className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-bold mb-1">30-Second Preview</h3>
                    <p className="text-sm text-gray-300 mb-3">Available for {userTier} tier</p>
                  </div>
                )}
                
                {!isPreviewActive && hasPreviewAccess && !hasFullAccess && (
                  <Button 
                    onClick={startPreview}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Preview
                  </Button>
                )}
                
                {!hasFullAccess && (
                  <Button 
                    onClick={onUpgrade}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white ml-2"
                  >
                    Upgrade to Gold+
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stream details */}
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-sm">{stream.viewers?.toLocaleString() || '0'}</span>
            </div>
            <Badge variant="secondary" className="bg-red-600 text-white">
              {stream.status === 'live' ? 'LIVE' : 'SCHEDULED'}
            </Badge>
          </div>
          <div className="text-sm">
            {stream.league} • {stream.period || 'Pre-Game'}
          </div>
        </div>

        {/* Team scores if available */}
        {stream.homeTeam && stream.awayTeam && (
          <div className="bg-gray-800 rounded p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {stream.homeTeam.logo && (
                  <img src={stream.homeTeam.logo} alt={stream.homeTeam.name} className="w-6 h-6" />
                )}
                <span className="text-white">{stream.homeTeam.name}</span>
              </div>
              <span className="text-white font-bold">{stream.homeTeam.score || 0}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-2">
                {stream.awayTeam.logo && (
                  <img src={stream.awayTeam.logo} alt={stream.awayTeam.name} className="w-6 h-6" />
                )}
                <span className="text-white">{stream.awayTeam.name}</span>
              </div>
              <span className="text-white font-bold">{stream.awayTeam.score || 0}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}