
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, ExternalLink, Tv } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UniversalSportsRouterProps {
  sportKey: string;
  gameId?: string;
  homeTeam?: string;
  awayTeam?: string;
  children?: React.ReactNode;
  buttonText?: string;
  autoOpen?: boolean;
}

export const UniversalSportsRouter: React.FC<UniversalSportsRouterProps> = ({
  sportKey,
  gameId,
  homeTeam,
  awayTeam,
  children,
  buttonText = "Watch Live",
  autoOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [streamOptions, setStreamOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadStreamOptions();
    }
  }, [isOpen, sportKey, gameId]);

  const loadStreamOptions = async () => {
    setLoading(true);
    try {
      // Get all available streams for this sport
      const response = await fetch(`/api/live-streaming/sport/${sportKey}/all`);
      const data = await response.json();

      if (data.success && data.streams.length > 0) {
        setStreamOptions(data.streams);
        setSelectedStream(data.streams[0]); // Auto-select first option
      } else {
        // Try search-based approach
        await searchForStreams();
      }
    } catch (error) {
      console.error('Error loading stream options:', error);
      await searchForStreams();
    }
    setLoading(false);
  };

  const searchForStreams = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (homeTeam) searchParams.append('team1', homeTeam);
      if (awayTeam) searchParams.append('team2', awayTeam);
      if (sportKey) searchParams.append('sport', sportKey);

      const response = await fetch(`/api/live-streaming/search?${searchParams}`);
      const data = await response.json();

      if (data.success && data.stream) {
        setStreamOptions([data.stream]);
        setSelectedStream(data.stream);
      } else {
        // Get recommendations as final fallback
        const recResponse = await fetch('/api/live-streaming/recommendations');
        const recData = await recResponse.json();
        
        if (recData.success) {
          setStreamOptions(recData.recommendations);
          setSelectedStream(recData.recommendations[0]);
        }
      }
    } catch (error) {
      console.error('Error searching for streams:', error);
      toast({
        title: "Stream Error",
        description: "Failed to find live streams",
        variant: "destructive"
      });
    }
  };

  const openStream = (stream: any) => {
    window.open(stream.streamUrl, '_blank');
    toast({
      title: "Opening Live Stream",
      description: `${stream.name} - ${stream.quality} quality`,
    });
  };

  const directWatch = async () => {
    try {
      const response = await fetch(`/api/live-streaming/sport/${sportKey}?gameId=${gameId || ''}`);
      const data = await response.json();

      if (data.success && data.stream) {
        openStream(data.stream);
      } else {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error with direct watch:', error);
      setIsOpen(true);
    }
  };

  return (
    <>
      {children ? (
        <div onClick={directWatch} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button onClick={directWatch} className="bg-red-600 hover:bg-red-700">
          <Play className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Live Stream Options
              {homeTeam && awayTeam && (
                <span className="text-sm font-normal text-gray-600">
                  {homeTeam} vs {awayTeam}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
                <p>Finding live streams...</p>
              </div>
            ) : streamOptions.length > 0 ? (
              <div className="grid gap-3">
                {streamOptions.map((stream, index) => (
                  <div 
                    key={stream.id || index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{stream.name}</h3>
                        <Badge variant={stream.quality === '4K' ? 'default' : 'secondary'}>
                          {stream.quality}
                        </Badge>
                        {stream.isLive && (
                          <Badge variant="destructive" className="animate-pulse">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {stream.sport} • {stream.league}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stream.language.toUpperCase()} • {stream.country}
                      </p>
                    </div>
                    <Button 
                      onClick={() => openStream(stream)}
                      size="sm"
                      className="ml-4"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Tv className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Streams Available</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any live streams for this sport right now.
                </p>
                <Button onClick={() => setIsOpen(false)} variant="outline">
                  Close
                </Button>
              </div>
            )}
          </div>

          {selectedStream && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Recommended: {selectedStream.name}
                </span>
                <Button 
                  onClick={() => openStream(selectedStream)}
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Watch Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UniversalSportsRouter;
