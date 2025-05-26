import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Crown, Star, Award, Trophy } from 'lucide-react';

interface TierPurchaseFlowProps {
  selectedTier: string;
  onPurchaseComplete: () => void;
}

const TierPurchaseFlow: React.FC<TierPurchaseFlowProps> = ({ selectedTier, onPurchaseComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const tierPrices = {
    bronze: 9.99,
    silver: 24.99,
    gold: 49.99,
    platinum: 99.99
  };

  const tierIcons = {
    bronze: <Trophy className="h-5 w-5" />,
    silver: <Star className="h-5 w-5" />,
    gold: <Award className="h-5 w-5" />,
    platinum: <Crown className="h-5 w-5" />
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent for tier purchase
      const response = await apiRequest("POST", "/api/tier/purchase", {
        tier: selectedTier,
        amount: tierPrices[selectedTier as keyof typeof tierPrices]
      });

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/vip?purchase=success&tier=${selectedTier}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Tier Upgraded!",
          description: `Welcome to ${selectedTier.toUpperCase()} membership!`,
        });
        onPurchaseComplete();
      }
    } catch (error: any) {
      toast({
        title: "Purchase Error",
        description: error.message || "Failed to process tier upgrade",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {tierIcons[selectedTier as keyof typeof tierIcons]}
          Upgrade to {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span>Tier:</span>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {selectedTier.toUpperCase()} MEMBER
            </Badge>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span>Price:</span>
            <span className="text-2xl font-bold">
              ${tierPrices[selectedTier as keyof typeof tierPrices]}/month
            </span>
          </div>
        </div>

        <form onSubmit={handlePurchase}>
          <PaymentElement />
          
          <Button 
            type="submit" 
            className="w-full mt-4"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Upgrade for $${tierPrices[selectedTier as keyof typeof tierPrices]}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TierPurchaseFlow;