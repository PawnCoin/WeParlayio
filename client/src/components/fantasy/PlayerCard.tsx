
<line_number>1</line_number>
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AssetManager } from '@/lib/assetManager';

interface PlayerCardProps {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  sport: string;
  stats?: {
    points?: number;
    assists?: number;
    rebounds?: number;
    goals?: number;
    saves?: number;
  };
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerId,
  playerName,
  team,
  position,
  sport,
  stats = {}
}) => {
  const [playerImage, setPlayerImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayerImage = async () => {
      try {
        const imageUrl = await AssetManager.getESPNPlayerImage(playerId, sport);
        setPlayerImage(imageUrl);
      } catch (error) {
        console.warn('Failed to load player image:', error);
        setPlayerImage(`https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254`);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      loadPlayerImage();
    }
  }, [playerId, sport]);

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : (
              <img
                src={playerImage}
                alt={`${playerName} headshot`}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                onError={(e) => {
                  e.currentTarget.src = `https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254`;
                }}
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {playerName}
              </h3>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{position}</span>
              <span>•</span>
              <span>{team}</span>
            </div>

            {Object.keys(stats).length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {stats.points !== undefined && (
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{stats.points}</div>
                    <div className="text-muted-foreground">PTS</div>
                  </div>
                )}
                {stats.assists !== undefined && (
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{stats.assists}</div>
                    <div className="text-muted-foreground">AST</div>
                  </div>
                )}
                {stats.rebounds !== undefined && (
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{stats.rebounds}</div>
                    <div className="text-muted-foreground">REB</div>
                  </div>
                )}
                {stats.goals !== undefined && (
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{stats.goals}</div>
                    <div className="text-muted-foreground">G</div>
                  </div>
                )}
                {stats.saves !== undefined && (
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{stats.saves}</div>
                    <div className="text-muted-foreground">SV</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
