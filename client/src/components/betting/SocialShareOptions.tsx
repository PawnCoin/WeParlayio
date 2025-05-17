import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Share, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareOptionsProps {
  challengeUrl: string;
  challengeTitle: string;
  onShare?: (platform: string) => void;
}

const SocialShareOptions: React.FC<SocialShareOptionsProps> = ({
  challengeUrl,
  challengeTitle,
  onShare
}) => {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [customMessage, setCustomMessage] = useState(`I'm challenging you to a bet on ${challengeTitle}. Join WeParlay and accept my challenge!`);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    
    toast({
      title: "Link copied",
      description: "Challenge link copied to clipboard",
    });
    
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const shareUrl = encodeURIComponent(challengeUrl);
  const shareTitle = encodeURIComponent(`Bet Challenge: ${challengeTitle}`);
  const shareText = encodeURIComponent(customMessage);
  
  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
      color: 'bg-[#1877F2]/10 text-[#1877F2]'
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1DA1F2">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      color: 'bg-[#1DA1F2]/10 text-[#1DA1F2]'
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      color: 'bg-[#25D366]/10 text-[#25D366]'
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0088CC">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.697.064-1.226-.496-1.9-.968-.945-.655-1.476-1.061-2.392-1.7-.982-.739-.346-1.144.215-1.808.145-.172 2.684-2.66 2.73-2.882.007-.041.001-.075-.033-.105-.033-.031-.087-.02-.123-.012-.052.011-2.306 1.596-3.222 2.199a.563.563 0 0 1-.313.089.56.56 0 0 1-.313-.088c-.857-.452-1.899-.996-1.899-.996-.52-.109-.654-.325-.235-.518 0 0 .636-.671 2.728-2.904 1.678-1.789 2.361-2.519 2.65-2.838a1.81 1.81 0 0 1 .356-.354c.326-.21.737-.298.896-.264z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
      color: 'bg-[#0088CC]/10 text-[#0088CC]'
    },
    {
      name: 'Discord',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#7289DA">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
        </svg>
      ),
      url: `https://discord.com/channels/@me`,
      color: 'bg-[#7289DA]/10 text-[#7289DA]',
      isApp: true
    },
    {
      name: 'Email',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      url: `mailto:?subject=${shareTitle}&body=${shareText}%20${shareUrl}`,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
      name: 'SMS',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      url: `sms:?&body=${shareText}%20${shareUrl}`,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      isApp: true
    }
  ];
  
  const handleShare = (platform: string, url: string, isApp: boolean = false) => {
    if (onShare) {
      onShare(platform);
    }
    
    if (navigator.share && !isApp) {
      navigator.share({
        title: `Bet Challenge: ${challengeTitle}`,
        text: customMessage,
        url: challengeUrl
      }).catch(error => {
        window.open(url, '_blank');
      });
    } else {
      window.open(url, '_blank');
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="social">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="link">Share Link</TabsTrigger>
        </TabsList>
        
        <TabsContent value="social" className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialPlatforms.slice(0, 4).map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                className={`flex flex-col h-20 ${platform.color} border-2 hover:border-primary hover:bg-primary/5`}
                onClick={() => handleShare(platform.name, platform.url, platform.isApp)}
              >
                <div className="mb-2">{platform.icon}</div>
                <span className="text-xs">{platform.name}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="messaging" className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialPlatforms.slice(4).map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                className={`flex flex-col h-20 ${platform.color} border-2 hover:border-primary hover:bg-primary/5`}
                onClick={() => handleShare(platform.name, platform.url, platform.isApp)}
              >
                <div className="mb-2">{platform.icon}</div>
                <span className="text-xs">{platform.name}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="link" className="pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Challenge Link</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  value={challengeUrl}
                  readOnly
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => copyToClipboard(challengeUrl)}
                >
                  {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Bet Challenge: ${challengeTitle}`,
                      text: customMessage,
                      url: challengeUrl
                    });
                  } else {
                    copyToClipboard(challengeUrl);
                  }
                }}
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Customized Message</label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write a custom message to go with your challenge link..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="border rounded-lg p-3 bg-muted/30">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <LinkIcon className="h-4 w-4 mr-1" />
              Direct Link Preview
            </h4>
            <div className="p-3 border rounded-lg bg-background">
              <p className="text-sm">{customMessage}</p>
              <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                <ExternalLink className="h-3 w-3 mr-1" />
                {new URL(challengeUrl).hostname}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="pt-2 text-xs text-muted-foreground">
        <p>Sharing this link will invite your friend to join WeParlay and accept your head-to-head bet challenge.</p>
      </div>
    </div>
  );
};

export default SocialShareOptions;