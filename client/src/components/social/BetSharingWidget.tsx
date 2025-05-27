import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Twitter, MessageCircle, Copy, Camera, Trophy, Flame } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok, FaDiscord } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';

interface BetDetails {
  id: string;
  event: string;
  selection: string;
  odds: number;
  amount: number;
  potentialPayout: number;
  confidence: number;
  tags?: string[];
}

interface BetSharingWidgetProps {
  bet: BetDetails;
  onShare?: (platform: string, content: string) => void;
}

export default function BetSharingWidget({ bet, onShare }: BetSharingWidgetProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { toast } = useToast();

  const generateShareText = (platform: string) => {
    const baseText = customMessage || `🔥 Just placed a bet on ${bet.event}! 
${bet.selection} at ${bet.odds > 0 ? '+' : ''}${bet.odds} odds
💰 $${bet.amount} to win $${bet.potentialPayout.toFixed(2)}
Confidence: ${bet.confidence}% 🎯`;

    const platformTexts = {
      twitter: `${baseText}\n\n#SportsBetting #WeParlay #${bet.event.replace(/\s/g, '')} ${bet.tags?.map(tag => `#${tag}`).join(' ') || ''}`,
      facebook: `${baseText}\n\nWhat do you think? Drop your predictions below! 👇`,
      instagram: `${baseText}\n\n📊 Follow for more winning picks!`,
      tiktok: `${baseText}\n\n🎥 Watch my betting strategy!`,
      discord: `${baseText}\n\n💬 Join the discussion!`,
      copy: baseText
    };

    return platformTexts[platform as keyof typeof platformTexts] || baseText;
  };

  const handleShare = async (platform: string) => {
    setIsSharing(true);
    
    try {
      const shareText = generateShareText(platform);
      
      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Your bet details are ready to share",
        });
      } else if (platform === 'twitter') {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(tweetUrl, '_blank');
      } else if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank');
      }
      
      if (onShare) {
        onShare(platform, shareText);
      }
      
      toast({
        title: "Bet shared successfully!",
        description: `Your bet has been shared on ${platform}`,
      });
      
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "There was an error sharing your bet",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const sharePlatforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'bg-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'bg-black' },
    { id: 'discord', name: 'Discord', icon: FaDiscord, color: 'bg-indigo-500' },
    { id: 'copy', name: 'Copy Link', icon: Copy, color: 'bg-gray-500' }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-400" />
          Share Your Bet
          <Badge className="bg-green-500 text-white ml-auto">
            <Trophy className="h-3 w-3 mr-1" />
            ${bet.potentialPayout.toFixed(2)} Win
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bet Preview */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">{bet.event}</span>
                <Badge className="bg-orange-500 text-white">
                  <Flame className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              </div>
              
              <div className="text-gray-300">
                <div className="font-semibold">{bet.selection}</div>
                <div className="text-sm">
                  Odds: {bet.odds > 0 ? '+' : ''}{bet.odds} | 
                  Stake: ${bet.amount} | 
                  <span className={getConfidenceColor(bet.confidence)}>
                    Confidence: {bet.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Message */}
        <div className="space-y-2">
          <label className="text-white font-semibold">Custom Message (Optional)</label>
          <Textarea
            placeholder="Add your thoughts, strategy, or challenge friends..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            rows={3}
          />
        </div>

        {/* Platform Selection */}
        <div className="space-y-3">
          <label className="text-white font-semibold">Share To:</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {sharePlatforms.map((platform) => {
              const IconComponent = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);
              
              return (
                <Button
                  key={platform.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`${isSelected ? platform.color : 'bg-gray-800 border-gray-600'} text-white hover:opacity-80`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {platform.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Share Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => handleShare('copy')}
            variant="outline"
            className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            disabled={isSharing}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Bet Details
          </Button>

          {selectedPlatforms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedPlatforms.map((platformId) => {
                const platform = sharePlatforms.find(p => p.id === platformId);
                if (!platform) return null;
                
                const IconComponent = platform.icon;
                
                return (
                  <Button
                    key={platformId}
                    onClick={() => handleShare(platformId)}
                    className={`${platform.color} text-white hover:opacity-80`}
                    disabled={isSharing}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    Share on {platform.name}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Share Stats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">47</div>
                <div className="text-xs text-gray-400">Shares Today</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">73%</div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">+$2,840</div>
                <div className="text-xs text-gray-400">Total Profits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-400 text-center">
          🔒 Your sharing activity helps build your betting reputation
        </div>
      </CardContent>
    </Card>
  );
}