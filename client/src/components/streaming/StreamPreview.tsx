import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, Crown, Timer, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface StreamPreviewProps {
  streamUrl: string;
  gameTitle: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  thumbnailUrl: string;
  userTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  onUpgradeClick: () => void;
  className?: string;
}

export default function StreamPreview({
  streamUrl,
  gameTitle,
  homeTeam,
  awayTeam,
  league,
  thumbnailUrl,
  userTier,
  onUpgradeClick,
  className
}: StreamPreviewProps) {
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewTimeLeft, setPreviewTimeLeft] = useState(30);
  const [hasUsedPreview, setHasUsedPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const canAccessFullStream = ['gold', 'platinum', 'diamond'].includes(userTier);
  const canUsePreview = ['bronze', 'silver'].includes(userTier) && !hasUsedPreview;

  useEffect(() => {
    if (isPreviewActive && previewTimeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setPreviewTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (previewTimeLeft === 0) {
      handlePreviewEnd();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPreviewActive, previewTimeLeft]);

  const startPreview = () => {
    if (!canUsePreview && !canAccessFullStream) {
      toast({
        title: "Preview Not Available",
        description: "You've already used your free preview for this session.",
        variant: "destructive",
      });
      return;
    }

    setIsPreviewActive(true);
    setPreviewTimeLeft(30);
    
    if (!canAccessFullStream) {
      setHasUsedPreview(true);
      toast({
        title: "30-Second Preview Started",
        description: "Enjoy your free preview! Upgrade for unlimited access.",
      });
    }
  };

  const handlePreviewEnd = () => {
    setIsPreviewActive(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    if (!canAccessFullStream) {
      toast({
        title: "Preview Ended",
        description: "Upgrade to Gold tier for unlimited streaming access.",
        action: (
          <Button size="sm" onClick={onUpgradeClick}>
            Upgrade Now
          </Button>
        ),
      });
    }
  };

  const getUpgradeMessage = () => {
    switch (userTier) {
      case 'bronze':
        return {
          tier: 'Gold',
          benefit: 'Unlimited streaming + advanced betting',
          color: 'from-yellow-500 to-orange-500'
        };
      case 'silver':
        return {
          tier: 'Gold',
          benefit: 'HD streaming + premium features',
          color: 'from-yellow-500 to-orange-500'
        };
      default:
        return {
          tier: 'Premium',
          benefit: 'Full access to all features',
          color: 'from-purple-500 to-pink-500'
        };
    }
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black overflow-hidden">
          {/* Thumbnail/Video Display */}
          {isPreviewActive ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={streamUrl}
              autoPlay
              muted
            />
          ) : (
            <img 
              src={thumbnailUrl} 
              alt={gameTitle}
              className="w-full h-full object-cover"
            />
          )}

          {/* Preview Timer Overlay */}
          {isPreviewActive && !canAccessFullStream && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-yellow-400" />
                    <span className="text-white text-sm font-medium">
                      Preview: {previewTimeLeft}s remaining
                    </span>
                  </div>
                  <Badge className="bg-yellow-500 text-black">FREE PREVIEW</Badge>
                </div>
                <Progress 
                  value={(previewTimeLeft / 30) * 100} 
                  className="h-2 bg-gray-700"
                />
              </div>
            </div>
          )}

          {/* Live Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-600 text-white animate-pulse">
              🔴 LIVE
            </Badge>
          </div>

          {/* Play Button / Upgrade Overlay */}
          {!isPreviewActive && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <AnimatePresence>
                {canAccessFullStream ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
                      onClick={startPreview}
                    >
                      <Play className="h-8 w-8 text-white ml-1" />
                    </Button>
                    <p className="text-white mt-2 font-medium">Watch Live</p>
                  </motion.div>
                ) : canUsePreview ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-sm mx-auto p-6"
                  >
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 mb-4"
                      onClick={startPreview}
                    >
                      <Play className="h-8 w-8 text-white ml-1" />
                    </Button>
                    <p className="text-white font-bold text-lg mb-2">
                      30-Second Free Preview
                    </p>
                    <p className="text-gray-300 text-sm mb-4">
                      Get a taste of live streaming before upgrading
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startPreview}
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Timer className="h-4 w-4 mr-2" />
                        Start Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={onUpgradeClick}
                        className={`flex-1 bg-gradient-to-r ${upgradeInfo.color} text-white border-0`}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-sm mx-auto p-6"
                  >
                    <div className={`rounded-full w-16 h-16 bg-gradient-to-br ${upgradeInfo.color} flex items-center justify-center mx-auto mb-4`}>
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">
                      {upgradeInfo.tier} Required
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {upgradeInfo.benefit}
                    </p>
                    <Button
                      size="lg"
                      onClick={onUpgradeClick}
                      className={`w-full bg-gradient-to-r ${upgradeInfo.color} text-white border-0`}
                    >
                      <Upgrade className="h-4 w-4 mr-2" />
                      Upgrade to {upgradeInfo.tier}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Game Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-bold text-lg">{gameTitle}</h3>
            <p className="text-gray-300 text-sm">{awayTeam} @ {homeTeam}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="border-white/30 text-white">
                {league}
              </Badge>
              {!canAccessFullStream && (
                <span className="text-yellow-400 text-xs font-medium">
                  {hasUsedPreview ? 'Preview used' : '30s preview available'}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}