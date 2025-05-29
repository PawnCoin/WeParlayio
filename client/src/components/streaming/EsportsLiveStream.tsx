import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Users, 
  MessageSquare,
  Heart,
  Share2,
  Settings,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComingSoon from '@/components/shared/ComingSoon';

interface EsportsMatch {
  id: string;
  title: string;
  team1: {
    name: string;
    logo: string;
    score: number;
  };
  team2: {
    name: string;
    logo: string;
    score: number;
  };
  game: string;
  tournament: string;
  viewers: number;
  status: 'live' | 'upcoming' | 'ended';
  streamUrl?: string;
}

interface EsportsLiveStreamProps {
  match?: EsportsMatch;
  showComingSoon?: boolean;
}

const EsportsLiveStream: React.FC<EsportsLiveStreamProps> = ({ 
  match,
  showComingSoon = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(match?.viewers || 0);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string}>>([]);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000));

  if (showComingSoon || !match) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <ComingSoon
          featureName="Live Esports Streaming"
          description="Watch live esports matches with integrated betting and real-time chat. Coming soon with partnerships from major streaming platforms!"
          timeline="Q2 2025"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative bg-black aspect-video">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold mb-2">{match.title}</h3>
              <p className="text-gray-400">{match.tournament}</p>
              
              {match.status === 'live' && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-4"
                >
                  <Badge variant="destructive" className="bg-red-500 animate-pulse">
                    🔴 LIVE
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EsportsLiveStream;