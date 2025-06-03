import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, ExternalLink, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CashAppButtonProps {
  amount: number;
  description: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface CashAppPayment {
  payment_id: string;
  status: 'pending' | 'completed' | 'failed';
  payment_url?: string;
  qr_code_url?: string;
}

export default function CashAppButton({ 
  amount, 
  description, 
  onSuccess, 
  onError,
  className = "" 
}: CashAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [payment, setPayment] = useState<CashAppPayment | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const createPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cashapp/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          description
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Cash App payment');
      }

      if (data.success && data.payment) {
        setPayment(data.payment);
        toast({
          title: "Cash App Payment Created",
          description: "Use the Cash App mobile app to complete your payment",
        });
        
        // Start checking payment status
        checkPaymentStatus(data.payment.payment_id);
      }
    } catch (error) {
      console.error('Cash App payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    setIsChecking(true);
    try {
      const response = await fetch(`/api/cashapp/payment/${paymentId}/status`);
      const data = await response.json();

      if (data.success && data.payment) {
        if (data.payment.status === 'completed') {
          toast({
            title: "Payment Successful",
            description: "Your Cash App payment has been completed!",
          });
          onSuccess?.(paymentId);
          setPayment(null);
        } else if (data.payment.status === 'failed') {
          toast({
            title: "Payment Failed",
            description: "Your Cash App payment was not successful",
            variant: "destructive",
          });
          onError?.('Payment failed');
          setPayment(null);
        } else {
          // Still pending, check again in 5 seconds
          setTimeout(() => checkPaymentStatus(paymentId), 5000);
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const openCashApp = () => {
    if (payment?.payment_url) {
      window.open(payment.payment_url, '_blank');
    }
  };

  if (payment) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Cash App Payment
          </CardTitle>
          <CardDescription>
            Send ${amount.toFixed(2)} to $Lusterenllc via Cash App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              {isChecking ? 'Checking...' : 'Pending Payment'}
            </Badge>
          </div>

          {payment.qr_code_url && (
            <div className="text-center">
              <img 
                src={payment.qr_code_url} 
                alt="Cash App QR Code"
                className="mx-auto mb-4 border rounded-lg"
              />
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your Cash App mobile app
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={openCashApp}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!payment.payment_url}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Cash App
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setPayment(null)}
              className="w-full"
            >
              Cancel Payment
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Payment ID: {payment.payment_id}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={createPayment}
      disabled={isLoading || amount <= 0}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating Payment...
        </>
      ) : (
        <>
          <DollarSign className="h-4 w-4 mr-2" />
          Pay ${amount.toFixed(2)} with Cash App
        </>
      )}
    </Button>
  );
}