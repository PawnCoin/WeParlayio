import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Copy,
  Mail,
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface ChallengeShareData {
  challengeId: string;
  eventName: string;
  amount: number;
  currency: string;
  pick: string;
  odds: number;
  expiresIn: string;
}

interface OneClickChallengeShareProps {
  challengeData: ChallengeShareData;
  shareUrl: string;
}

const OneClickChallengeShare: React.FC<OneClickChallengeShareProps> = ({
  challengeData,
  shareUrl
}) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState<string | null>(null);

  const shareText = `🎯 Challenge me on WeParlay! 
Event: ${challengeData.eventName}
My Pick: ${challengeData.pick}
Amount: ${challengeData.amount} ${challengeData.currency}
Odds: ${challengeData.odds > 0 ? '+' : ''}${challengeData.odds}

Think you can beat me? Accept my challenge: ${shareUrl}

#WeParlay #BettingChallenge #SportsApp`;

  const handleShare = async (platform: string) => {
    setIsSharing(platform);
    
    try {
      let shareEndpoint = '';
      const encodedText = encodeURIComponent(shareText);
      const encodedUrl = encodeURIComponent(shareUrl);

      switch (platform) {
        case 'facebook':
          shareEndpoint = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
        case 'twitter':
          shareEndpoint = `https://twitter.com/intent/tweet?text=${encodedText}`;
          break;
        case 'instagram':
          // Instagram doesn't support direct URL sharing, so we copy to clipboard
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Challenge copied!",
            description: "Challenge text copied to clipboard. Paste it in your Instagram story or post!",
          });
          setIsSharing(null);
          return;
        case 'whatsapp':
          shareEndpoint = `https://wa.me/?text=${encodedText}`;
          break;
        case 'email':
          shareEndpoint = `mailto:?subject=WeParlay Betting Challenge&body=${encodedText}`;
          break;
        case 'sms':
          shareEndpoint = `sms:?body=${encodedText}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Challenge link copied!",
            description: "Challenge link copied to clipboard.",
          });
          setIsSharing(null);
          return;
      }

      if (shareEndpoint) {
        window.open(shareEndpoint, '_blank', 'width=600,height=400');
        
        toast({
          title: "Challenge shared!",
          description: `Your betting challenge has been shared on ${platform}!`,
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share failed",
        description: "There was an error sharing your challenge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setIsSharing(null), 1000);
    }
  };

  const shareOptions = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-black' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
    { id: 'email', label: 'Email', icon: Mail, color: 'text-gray-600' },
    { id: 'sms', label: 'Text Message', icon: Phone, color: 'text-blue-500' },
    { id: 'copy', label: 'Copy Link', icon: Copy, color: 'text-gray-500' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Challenge
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-center">
          <div className="font-semibold">Share Your Challenge</div>
          <div className="text-xs text-muted-foreground mt-1">
            Expires in {challengeData.expiresIn}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {shareOptions.map((option) => {
          const Icon = option.icon;
          const isCurrentlySharing = isSharing === option.id;
          
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleShare(option.id)}
              disabled={isCurrentlySharing}
              className="cursor-pointer"
            >
              <div className="flex items-center w-full">
                {isCurrentlySharing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
                )}
                <span className={isCurrentlySharing ? 'opacity-50' : ''}>
                  {isCurrentlySharing ? 'Sharing...' : option.label}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Challenge Details:</div>
          <div>Event: {challengeData.eventName}</div>
          <div>Pick: {challengeData.pick}</div>
          <div>Amount: {challengeData.amount} {challengeData.currency}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OneClickChallengeShare;