import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Crown, Star, Award, Trophy, CreditCard, CheckCircle } from 'lucide-react';

interface TierPurchaseFlowProps {
  selectedTier: string;
  onPurchaseComplete: () => void;
}

const TierPurchaseFlow: React.FC<TierPurchaseFlowProps> = ({ selectedTier, onPurchaseComplete }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [tierData, setTierData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'demo'>('demo');
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const tierPrices = {
    bronze: 0,
    silver: 9.99,
    gold: 19.99,
    platinum: 39.99
  };

  const tierIcons = {
    bronze: <Trophy className="h-5 w-5" />,
    silver: <Star className="h-5 w-5" />,
    gold: <Award className="h-5 w-5" />,
    platinum: <Crown className="h-5 w-5" />
  };

  useEffect(() => {
    const fetchTierData = async () => {
      try {
        const response = await apiRequest('GET', '/api/tier/pricing') as any;
        if (response.success) {
          const tier = response.tiers.find((t: any) => t.id === selectedTier);
          setTierData(tier);
        }
      } catch (error) {
        console.error('Error fetching tier data:', error);
      }
    };
    fetchTierData();
  }, [selectedTier]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await apiRequest('POST', '/api/tier/purchase', {
        tier: selectedTier,
        paymentMethod: paymentMethod,
        stripePaymentIntentId: paymentMethod === 'demo' ? `demo_${Date.now()}` : undefined
      }) as any;

      if (response.success) {
        setPurchaseComplete(true);
        toast({
          title: 'Tier Upgraded!',
          description: response.message,
          variant: 'default'
        });
        
        setTimeout(() => {
          onPurchaseComplete();
        }, 2000);
      } else {
        toast({
          title: 'Purchase Failed',
          description: response.message || 'Failed to process tier upgrade',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Purchase Error',
        description: error.message || 'Failed to process tier upgrade',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (purchaseComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-700 mb-2">Upgrade Successful!</h3>
          <p className="text-gray-600">
            Welcome to {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} tier!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You now have access to all premium features.
          </p>
        </CardContent>
      </Card>
    );
  }

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

        <div className="space-y-4">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method:</label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'demo' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('demo')}
                className="justify-start"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Demo Purchase (No Payment Required)
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('stripe')}
                className="justify-start"
                disabled
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Credit Card (Coming Soon)
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('paypal')}
                className="justify-start"
                disabled
              >
                <CreditCard className="h-4 w-4 mr-2" />
                PayPal (Coming Soon)
              </Button>
            </div>
          </div>

          <form onSubmit={handlePurchase}>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Upgrade for $${tierPrices[selectedTier as keyof typeof tierPrices]}/month`}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierPurchaseFlow;