import React, { useRef, useEffect, useState } from 'react';
import { X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StreamPlayerProps {
  streamUrl: string;
  title: string;
  onClose: () => void;
}

export default function StreamPlayer({ streamUrl, title, onClose }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle different stream types
    const loadStream = async () => {
      try {
        if (streamUrl.includes('.m3u8')) {
          // HLS streams
          if ('mediaSource' in window) {
            const { default: Hls } = await import('hls.js');
            if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 90
              });
              hls.loadSource(streamUrl);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS stream loaded successfully');
              });
              hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                setError('Stream temporarily unavailable');
              });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              // Safari native HLS support
              video.src = streamUrl;
            } else {
              setError('HLS not supported in this browser');
            }
          }
        } else {
          // Direct video streams
          video.src = streamUrl;
        }
      } catch (err) {
        console.error('Stream loading error:', err);
        setError('Unable to load stream');
      }
    };

    loadStream();

    return () => {
      if (video) {
        video.pause();
        video.src = '';
      }
    };
  }, [streamUrl]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Playback failed - stream may be offline');
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          await video.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-xl font-bold text-white mb-4">Stream Unavailable</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h2 className="text-white font-semibold truncate">{title}</h2>
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Video Player */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={false}
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          crossOrigin="anonymous"
        />

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={togglePlay}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Loading/Error State */}
        {!isPlaying && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={togglePlay} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Play Stream
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}