import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, RotateCcw } from 'lucide-react';

interface EnhancedVideoPlayerProps {
  streamUrl: string;
  title: string;
  onClose: () => void;
  autoplay?: boolean;
  platform?: 'twitch' | 'youtube' | 'iptv';
}

export default function EnhancedVideoPlayer({ 
  streamUrl, 
  title, 
  onClose, 
  autoplay = false, 
  platform = 'iptv' 
}: EnhancedVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle different streaming platforms
  const getEmbedContent = () => {
    if (error) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
          <div className="text-center p-6">
            <div className="text-red-400 mb-4 text-lg">Stream Unavailable</div>
            <div className="text-sm text-gray-300 mb-4">
              The stream may be offline or experiencing technical difficulties.
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
            >
              <RotateCcw size={16} />
              Retry Stream
            </button>
          </div>
        </div>
      );
    }

    if (platform === 'twitch') {
      return (
        <iframe
          src={streamUrl}
          className="w-full h-full"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onLoad={() => setIsLoading(false)}
          onError={() => setError('Failed to load Twitch stream')}
        />
      );
    }

    if (platform === 'youtube') {
      return (
        <iframe
          src={streamUrl}
          className="w-full h-full"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onLoad={() => setIsLoading(false)}
          onError={() => setError('Failed to load YouTube stream')}
        />
      );
    }

    // IPTV/Direct stream - compatible with IPTV Smarters Player format
    return (
      <video
        src={streamUrl}
        className="w-full h-full object-contain bg-black"
        controls
        autoPlay={autoplay}
        playsInline
        preload="metadata"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => setError('Stream unavailable or offline')}
      />
    );
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Force reload the content
    if (containerRef.current) {
      const content = containerRef.current.querySelector('iframe, video');
      if (content) {
        if (content instanceof HTMLIFrameElement) {
          content.src = content.src;
        } else if (content instanceof HTMLVideoElement) {
          content.load();
        }
      }
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden h-[400px] md:h-[500px]">
      {/* Stream Content */}
      {getEmbedContent()}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-sm">Loading stream...</div>
          </div>
        </div>
      )}

      {/* Stream Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
        🔴 LIVE
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="text-white text-sm font-medium truncate flex-1 mr-4">
            {title}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary transition-colors"
              title="Fullscreen"
            >
              <Maximize size={20} />
            </button>

            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors text-xl font-bold"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Platform Badge */}
      <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs uppercase">
        {platform}
      </div>
    </div>
  );
}