import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Twitter, Facebook, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// Define the bet interface
interface Bet {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'moneyline' | 'spread' | 'total';
  pick: string;
  odds: number;
  point?: number;
}

interface ShareBetSlipProps {
  betSlip: Bet[];
  totalOdds: number;
  potentialPayout: number;
  betAmount: string;
  betType: 'single' | 'parlay';
}

const ShareBetSlip: React.FC<ShareBetSlipProps> = ({
  betSlip,
  totalOdds,
  potentialPayout,
  betAmount,
  betType
}) => {
  const { toast } = useToast();
  const [shareMethod, setShareMethod] = useState<'link' | 'social' | 'message'>('link');
  const [shareMessage, setShareMessage] = useState<string>('Check out my bet slip on WeParlay!');
  const [includeOdds, setIncludeOdds] = useState<boolean>(true);
  const [includePayout, setIncludePayout] = useState<boolean>(true);
  const [friendEmail, setFriendEmail] = useState<string>('');

  // Format odds for display
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  // Generate shareable bet slip text
  const generateShareableText = () => {
    let text = shareMessage ? `${shareMessage}\n\n` : 'Check out my bet slip on WeParlay!\n\n';
    
    text += `${betType === 'parlay' ? 'Parlay' : 'Single'} Bet${betSlip.length > 1 ? 's' : ''}\n`;
    
    betSlip.forEach((bet, index) => {
      text += `${index + 1}. ${bet.pick} (${bet.homeTeam} vs ${bet.awayTeam})`;
      if (includeOdds) {
        text += ` @ ${formatOdds(bet.odds)}`;
      }
      text += '\n';
    });
    
    if (includePayout) {
      text += `\nBet Amount: $${betAmount}`;
      text += `\nPotential Payout: $${potentialPayout.toFixed(2)}`;
    }
    
    text += '\n\nJoin me on WeParlay.io to place your own bets!';
    
    return text;
  };

  // Generate shareable link (would be replaced with actual API call in production)
  const generateShareableLink = () => {
    // This would be a real API call to create a shareable link with a unique ID
    const betSlipId = Math.random().toString(36).substring(2, 15);
    return `https://weparlay.io/shared-bets/${betSlipId}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Your bet slip has been copied to clipboard.",
    });
  };

  // Share to social media
  const shareToSocial = (platform: 'twitter' | 'facebook') => {
    const text = encodeURIComponent(generateShareableText());
    const url = encodeURIComponent('https://weparlay.io');
    
    let shareUrl = '';
    
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${text}&u=${url}`;
    }
    
    window.open(shareUrl, '_blank');
  };

  // Send message to friend
  const sendMessageToFriend = () => {
    if (!friendEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your friend's email address.",
        variant: "destructive",
      });
      return;
    }
    
    // This would be a real API call to send an email or message
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: `Your bet slip has been shared with ${friendEmail}.`,
      });
      setFriendEmail('');
    }, 1000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Share2 className="h-4 w-4" />
          Share Bet Slip
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Bet Slip</DialogTitle>
          <DialogDescription>
            Share your bet slip with friends to compare picks and strategies.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" onValueChange={(value) => setShareMethod(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="text-xs">
              <LinkIcon className="h-3 w-3 mr-1" />
              Copy Link
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs">
              <Twitter className="h-3 w-3 mr-1" />
              Social
            </TabsTrigger>
            <TabsTrigger value="message" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Message
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 mb-3">
            <div className="space-y-2">
              <Label htmlFor="shareMessage">Custom Message (Optional)</Label>
              <Textarea
                id="shareMessage"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add a personal message to your shared bet slip"
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeOdds"
                  checked={includeOdds}
                  onCheckedChange={setIncludeOdds}
                />
                <Label htmlFor="includeOdds" className="text-xs">Include Odds</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="includePayout"
                  checked={includePayout}
                  onCheckedChange={setIncludePayout}
                />
                <Label htmlFor="includePayout" className="text-xs">Include Payout</Label>
              </div>
            </div>
          </div>
          
          <Card className="border border-dashed border-muted-foreground/25 bg-background my-3">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground whitespace-pre-line">
                <strong>Preview:</strong>
                <pre className="mt-2 font-sans overflow-auto max-h-40">
                  {generateShareableText()}
                </pre>
              </div>
            </CardContent>
          </Card>
          
          <TabsContent value="link" className="pt-2">
            <div className="flex space-x-2">
              <Input
                readOnly
                value={generateShareableLink()}
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={() => copyToClipboard(generateShareableLink())}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You can also copy the full bet slip text to share anywhere:
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generateShareableText())}
              className="w-full mt-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Bet Slip Text
            </Button>
          </TabsContent>
          
          <TabsContent value="social" className="pt-2">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => shareToSocial('twitter')}
                className="flex-1"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => shareToSocial('facebook')}
                className="flex-1"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="message" className="pt-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="friendEmail">Friend's Email</Label>
                <Input
                  id="friendEmail"
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
              
              <Button
                onClick={sendMessageToFriend}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Bet Slip
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <div className="w-full text-xs text-muted-foreground">
            Sharing your bet slip does not place any bets for your friends.
            They will need to create their own slip on WeParlay.io.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareBetSlip;