import { useRef, useEffect, useCallback, memo, useState } from 'react';
import { Users, Play, Settings, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StreamingGame, StreamType } from './types';
import { useVideoPlayer } from './hooks/useVideoPlayer';


interface IntegratedVideoPlayerProps {
  readonly game: StreamingGame | null;
  readonly className?: string;
  readonly onFindStream?: () => void;
  readonly onChangeStream?: () => void;
}

const IntegratedVideoPlayer = memo(({ game, className = '', onFindStream, onChangeStream }: IntegratedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playerState, error, initializePlayer, cleanup } = useVideoPlayer(videoRef);
  const [currentStreamType, setCurrentStreamType] = useState<StreamType | null>(null);

  const getStreamType = useCallback((url: string): StreamType => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('twitch.tv')) return 'twitch';
    if (url.includes('.m3u8') || url.includes('thetv.to')) return 'hls';
    return 'mp4';
  }, []);

  const extractYouTubeVideoId = useCallback((url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match?.[1] || null;
  }, []);

  const extractTwitchChannel = useCallback((url: string): string | null => {
    const match = url.match(/twitch\.tv\/(\w+)/);
    return match?.[1] || null;
  }, []);

  useEffect(() => {
    if (!game?.streamUrl) {
      cleanup();
      setCurrentStreamType(null);
      return;
    }

    const streamType = getStreamType(game.streamUrl);
    setCurrentStreamType(streamType);

    if (streamType === 'hls' || streamType === 'mp4') {
      initializePlayer(game.streamUrl, streamType);
    }

    return cleanup;
  }, [game?.streamUrl, initializePlayer, cleanup, getStreamType]);

  const renderVideoPlayer = () => {
    if (!game?.streamUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Stream Selected</h3>
            <p className="text-gray-400 mb-4">Choose a live stream to start watching</p>
            {onFindStream && (
              <Button onClick={onFindStream} className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Find Live Stream
              </Button>
            )}
          </div>
        </div>
      );
    }

    switch (currentStreamType) {
      case 'youtube':
        const videoId = extractYouTubeVideoId(game.streamUrl);
        if (videoId) {
          return (
            <iframe
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
        const channel = extractTwitchChannel(game.streamUrl);
        if (channel) {
          return (
            <iframe
              className="w-full h-full"
              src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true&muted=true`}
              title={game.title}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen"
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
          >
            <source src={game.streamUrl} type={currentStreamType === 'hls' ? 'application/x-mpegURL' : 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/20 flex items-center justify-center">
                <Settings className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Unsupported Stream Format</h3>
              <p className="text-gray-400">This stream type is not supported</p>
            </div>
          </div>
        );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-600/20 flex items-center justify-center">
            <RotateCcw className="h-8 w-8 text-yellow-500 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Loading Stream</h3>
          <p className="text-gray-400">Connecting to live stream...</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-video">
        {renderVideoPlayer()}
      </div>
      
      {/* Stream Controls Overlay */}
      {game && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
              <div className="text-white">
                <h4 className="font-semibold text-sm">{game.title}</h4>
                <p className="text-xs text-gray-300">{game.sport} • {game.league}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-white bg-black/50 px-2 py-1 rounded">
                <Users className="h-3 w-3" />
                <span>{game.viewers?.toLocaleString() || '0'}</span>
              </div>
              
              {onChangeStream && (
                <Button size="sm" variant="outline" onClick={onChangeStream} className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Change Stream
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-600/20 flex items-center justify-center">
              <Settings className="h-6 w-6 text-red-500" />
            </div>
            <h4 className="font-semibold mb-2">Stream Error</h4>
            <p className="text-sm text-gray-300 mb-3">{error}</p>
            {onChangeStream && (
              <Button size="sm" onClick={onChangeStream} className="bg-red-600 hover:bg-red-700">
                Try Different Stream
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

IntegratedVideoPlayer.displayName = 'IntegratedVideoPlayer';

export default IntegratedVideoPlayer;