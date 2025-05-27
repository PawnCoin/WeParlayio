import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { BetSlipProvider } from '@/contexts/BetSlipContext';
import EnhancedBetSlip from '@/components/betting/EnhancedBetSlip';
import SavedBetSlips from '@/components/betting/SavedBetSlips';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Bookmark } from 'lucide-react';

// Wrapper component to use the context
const BettingManagerInner: React.FC = () => {
  const {
    betSlip,
    removeFromBetSlip,
    clearBetSlip,
    placeBet,
    saveBetSlip,
    shareBetSlip
  } = useBetSlip();
  
  return (
    <Tabs defaultValue="bet-slip">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="bet-slip" className="flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          Bet Slip
        </TabsTrigger>
        <TabsTrigger value="saved-slips" className="flex items-center">
          <Bookmark className="h-4 w-4 mr-1" />
          Saved Slips
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="bet-slip">
        <EnhancedBetSlip 
          betSlip={betSlip}
          onRemoveBet={removeFromBetSlip}
          onClearBetSlip={clearBetSlip}
          onPlaceBet={placeBet}
          onSaveBetSlip={saveBetSlip}
          onShareBetSlip={shareBetSlip}
        />
      </TabsContent>
      
      <TabsContent value="saved-slips">
        <SavedBetSlips />
      </TabsContent>
    </Tabs>
  );
};

// Main component wrapping with context provider
const BettingManager: React.FC = () => {
  return (
    <BetSlipProvider>
      <BettingManagerInner />
    </BetSlipProvider>
  );
};

export default BettingManager;