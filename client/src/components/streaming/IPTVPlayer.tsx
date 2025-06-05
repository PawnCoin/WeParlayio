import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface IPTVPlayerProps {
  streamUrl: string;
  title: string;
  onClose: () => void;
  autoplay?: boolean;
}

export default function IPTVPlayer({ streamUrl, title, onClose, autoplay = false }: IPTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Failed to load stream. The stream may be offline or unavailable.');
      setIsLoading(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    // Load the stream
    video.src = streamUrl;
    video.load();

    if (autoplay) {
      video.play().catch(err => {
        console.warn('Autoplay failed:', err);
        setError('Autoplay blocked. Click play to start.');
      });
    }

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [streamUrl, autoplay]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (err) {
      console.error('Play/pause error:', err);
      setError('Failed to control playback');
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-[400px] md:h-[500px] object-contain"
        playsInline
        preload="metadata"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white">Loading stream...</span>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white p-4">
            <div className="text-red-400 mb-2">⚠️ Stream Error</div>
            <div className="text-sm">{error}</div>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                videoRef.current?.load();
              }}
              className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors"
              disabled={!!error}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-primary transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-primary"
            />
          </div>

          {/* Center Title */}
          <div className="text-white text-sm font-medium truncate mx-4">
            {title}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary transition-colors"
            >
              <Maximize size={20} />
            </button>

            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors text-xl"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Stream Info */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        🔴 LIVE
      </div>
    </div>
  );
}