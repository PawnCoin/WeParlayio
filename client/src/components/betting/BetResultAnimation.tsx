import React, { useState, useEffect } from 'react';
import Confetti from '../animations/Confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

interface BetResultAnimationProps {
  isWin: boolean;
  amount: number;
  odds: number;
  betType: string;
  selection: string;
  event?: string;
  onClose: () => void;
}

const BetResultAnimation: React.FC<BetResultAnimationProps> = ({
  isWin,
  amount,
  odds,
  betType,
  selection,
  event,
  onClose
}) => {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();
  
  // Calculate payout for winning bets
  const calculatePayout = () => {
    if (odds > 0) {
      return amount + (amount * (odds / 100));
    } else {
      return amount + (amount * (100 / Math.abs(odds)));
    }
  };
  
  const payout = isWin ? calculatePayout() : 0;
  
  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  
  // Automatically close after 5 seconds for wins, 3 seconds for losses
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleClose();
    }, isWin ? 5000 : 3000);
    
    return () => clearTimeout(timeout);
  }, [isWin]);
  
  // Show a toast notification
  useEffect(() => {
    if (isWin) {
      toast({
        title: "🎉 You won your bet!",
        description: `You won $${payout.toFixed(2)} from your $${amount.toFixed(2)} bet!`,
      });
    } else {
      toast({
        title: "Better luck next time",
        description: `You lost $${amount.toFixed(2)} on this bet.`,
        variant: "destructive"
      });
    }
  }, []);
  
  return (
    <>
      {/* Confetti animation for wins */}
      {isWin && <Confetti active={open} duration={5000} />}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`relative ${isWin ? 'border-green-500' : 'border-red-500'} md:max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`text-2xl ${isWin ? 'text-green-500' : 'text-red-500'} text-center`}>
              {isWin ? '🎉 Winner! 🎉' : 'Better Luck Next Time'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <div className="flex flex-col items-center justify-center mb-6">
              {isWin ? (
                <div className="text-4xl font-bold text-green-500 animate-bounce mb-2">
                  +${payout.toFixed(2)}
                </div>
              ) : (
                <div className="text-4xl font-bold text-red-500 mb-2">
                  -${amount.toFixed(2)}
                </div>
              )}
              
              <div className="text-lg text-center">
                {betType} bet on <strong>{selection}</strong>
                {event && <div className="text-sm text-muted-foreground mt-1">{event}</div>}
              </div>
            </div>
            
            {isWin && (
              <div className="flex flex-col items-center justify-center">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  <div>You bet: ${amount.toFixed(2)}</div>
                  <div>Odds: {odds > 0 ? `+${odds}` : odds}</div>
                  <div>Payout: ${payout.toFixed(2)}</div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleClose}
                className={isWin ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
              >
                {isWin ? 'Collect Winnings' : 'Continue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BetResultAnimation;