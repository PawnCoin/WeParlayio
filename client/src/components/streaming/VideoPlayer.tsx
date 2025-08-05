import { useRef, useEffect, useCallback, memo } from 'react';
import { Users, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StreamingGame, VideoPlayerState, StreamType } from './types';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { toast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  readonly game: StreamingGame;
  readonly className?: string;
}

const VideoPlayer = memo(({ game, className = '' }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playerState, error, initializePlayer, cleanup } = useVideoPlayer(videoRef);

  const getStreamType = useCallback((url: string): StreamType => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('twitch.tv')) return 'twitch';
    if (url.includes('.m3u8') || url.includes('thetv.to')) return 'hls';
    return 'mp4';
  }, []);

  const sanitizeYouTubeUrl = useCallback((url: string): string => {
    return url
      .replace('watch?v=', 'embed/')
      .replace('youtube.com', 'youtube-nocookie.com')
      .replace(/[&?]list=[^&]*/, '') // Remove playlist parameters for security
      .replace(/[&?]autoplay=[^&]*/, ''); // Remove autoplay for user control
  }, []);

  const sanitizeTwitchUrl = useCallback((url: string): string => {
    const channelMatch = url.match(/twitch\.tv\/(\w+)/);
    if (!channelMatch) return url;
    return `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}`;
  }, []);

  useEffect(() => {
    if (!game.streamUrl) return;

    const streamType = getStreamType(game.streamUrl);
    if (streamType === 'hls' || streamType === 'mp4') {
      initializePlayer(game.streamUrl, streamType);
    }

    return cleanup;
  }, [game.streamUrl, initializePlayer, cleanup, getStreamType]);

  const renderVideoPlayer = () => {
    const streamType = getStreamType(game.streamUrl);

    switch (streamType) {
      case 'youtube':
        // Create proper YouTube embed URL with autoplay
        const videoId = game.streamUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
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
        return (
          <iframe
            className="w-full h-full"
            src={sanitizeTwitchUrl(game.streamUrl)}
            title={game.title}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; encrypted-media; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        );

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
            <source src={game.streamUrl} type={streamType === 'hls' ? 'application/x-mpegURL' : 'video/mp4'} />
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
              <p className="text-lg font-semibold">Stream Loading...</p>
              <p className="text-sm text-gray-400">{game.title}</p>
            </div>
          </div>
        );
    }
  };

  const handleWatchLive = async () => {
    try {
      // Try to get specific live stream for this sport/game
      const response = await fetch(`/api/live-streaming/sport/${game.sport}?gameId=${game.id}`);
      const data = await response.json();

      if (data.success && data.stream) {
        // Update the game's stream URL to play in the current player
        game.streamUrl = data.stream.streamUrl;
        toast({
          title: "Live Stream Found!",
          description: `Loading ${data.stream.name} - ${data.stream.quality} quality`,
        });
        // Force re-render by updating the video source
        window.location.reload();
      } else {
        // Search for live stream
        const searchResponse = await fetch(`/api/live-streaming/search?team1=${encodeURIComponent(game.homeTeam.name)}&team2=${encodeURIComponent(game.awayTeam.name)}&sport=${encodeURIComponent(game.sport)}`);
        const searchData = await searchResponse.json();

        if (searchData.success && searchData.stream) {
          game.streamUrl = searchData.stream.streamUrl;
          toast({
            title: "Stream Found!",
            description: "Loading live stream",
          });
          window.location.reload();
        } else {
          toast({
            title: "Stream Unavailable",
            description: "No live stream found for this game",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error finding live stream:', error);
      toast({
        title: "Stream Error",
        description: "Failed to find live stream",
        variant: "destructive"
      });
    }
  };


  if (!game.streamUrl) {
    return (
      <div className={`aspect-video bg-gray-900 flex items-center justify-center rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-white text-lg font-semibold">{game.title}</p>
          <p className="text-gray-400">Stream loading...</p>
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
            <p className="text-sm text-gray-300">{error.message}</p>
            {error.recoverable && (
              <button
                onClick={() => initializePlayer(game.streamUrl, getStreamType(game.streamUrl))}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Watch Live Button */}
      <button
        onClick={handleWatchLive}
        className="absolute bottom-4 left-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
      >
        Watch Live
      </button>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;