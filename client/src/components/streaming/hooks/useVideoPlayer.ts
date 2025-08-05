import { useState, useCallback, useRef } from 'react';
import { StreamType } from '../types';

export interface VideoPlayerState {
  isLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
}

export const useVideoPlayer = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isLoading: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: true
  });
  const [error, setError] = useState<string | null>(null);

  const initializePlayer = useCallback(async (url: string, streamType: StreamType) => {
    if (!videoRef.current) return;

    setError(null);
    setPlayerState(prev => ({ ...prev, isLoading: true }));

    try {
      const video = videoRef.current;
      
      if (streamType === 'hls') {
        // For HLS streams, we would use hls.js in production
        // For now, we'll try native support
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          throw new Error('HLS streams not supported in this browser');
        }
      } else {
        video.src = url;
      }

      video.load();
      
      setPlayerState(prev => ({ ...prev, isLoading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stream');
      setPlayerState(prev => ({ ...prev, isLoading: false }));
    }
  }, [videoRef]);

  const cleanup = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.load();
    }
    setError(null);
    setPlayerState({
      isLoading: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: true
    });
  }, [videoRef]);

  return {
    playerState,
    error,
    initializePlayer,
    cleanup
  };
};