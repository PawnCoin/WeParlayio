import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Users, Eye } from 'lucide-react';

interface YouTubeStream {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  viewerCount: number;
  embedUrl: string;
}

interface YouTubeModalProps {
  stream: YouTubeStream | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayInMain: (stream: YouTubeStream) => void;
}

export default function YouTubeModal({ stream, isOpen, onClose, onPlayInMain }: YouTubeModalProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  if (!stream) return null;

  const handlePlayInMain = () => {
    onPlayInMain(stream);
    onClose();
  };

  const handleExternalLink = () => {
    window.open(`https://youtube.com/watch?v=${stream.videoId}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                {stream.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {stream.channelTitle}
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {stream.viewerCount?.toLocaleString() || 'Live'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayInMain}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Play in Main
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExternalLink}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                YouTube
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative bg-black">
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Loading video...</p>
              </div>
            </div>
          )}
          
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&fs=1`}
            title={stream.title}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setIsVideoLoaded(true)}
          />
        </div>
        
        <div className="px-6 py-3 border-t bg-muted/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Live Stream</span>
              <Badge variant="outline" className="text-xs">
                HD Quality
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>{stream.viewerCount?.toLocaleString() || 'Live'} viewers</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}