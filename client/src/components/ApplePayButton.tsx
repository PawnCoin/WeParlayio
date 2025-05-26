// Apple Pay Integration for WeParlay Platform
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone } from 'lucide-react';

interface ApplePayButtonProps {
  amount: number;
  currency?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export default function ApplePayButton({ 
  amount, 
  currency = 'USD',
  onSuccess,
  onError 
}: ApplePayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleApplePay = async () => {
    setIsProcessing(true);

    try {
      // Check if Apple Pay is available
      if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
        throw new Error('Apple Pay is not available on this device');
      }

      // Create Apple Pay session
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: currency,
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'WeParlay Betting',
          amount: amount.toFixed(2),
          type: 'final'
        }
      };

      const session = new ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event) => {
        // Validate merchant with your server
        const response = await fetch('/api/apple-pay/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ validationURL: event.validationURL })
        });
        
        const merchantSession = await response.json();
        session.completeMerchantValidation(merchantSession);
      };

      session.onpaymentauthorized = async (event) => {
        // Process payment with your server
        const response = await fetch('/api/apple-pay/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment: event.payment,
            amount: amount
          })
        });

        const result = await response.json();

        if (result.success) {
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          onSuccess?.(result);
          toast({
            title: "Payment Successful!",
            description: `$${amount} added to your WeParlay account`,
          });
        } else {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          throw new Error(result.error || 'Payment failed');
        }
      };

      session.begin();

    } catch (error) {
      console.error('Apple Pay error:', error);
      onError?.(error);
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process Apple Pay payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if Apple Pay is supported
  const isApplePaySupported = typeof window !== 'undefined' && 
    window.ApplePaySession && 
    ApplePaySession.canMakePayments();

  if (!isApplePaySupported) {
    return (
      <Button disabled variant="outline" className="w-full">
        <CreditCard className="mr-2 h-4 w-4" />
        Apple Pay Not Available
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleApplePay}
      disabled={isProcessing}
      className="w-full bg-black text-white hover:bg-gray-800"
    >
      <Smartphone className="mr-2 h-4 w-4" />
      {isProcessing ? 'Processing...' : `Pay $${amount} with Apple Pay`}
    </Button>
  );
}

// Declare global Apple Pay types
declare global {
  interface Window {
    ApplePaySession: any;
  }
}