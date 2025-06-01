import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Users, MessageCircle } from 'lucide-react';
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
  className
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

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
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-xl font-semibold mb-2">Stream Starting Soon</p>
                <p className="text-sm opacity-75">Game begins in a few minutes</p>
              </div>
            </div>
          )}
          
          {/* Stream Overlay Controls */}
          <div className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      value={volume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onChatToggle && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={onChatToggle}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Live Indicator */}
          {isLive && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="animate-pulse">
                🔴 LIVE
              </Badge>
            </div>
          )}

          {/* Viewer Count */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
              <Users className="h-4 w-4" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}