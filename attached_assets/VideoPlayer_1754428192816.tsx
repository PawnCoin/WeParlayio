
import React, { Suspense, useState, useEffect } from 'react';

// Lazy load ReactPlayer to improve initial load time.
const ReactPlayer = React.lazy(() => import('react-player/lazy'));

interface VideoPlayerProps {
  url?: string;
  channelName?: string;
  playing: boolean;
}

const PlayerPlaceholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        <h2 className="text-2xl font-semibold">Select a channel</h2>
        <p>Choose a channel from the list to start watching.</p>
    </div>
);

const ErrorOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-80 p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-xl font-semibold text-red-400">Playback Error</h3>
        <p className="text-gray-300">{message}</p>
    </div>
);


const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, channelName, playing }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when channel changes
    setError(null);
  }, [url]);

  const handleError = (e: any) => {
    console.error(`Error playing ${channelName}:`, e);
    setError("This channel could not be loaded. It might be offline or unavailable. Please try another channel.");
  };

  if (!url) {
    return <PlayerPlaceholder />;
  }

  return (
    <div className="w-full aspect-video bg-black relative flex items-center justify-center">
       {error && <ErrorOverlay message={error} />}
       <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center text-white">Loading Player...</div>}>
         <ReactPlayer
            key={url} // Important: re-mounts the player on URL change
            url={url}
            playing={playing}
            controls={true}
            width="100%"
            height="100%"
            className="absolute top-0 left-0"
            config={{
                file: {
                    hlsOptions: {
                        // You can add HLS.js specific options here if needed
                    },
                    forceHLS: true,
                }
            }}
            onError={handleError}
        />
       </Suspense>
    </div>
  );
};

export default VideoPlayer;
