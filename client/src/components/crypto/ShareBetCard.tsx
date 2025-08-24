import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Facebook,
  Twitter,
  Copy,
  CheckCircle2,
  Share2,
  Award,
  Rocket,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareBetCardProps {
  betData: {
    cryptoId: string;
    cryptoSymbol: string;
    amount: number;
    odds: number;
    potentialPayout: number;
    selections: any[];
    isParlay: boolean;
    useBoost?: boolean;
  };
}

const ShareBetCard: React.FC<ShareBetCardProps> = ({ betData }) => {
  const { toast } = useToast();
  // Onboarding functionality removed for cleaner experience
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  
  // Generate a shareable message
  const generateShareMessage = () => {
    const betType = betData.isParlay ? 'parlay' : 'single';
    const selectionCount = betData.selections?.length || 1;
    
    let message = `I just placed a ${betType} bet of ${betData.amount} $${betData.cryptoSymbol} on WeParlay.io! `;
    
    if (betData.useBoost && betData.cryptoId === 'weplaytoken') {
      message += `Got a 5% odds boost for using $WEPT! `;
    }
    
    message += `Potential payout: ${betData.potentialPayout.toFixed(6)} $${betData.cryptoSymbol}. `;
    
    if (selectionCount > 1) {
      message += `${selectionCount} selections with combined odds of ${betData.odds.toFixed(2)}! `;
    }
    
    message += `#WeParlay #CryptoBetting #${betData.cryptoSymbol} ${betData.cryptoId === 'weplaytoken' ? '#WEPT' : ''}`;
    
    return message;
  };
  
  // Handle share to Twitter
  const shareToTwitter = () => {
    const text = encodeURIComponent(generateShareMessage());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    handleSuccessfulShare();
  };
  
  // Handle share to Facebook
  const shareToFacebook = () => {
    const text = encodeURIComponent(generateShareMessage());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://weparlay.io&quote=${text}`, '_blank');
    handleSuccessfulShare();
  };
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateShareMessage());
    setCopied(true);
    
    toast({
      title: "Copied to clipboard!",
      description: "You can now paste the bet details anywhere.",
    });
    
    setTimeout(() => setCopied(false), 3000);
    
    handleSuccessfulShare();
  };
  
  // Handle successful share
  const handleSuccessfulShare = () => {
    if (!hasShared) {
      setHasShared(true);
      
      // Add XP and achievements
      addXp(25);
      
      if (betData.cryptoId === 'weplaytoken') {
        addAchievement('WEPT Promoter');
        
        toast({
          title: "WEPT Promoter Achievement Unlocked!",
          description: "You've shared a bet using WePlay Token! +25 XP",
        });
      } else {
        addAchievement('Social Bettor');
        
        toast({
          title: "Social Bettor Achievement Unlocked!",
          description: "You've shared your crypto bet with friends! +25 XP",
        });
      }
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 shadow-lg border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Share2 className="h-5 w-5 mr-2 text-green-600" />
          Share Your Bet
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-blue-500">{betData.cryptoSymbol}</Badge>
            <Badge variant="outline" className="bg-white dark:bg-gray-900">
              {betData.isParlay ? 'Parlay' : 'Single'}
            </Badge>
            {betData.useBoost && betData.cryptoId === 'weplaytoken' && (
              <Badge className="bg-orange-500 ml-auto">
                <Rocket className="h-3 w-3 mr-1" />
                +5% Boost
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Amount:</span>
              <span className="text-sm font-semibold">{betData.amount} {betData.cryptoSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Odds:</span>
              <span className="text-sm font-semibold">{betData.odds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Potential Payout:</span>
              <span className="text-sm font-bold text-green-600">{betData.potentialPayout.toFixed(6)} {betData.cryptoSymbol}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setShowShareOptions(!showShareOptions)}
            >
              {showShareOptions ? 'Hide Options' : 'Show Share Options'}
            </Button>
            
            {betData.cryptoId === 'weplaytoken' && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">+25 XP for sharing</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardFooter className="flex justify-center gap-2 pt-0 pb-4">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white"
                onClick={shareToTwitter}
              >
                <Twitter className="h-4 w-4 mr-1.5" />
                Tweet
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-[#4267B2] hover:bg-[#365899] text-white"
                onClick={shareToFacebook}
              >
                <Facebook className="h-4 w-4 mr-1.5" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={copied ? "bg-green-600 text-white" : ""}
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ShareBetCard;