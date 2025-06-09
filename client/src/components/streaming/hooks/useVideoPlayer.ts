import { useState, useCallback, useRef, RefObject } from 'react';
import Hls from 'hls.js';
import { VideoPlayerState, StreamingError, StreamType } from '../types';

export const useVideoPlayer = (videoRef: RefObject<HTMLVideoElement>) => {
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    hasError: false,
    isLoading: false
  });

  const [error, setError] = useState<StreamingError | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const updatePlayerState = useCallback((updates: Partial<VideoPlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback((errorType: StreamingError['type'], message: string, recoverable = true) => {
    const streamingError: StreamingError = {
      type: errorType,
      message,
      recoverable
    };
    setError(streamingError);
    updatePlayerState({ hasError: true, isLoading: false });
  }, [updatePlayerState]);

  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setError(null);
    updatePlayerState({
      isPlaying: false,
      hasError: false,
      isLoading: false
    });
  }, [updatePlayerState]);

  const initializeHLS = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      cleanup();
      
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: false,
        maxLoadingDelay: 4,
        maxBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
          xhr.timeout = 30000;
        }
      });

      hlsRef.current = hls;
      
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        updatePlayerState({ isLoading: false });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              handleError('network', 'Network connection failed', true);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              handleError('media', 'Media format not supported', true);
              break;
            default:
              handleError('unknown', 'Stream playback failed', false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = url;
    } else {
      handleError('media', 'HLS not supported on this browser', false);
    }
  }, [videoRef, cleanup, updatePlayerState, handleError]);

  const initializePlayer = useCallback((url: string, streamType: StreamType) => {
    if (!videoRef.current) return;

    setError(null);
    updatePlayerState({ isLoading: true, hasError: false });

    switch (streamType) {
      case 'hls':
        initializeHLS(url);
        break;
      case 'mp4':
        videoRef.current.src = url;
        updatePlayerState({ isLoading: false });
        break;
      default:
        handleError('media', 'Unsupported stream type', false);
        break;
    }
  }, [videoRef, updatePlayerState, initializeHLS, handleError]);

  return {
    playerState,
    error,
    initializePlayer,
    cleanup
  };
};