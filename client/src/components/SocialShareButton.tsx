import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Instagram,
  Linkedin,
  Copy,
  MessageCircle
} from "lucide-react";

interface SocialShareButtonProps {
  type: 'win' | 'bet' | 'prediction' | 'challenge';
  content: string;
  betDetails?: {
    amount?: number;
    potentialWin?: number;
    teams?: string[];
    odds?: string;
    sport?: string;
  };
  user?: {
    name: string;
    winRate?: number;
  };
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  type,
  content,
  betDetails,
  user
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Generate share content for different platforms
  const generateShareContent = (platform: string) => {
    const baseUrl = "https://weparlay.io";
    const hashtags = "#WeParlay #SportsBetting #BigWin";
    
    let shareText = "";
    
    switch (type) {
      case 'win':
        shareText = `🏆 Just won ${betDetails?.potentialWin ? `$${betDetails.potentialWin}` : 'big'} on WeParlay! ${content} ${hashtags}`;
        break;
      case 'bet':
        shareText = `🎯 Check out my latest bet on WeParlay: ${content} ${hashtags}`;
        break;
      case 'prediction':
        shareText = `🔮 My sports prediction: ${content} What do you think? ${hashtags}`;
        break;
      case 'challenge':
        shareText = `⚡ Challenge accepted on WeParlay! ${content} ${hashtags}`;
        break;
      default:
        shareText = `Check this out on WeParlay: ${content} ${hashtags}`;
    }

    // Add user credibility if available
    if (user?.winRate) {
      shareText += ` (${user.winRate}% win rate)`;
    }

    // Add call to action
    shareText += ` Join me: ${baseUrl}`;

    return shareText;
  };

  // Handle different social platform sharing
  const handleShare = (platform: string) => {
    const shareText = generateShareContent(platform);
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent("https://weparlay.io");
    
    let shareUrl = "";
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodeURIComponent('WeParlay Sports Betting')}&summary=${encodedText}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard!",
          description: "Share text copied. Paste it anywhere!",
        });
        setIsOpen(false);
        return;
      case 'instagram':
        // Instagram doesn't support direct text sharing, so we copy to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied for Instagram!",
          description: "Text copied! Paste it in your Instagram story or post.",
        });
        setIsOpen(false);
        return;
      case 'tiktok':
        // TikTok doesn't support direct sharing, copy to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied for TikTok!",
          description: "Text copied! Use it in your TikTok video description.",
        });
        setIsOpen(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast({
        title: "Shared Successfully!",
        description: `Your post was shared to ${platform}!`,
      });
      setIsOpen(false);
    }
  };

  const socialPlatforms = [
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      icon: Twitter, 
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      textColor: 'text-white'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white'
    },
    { 
      id: 'reddit', 
      name: 'Reddit', 
      icon: MessageCircle, 
      color: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-white'
    },
    { 
      id: 'whatsapp', 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    { 
      id: 'telegram', 
      name: 'Telegram', 
      icon: MessageCircle, 
      color: 'bg-sky-600 hover:bg-sky-700',
      textColor: 'text-white'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: MessageCircle, 
      color: 'bg-black hover:bg-gray-800',
      textColor: 'text-white'
    },
    { 
      id: 'copy', 
      name: 'Copy Link', 
      icon: Copy, 
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    }
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Share to Social Media</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Spread the word about your {type === 'win' ? 'big win' : 'betting activity'} on WeParlay!
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Button
                  key={platform.id}
                  variant="outline"
                  size="sm"
                  className={`h-auto p-3 flex flex-col items-center gap-1 ${platform.color} ${platform.textColor} border-none`}
                  onClick={() => handleShare(platform.id)}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </Button>
              );
            })}
          </div>
          
          {betDetails && (
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground">
                <p><strong>Preview:</strong></p>
                <p className="mt-1 p-2 bg-muted rounded text-xs">
                  "{generateShareContent('preview').substring(0, 100)}..."
                </p>
              </div>
            </div>
          )}
          
          <div className="border-t pt-3">
            <Badge variant="outline" className="text-xs">
              🎯 Help grow the WeParlay community!
            </Badge>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SocialShareButton;