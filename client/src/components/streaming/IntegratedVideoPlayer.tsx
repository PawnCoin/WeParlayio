
import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { Users, Play, Settings, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StreamingGame, VideoPlayerState, StreamType } from './types';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { toast } from '@/hooks/use-toast';
import { UniversalSportsRouter } from './UniversalSportsRouter';

interface IntegratedVideoPlayerProps {
  readonly game: StreamingGame;
  readonly className?: string;
}

const IntegratedVideoPlayer = memo(({ game, className = '' }: IntegratedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { playerState, error, initializePlayer, cleanup } = useVideoPlayer(videoRef);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(game.streamUrl);
  const [streamType, setStreamType] = useState<StreamType>('youtube');

  const getStreamType = useCallback((url: string): StreamType => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('twitch.tv')) return 'twitch';
    if (url.includes('.m3u8') || url.includes('thetv.to')) return 'hls';
    return 'mp4';
  }, []);

  const handleStreamSelect = useCallback((newStreamUrl: string) => {
    setCurrentStreamUrl(newStreamUrl);
    setStreamType(getStreamType(newStreamUrl));
    
    // Clean up previous stream
    cleanup();
    
    // Initialize new stream
    const type = getStreamType(newStreamUrl);
    if (type === 'hls' || type === 'mp4') {
      initializePlayer(newStreamUrl, type);
    }
    
    toast({
      title: "Stream Updated",
      description: "Loading new live stream...",
    });
  }, [getStreamType, cleanup, initializePlayer]);

  useEffect(() => {
    if (currentStreamUrl) {
      const type = getStreamType(currentStreamUrl);
      setStreamType(type);
      if (type === 'hls' || type === 'mp4') {
        initializePlayer(currentStreamUrl, type);
      }
    }
    return cleanup;
  }, [currentStreamUrl, initializePlayer, cleanup, getStreamType]);

  const renderVideoPlayer = () => {
    switch (streamType) {
      case 'youtube':
        const videoId = currentStreamUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        if (videoId) {
          return (
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
              title={game.title}
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          );
        }
        break;

      case 'twitch':
        const channelMatch = currentStreamUrl?.match(/twitch\.tv\/(\w+)/);
        if (channelMatch) {
          return (
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              src={`https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}`}
              title={game.title}
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; encrypted-media; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          );
        }
        break;

      case 'hls':
      case 'mp4':
        return (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted
            playsInline
            crossOrigin="anonymous"
            preload="metadata"
          >
            <source src={currentStreamUrl} type={streamType === 'hls' ? 'application/x-mpegURL' : 'video/mp4'} />
            Your browser does not support this video format.
          </video>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-semibold">Select Stream Source</p>
              <p className="text-sm text-gray-400">Click "Find Live Stream" to start watching</p>
            </div>
          </div>
        );
    }
  };

  if (!currentStreamUrl) {
    return (
      <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-lg font-semibold mb-4">{game.title}</p>
            <UniversalSportsRouter
              sportKey={game.sport}
              gameId={game.id}
              homeTeam={game.homeTeam.name}
              awayTeam={game.awayTeam.name}
              onStreamSelect={handleStreamSelect}
              buttonText="Find Live Stream"
            />
          </div>
        </div>

        {/* Game Info Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{game.title}</h3>
                <p className="text-sm text-gray-300">{game.league}</p>
              </div>
              <Badge className="bg-blue-600 hover:bg-blue-700">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                READY
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{game.homeTeam.name}</p>
                  <p className="text-2xl font-bold text-white">{game.homeTeam.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">VS</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{game.awayTeam.name}</p>
                  <p className="text-2xl font-bold text-white">{game.awayTeam.score}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-300">{game.period}</p>
                <p className="text-sm text-gray-300">{game.timeRemaining}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      {renderVideoPlayer()}

      {/* Viewer Count Overlay */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
          <div className="flex items-center space-x-2 text-white">
            <Users className="h-4 w-4" />
            <span className="text-sm">{game.viewers.toLocaleString()} viewers</span>
          </div>
        </div>
      </div>

      {/* Game Info Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{game.title}</h3>
              <p className="text-sm text-gray-300">{game.league}</p>
            </div>
            <Badge className="bg-red-600 hover:bg-red-700">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              LIVE
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm font-medium text-white">{game.homeTeam.name}</p>
                <p className="text-2xl font-bold text-white">{game.homeTeam.score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">VS</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">{game.awayTeam.name}</p>
                <p className="text-2xl font-bold text-white">{game.awayTeam.score}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-300">{game.period}</p>
              <p className="text-sm text-gray-300">{game.timeRemaining}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-lg font-semibold mb-2">Stream Error</p>
            <p className="text-sm text-gray-300 mb-4">{error.message}</p>
            <UniversalSportsRouter
              sportKey={game.sport}
              gameId={game.id}
              homeTeam={game.homeTeam.name}
              awayTeam={game.awayTeam.name}
              onStreamSelect={handleStreamSelect}
              buttonText="Find Different Stream"
            />
          </div>
        </div>
      )}

      {/* Change Stream Button */}
      <div className="absolute bottom-4 left-4">
        <UniversalSportsRouter
          sportKey={game.sport}
          gameId={game.id}
          homeTeam={game.homeTeam.name}
          awayTeam={game.awayTeam.name}
          onStreamSelect={handleStreamSelect}
          buttonText="Change Stream"
        >
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md">
            Change Stream
          </Button>
        </UniversalSportsRouter>
      </div>
    </div>
  );
});

IntegratedVideoPlayer.displayName = 'IntegratedVideoPlayer';

export default IntegratedVideoPlayer;
