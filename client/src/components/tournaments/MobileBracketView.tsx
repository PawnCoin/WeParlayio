import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileBracketViewProps {
  tournamentId: number;
  bracketData: any;
  isLoading: boolean;
}

const MobileBracketView: React.FC<MobileBracketViewProps> = ({ tournamentId, bracketData, isLoading }) => {
  const { toast } = useToast();
  const [currentRound, setCurrentRound] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Handle mobile swipe gestures
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    // Swipe right (previous round)
    if (offset.x > 100 && currentRound > 0) {
      setSwipeDirection('right');
      setTimeout(() => {
        setCurrentRound(current => current - 1);
        setSwipeDirection(null);
      }, 200);
    }
    // Swipe left (next round)
    else if (offset.x < -100 && currentRound < (bracketData?.rounds.length || 0) - 1) {
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentRound(current => current + 1);
        setSwipeDirection(null);
      }, 200);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Threshold for swipe detection (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentRound < (bracketData?.rounds.length || 0) - 1) {
        // Swiped left - go to next round
        setCurrentRound(current => current + 1);
      } else if (diff < 0 && currentRound > 0) {
        // Swiped right - go to previous round
        setCurrentRound(current => current - 1);
      }
    }
    
    touchStartX.current = null;
  };

  const handleShareBracket = () => {
    toast({
      title: "Share Options",
      description: "Bracket sharing options displayed",
    });
  };

  if (isLoading || !bracketData) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-7 w-[120px]" />
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="h-[350px] relative overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentRoundData = bracketData.rounds[currentRound];

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{currentRoundData.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Swipe to navigate rounds ({currentRound + 1}/{bracketData.rounds.length})
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleShareBracket}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>

        <motion.div
          ref={containerRef}
          className="w-full overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{ 
            x: swipeDirection === 'left' ? -50 : swipeDirection === 'right' ? 50 : 0,
            opacity: swipeDirection ? 0.5 : 1 
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="py-2 space-y-4">
            {currentRoundData.matches.map((match: any) => (
              <motion.div
                key={match.id}
                className="tournament-bracket-item bg-white dark:bg-neutral-dark border border-gray-200 dark:border-gray-700 rounded-md p-3 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className={`w-6 h-6 ${match.team1.winner === true ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} rounded-full flex items-center justify-center text-xs mr-2`}>
                      {match.team1.seed || '-'}
                    </span>
                    <span className={`text-sm ${match.team1.winner === true ? 'font-medium' : ''}`}>
                      {match.team1.name}
                    </span>
                  </div>
                  <span className="font-bold text-sm">{match.team1.score !== null ? match.team1.score : '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`w-6 h-6 ${match.team2.winner === true ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} rounded-full flex items-center justify-center text-xs mr-2`}>
                      {match.team2.seed || '-'}
                    </span>
                    <span className={`text-sm ${match.team2.winner === true ? 'font-medium' : ''}`}>
                      {match.team2.name}
                    </span>
                  </div>
                  <span className="font-bold text-sm">{match.team2.score !== null ? match.team2.score : '-'}</span>
                </div>
                
                {/* Animated indicator for match status */}
                {match.status === 'live' && (
                  <div className="absolute top-2 right-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Round navigation indicators */}
        <div className="flex justify-center gap-1 mt-4">
          {bracketData.rounds.map((_, idx: number) => (
            <button
              key={idx}
              className={`h-2 rounded-full transition-all ${
                currentRound === idx 
                  ? 'w-6 bg-primary' 
                  : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
              onClick={() => setCurrentRound(idx)}
              aria-label={`Go to round ${idx + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileBracketView;