import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Trash2, 
  DollarSign, 
  Bitcoin, 
  Check, 
  History
} from 'lucide-react';
import CryptoBetForm from '@/components/crypto/CryptoBetForm';
import { useToast } from '@/hooks/use-toast';
import MascotTip from '@/components/onboarding/MascotTip';
import { useOnboardingContext } from '@/components/onboarding/OnboardingProvider';

interface BetSlipCryptoProps {
  bets: any[];
  odds: number;
  onClearBets: () => void;
  onPlaceBet: (betData: any) => void;
}

const BetSlipCrypto: React.FC<BetSlipCryptoProps> = ({
  bets,
  odds,
  onClearBets,
  onPlaceBet
}) => {
  const { toast } = useToast();
  const { addXp, addAchievement } = useOnboardingContext();
  const [activeTab, setActiveTab] = useState<string>('regular');
  const [showCryptoTip, setShowCryptoTip] = useState<boolean>(false);
  const [recentCryptoBets, setRecentCryptoBets] = useState<any[]>([]);
  
  // Show crypto tip when switching to crypto tab for the first time
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === 'crypto' && !showCryptoTip) {
      setShowCryptoTip(true);
      
      // Close tip after 8 seconds
      setTimeout(() => {
        setShowCryptoTip(false);
      }, 8000);
    }
  };
  
  // Handle crypto bet placement
  const handleCryptoBet = (cryptoBetData: any) => {
    // Combine bet selection data with crypto payment info
    const combinedBetData = {
      ...cryptoBetData,
      selections: bets,
      isParlay: bets.length > 1
    };
    
    // Call parent's onPlaceBet handler
    onPlaceBet(combinedBetData);
    
    // Add to recent crypto bets
    setRecentCryptoBets(prev => [combinedBetData, ...prev].slice(0, 5));
    
    // Clear bet slip
    onClearBets();
    
    // Add achievement for first crypto bet
    if (recentCryptoBets.length === 0) {
      addAchievement('First Crypto Bet');
      addXp(50);
      
      toast({
        title: "Achievement Unlocked!",
        description: "You've placed your first crypto bet! +50 XP"
      });
    }
    
    // Add achievement for using your token
    if (cryptoBetData.cryptoId === 'weplaytoken') {
      addAchievement('WePlay Token Supporter');
      addXp(25);
      
      toast({
        title: "WePlay Token Used!",
        description: "Thanks for supporting WePlay Token! +25 XP"
      });
    }
  };
  
  return (
    <div className="w-full">
      <Tabs defaultValue="regular" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="regular" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Regular
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center">
            <Bitcoin className="h-4 w-4 mr-1" />
            Crypto
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular">
          {/* Regular betting UI content */}
          <div className="text-center p-4 border border-dashed rounded-md">
            Regular betting content will be here.
          </div>
        </TabsContent>
        
        <TabsContent value="crypto">
          {showCryptoTip && (
            <div className="mb-4">
              <MascotTip
                message="You can now bet with cryptocurrencies including WePlay Token! Connect your wallet to get started."
                type="tip"
                duration={8000}
                position="top-right"
              />
            </div>
          )}
          
          {bets.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                <h3 className="font-medium mb-2 flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  Selected Bets ({bets.length})
                </h3>
                <ScrollArea className="h-[120px] mb-2">
                  <div className="space-y-2">
                    {bets.map((bet, index) => (
                      <div key={index} className="text-sm flex flex-col p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between">
                          <span className="font-medium">{bet.type || 'Moneyline'}</span>
                          <Badge className="bg-blue-500">{bet.odds}</Badge>
                        </div>
                        <div className="text-gray-500">
                          {bet.teamName || bet.selectionName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {bet.eventName || 'Event'}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Total Odds:</span>
                  <span className="font-bold">{odds.toFixed(2)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                  onClick={onClearBets}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All Selections
                </Button>
              </div>
              
              <CryptoBetForm 
                odds={odds}
                isParlay={bets.length > 1}
                onPlaceBet={handleCryptoBet}
              />
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed rounded-md">
              <Wallet className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <h3 className="font-medium text-gray-600 dark:text-gray-300">No Bets Selected</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add some bets to your slip to place a crypto bet.
              </p>
            </div>
          )}
          
          {/* Recent crypto bets section */}
          {recentCryptoBets.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <History className="h-4 w-4 mr-1" />
                Recent Crypto Bets
              </h3>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {recentCryptoBets.map((bet, index) => (
                    <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {bet.cryptoSymbol}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(bet.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-sm">
                        <span>{bet.amount} {bet.cryptoSymbol}</span>
                        <span className="font-medium text-green-600">
                          {bet.potentialPayout.toFixed(8)} {bet.cryptoSymbol}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {bet.isParlay ? 'Parlay' : 'Single'} • {bet.selections?.length || 1} selection(s)
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BetSlipCrypto;