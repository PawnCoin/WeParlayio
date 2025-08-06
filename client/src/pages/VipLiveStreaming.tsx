import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tv,
  Crown,
  ChevronLeft,
  Zap,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import IPTVPlayerOriginal from '@/components/streaming/IPTVPlayerOriginal';

export default function VipLiveStreaming() {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check VIP access
  const hasVipAccess = user?.tier === 'platinum' || user?.tier === 'diamond' || user?.isAdmin;

  if (!hasVipAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-3xl font-bold text-white mb-4">VIP Live Streaming</h1>
            <p className="text-gray-300 text-lg mb-8">
              This premium feature requires VIP membership to access live sports channels.
            </p>
            <Badge variant="secondary" className="text-lg px-6 py-2">
              <Crown className="w-4 h-4 mr-2" />
              VIP Access Required
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                <Crown className="inline-block mr-2 h-8 w-8 text-yellow-500" />
                VIP Live Streaming
              </h1>
              <p className="text-gray-300">Premium sports channels with live video</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-3 h-3 mr-1" />
              296+ Channels
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Tv className="w-3 h-3 mr-1" />
              Live Sports
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Tv className="w-5 h-5 mr-2" />
              IPTV Sports Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <IPTVPlayerOriginal />
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Live Sports</h3>
                <p className="text-gray-400">Real-time sports broadcasts from around the world</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">HD Quality</h3>
                <p className="text-gray-400">High-definition streaming with adaptive quality</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">VIP Exclusive</h3>
                <p className="text-gray-400">Premium channels available only to VIP members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}