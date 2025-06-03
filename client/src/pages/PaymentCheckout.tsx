import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  subscriptionId: string;
  clientSecret: string;
}

function CheckoutForm({ subscriptionId, clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/tier-upgrade-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <Card className="max-w-md w-full bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/upgrade-tier')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-white">Complete Your Upgrade</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-sm text-gray-400 mb-4">
              Subscription ID: {subscriptionId}
            </div>
            
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
            />
            
            <Button 
              type="submit" 
              disabled={!stripe || isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Complete Upgrade'
              )}
            </Button>
            
            <div className="text-xs text-gray-500 text-center">
              Your payment is secured by Stripe. By completing this purchase, you agree to our terms of service.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCheckout() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const subscription = urlParams.get('subscription');
    const secret = urlParams.get('client_secret');

    if (!subscription || !secret) {
      toast({
        title: "Invalid Payment Link",
        description: "This payment link is invalid or expired.",
        variant: "destructive",
      });
      setLocation('/upgrade-tier');
      return;
    }

    setSubscriptionId(subscription);
    setClientSecret(secret);
  }, [setLocation, toast]);

  if (!clientSecret || !subscriptionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white">Loading payment...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#ea580c',
            colorBackground: '#111827',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
          }
        }
      }}
    >
      <CheckoutForm subscriptionId={subscriptionId} clientSecret={clientSecret} />
    </Elements>
  );
}