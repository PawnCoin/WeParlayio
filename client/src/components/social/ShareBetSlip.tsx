import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Twitter, Facebook, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShareBetSlipProps {
  betSlip: any[]; // Replace with proper type
  totalOdds: number;
  potentialPayout: number;
  betAmount: string;
  betType: string;
}

const ShareBetSlip: React.FC<ShareBetSlipProps> = ({
  betSlip,
  totalOdds,
  potentialPayout,
  betAmount,
  betType
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  
  // Generate share URL
  const generateShareUrl = () => {
    // This would typically create a server-side saved bet slip and return a unique URL
    // For demo, we'll just encode some basic info in the URL
    const betsInfo = betSlip.map(bet => `${bet.pick} (${bet.odds > 0 ? '+' : ''}${bet.odds})`).join(',');
    const encodedInfo = encodeURIComponent(`${betType}|${betsInfo}|${betAmount}|${potentialPayout.toFixed(2)}`);
    const url = `${window.location.origin}/shared-bet/${encodedInfo}`;
    setShareUrl(url);
    return url;
  };
  
  // Copy to clipboard
  const copyToClipboard = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Link to your bet slip has been copied to clipboard",
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    });
  };
  
  // Share on social media
  const shareOnSocial = (platform: string) => {
    const url = generateShareUrl();
    let shareUrl = '';
    const text = `Check out my ${betType} bet slip on WeParlay! Potential payout: $${potentialPayout.toFixed(2)}`;
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Check out my bet slip')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    setOpen(false);
    
    toast({
      title: `Shared on ${platform}`,
      description: `Your bet slip has been shared on ${platform}`,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateShareUrl()}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share bet slip with friends</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Bet Slip</DialogTitle>
          <DialogDescription>
            Share your {betType} bet slip with friends and social media
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Bet Slip Summary</div>
            <div className="bg-muted p-3 rounded-md text-sm">
              <div className="mb-2"><span className="font-medium">Type:</span> {betType} bet</div>
              <div className="mb-2"><span className="font-medium">Amount:</span> ${betAmount}</div>
              <div className="mb-2"><span className="font-medium">Total Odds:</span> {totalOdds > 0 ? '+' : ''}{totalOdds.toFixed(2)}</div>
              <div><span className="font-medium">Potential Payout:</span> ${potentialPayout.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className="grid flex-1 gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="w-full"
              />
            </div>
            <Button type="submit" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => shareOnSocial('twitter')}>
              <Twitter className="h-4 w-4 mr-1 text-blue-400" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" onClick={() => shareOnSocial('facebook')}>
              <Facebook className="h-4 w-4 mr-1 text-blue-600" />
              Facebook
            </Button>
            <Button variant="outline" size="sm" onClick={() => shareOnSocial('email')}>
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button variant="default" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareBetSlip;