import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Settings,
  Tv,
  Crown,
  Signal,
  Star,
  MoreVertical
} from 'lucide-react';

interface MobileStreamingControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  isMuted: boolean;
  onMute: () => void;
  isFullscreen: boolean;
  onFullscreen: () => void;
  quality: string;
  onQualityChange: (quality: string) => void;
  channel?: {
    name: string;
    category: string;
    isVip?: boolean;
    quality?: string;
  };
}

export function MobileStreamingControls({
  isPlaying,
  onPlayPause,
  isMuted,
  onMute,
  isFullscreen,
  onFullscreen,
  quality,
  onQualityChange,
  channel
}: MobileStreamingControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  const qualities = ['Auto', 'HD', 'SD'];

  return (
    <>
      {/* Main Control Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-t from-black/80 to-transparent">
        {/* Left Controls */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlayPause}
            className="h-10 w-10 p-0 bg-white/20 hover:bg-white/30 rounded-full"
          >
            {isPlaying ? 
              <Pause className="h-5 w-5 text-white" /> : 
              <Play className="h-5 w-5 text-white" />
            }
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onMute}
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 rounded-full"
          >
            {isMuted ? 
              <VolumeX className="h-4 w-4 text-white" /> : 
              <Volume2 className="h-4 w-4 text-white" />
            }
          </Button>
        </div>

        {/* Center Info */}
        {channel && (
          <div className="flex-1 mx-4 text-center">
            <div className="bg-black/40 rounded-lg px-3 py-1">
              <p className="text-white text-sm font-medium flex items-center justify-center">
                {channel.isVip && <Crown className="w-3 h-3 mr-1 text-yellow-400" />}
                {channel.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs h-5">
                  {channel.category}
                </Badge>
                <Badge variant="outline" className="text-xs h-5">
                  <Signal className="w-3 h-3 mr-1" />
                  {channel.quality || 'HD'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <Drawer open={showSettings} onOpenChange={setShowSettings}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 rounded-full"
              >
                <Settings className="h-4 w-4 text-white" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-gray-900 border-gray-800">
              <div className="p-4 pb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Tv className="w-5 h-5 mr-2" />
                  Stream Settings
                </h3>
                
                {/* Quality Settings */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white mb-2">Video Quality</p>
                    <div className="grid grid-cols-3 gap-2">
                      {qualities.map((q) => (
                        <Button
                          key={q}
                          variant={quality === q ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            onQualityChange(q);
                            setShowSettings(false);
                          }}
                          className={quality === q ? 
                            "bg-gradient-to-r from-orange-500 to-red-600" : 
                            "border-gray-700 text-gray-300"
                          }
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stream Info */}
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Stream Information</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resolution:</span>
                        <span className="text-white">1920x1080</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bitrate:</span>
                        <span className="text-white">3.2 Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Codec:</span>
                        <span className="text-white">H.264</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Latency:</span>
                        <span className="text-green-400">Low (2.1s)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreen}
            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 rounded-full"
          >
            {isFullscreen ? 
              <Minimize2 className="h-4 w-4 text-white" /> : 
              <Maximize2 className="h-4 w-4 text-white" />
            }
          </Button>
        </div>
      </div>

      {/* Mobile Stream Stats */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/60 rounded-lg px-2 py-1 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">LIVE</span>
        </div>
      </div>

      {/* Mobile Quality Indicator */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-black/60 text-white border-white/20">
          <Star className="w-3 h-3 mr-1" />
          {quality} Quality
        </Badge>
      </div>

      {/* Touch-friendly Progress Bar for Mobile */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 w-0"></div>
      </div>
    </>
  );
}

export default MobileStreamingControls;