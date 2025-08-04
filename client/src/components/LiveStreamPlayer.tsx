// LiveStreamPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Users, MessageCircle, Star, Crown, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveStreamPlayerProps {
  streamUrl?: string;
  gameTitle: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  viewerCount?: number;
  isLive?: boolean;
  onChatToggle?: () => void;
  className?: string;
  eventId?: string;
  userTier?: string;
  previewMode?: boolean;
  previewDuration?: number;
  quality?: string;
  onUpgradeClick?: () => void;
}

export default function LiveStreamPlayer({
  streamUrl,
  gameTitle,
  homeTeam,
  awayTeam,
  league,
  viewerCount = 0,
  isLive = true,
  onChatToggle,
  className,
  eventId,
  userTier = 'bronze',
  previewMode = false,
  previewDuration = 30,
  quality = 'SD',
  onUpgradeClick
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [previewTimeLeft, setPreviewTimeLeft] = useState(previewDuration);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const previewKey = `preview_${eventId}`;

  useEffect(() => {
    if (previewMode && eventId) {
      const savedTime = localStorage.getItem(previewKey);
      if (savedTime) {
        setPreviewTimeLeft(Number(savedTime));
      }
    }
  }, [eventId, previewMode]);

  useEffect(() => {
    if (eventId && previewMode) {
      localStorage.setItem(previewKey, String(previewTimeLeft));
    }
  }, [previewTimeLeft, eventId, previewMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (previewMode && isPlaying && previewTimeLeft > 0) {
      interval = setInterval(() => {
        setPreviewTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setShowUpgradeModal(true);
            if (videoRef.current) videoRef.current.pause();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [previewMode, isPlaying, previewTimeLeft]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  useEffect(() => {
    if (videoRef.current) {
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value[0] / 100;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleControls = () => setShowControls(c => !c);

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{gameTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {awayTeam} @ {homeTeam} • {league}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
            )}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div 
          className="relative aspect-video bg-black group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onClick={toggleControls}
        >
          {streamUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={streamUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white text-center">
              <div>
                <div className="text-6xl mb-4">📺</div>
                <p className="text-xl font-semibold mb-2">Stream Starting Soon</p>
                <p className="text-sm opacity-75">Game begins in a few minutes</p>
              </div>
            </div>
          )}

          <div className={cn("absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0 pointer-events-none")}>
            <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-1" />}
            </Button>
          </div>

          <div className={cn("absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0 pointer-events-none")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onChatToggle && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onChatToggle}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleFullscreen}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {isLive && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="animate-pulse">🔴 LIVE</Badge>
            </div>
          )}

          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <Badge variant={quality === '4K' ? 'default' : quality === 'HD' ? 'secondary' : 'outline'} className={cn("backdrop-blur-sm", quality === '4K' && "bg-gradient-to-r from-purple-600 to-pink-600", quality === 'HD' && "bg-gradient-to-r from-blue-600 to-cyan-600")}>
              {quality}
            </Badge>
            <Badge variant="outline" className="backdrop-blur-sm bg-black/50 text-white border-white/20">
              {userTier === 'diamond' && <Gem className="h-3 w-3 mr-1" />}
              {userTier === 'platinum' && <Crown className="h-3 w-3 mr-1" />}
              {userTier === 'gold' && <Star className="h-3 w-3 mr-1" />}
              {userTier.toUpperCase()}
            </Badge>
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
              <Users className="h-4 w-4" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>
          </div>

          {previewMode && previewTimeLeft > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-center text-white">
                <div className="text-2xl font-bold mb-2">Preview Mode</div>
                <div className="text-4xl font-mono mb-2">{previewTimeLeft}s</div>
                <div className="text-sm opacity-75">Upgrade to continue watching</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade Your Streaming Experience
            </DialogTitle>
            <DialogDescription>
              Your preview has ended. Upgrade to continue watching with unlimited access and enhanced quality.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Gold Tier
                  </span>
                  <Badge variant="secondary">SD Quality</Badge>
                </div>
                <p className="text-sm text-gray-600">Unlimited streaming access</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4 text-blue-500" />
                    Platinum Tier
                  </span>
                  <Badge variant="secondary">HD Quality</Badge>
                </div>
                <p className="text-sm text-gray-600">HD streaming + multi-game viewing</p>
              </div>
              <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Gem className="h-4 w-4 text-purple-500" />
                    Diamond Tier
                  </span>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">4K Quality</Badge>
                </div>
                <p className="text-sm text-gray-600">4K streaming + exclusive content</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="flex-1">Close</Button>
              <Button onClick={() => {
                onUpgradeClick?.();
                setShowUpgradeModal(false);
                window.location.href = '/upgrade-tier';
              }} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">Upgrade Now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}