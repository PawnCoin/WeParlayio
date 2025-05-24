import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Smartphone,
  Building
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fees: string;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
  securityLevel: 'Standard' | 'High' | 'Maximum';
}

const TrustedPaymentGateways: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cashapp',
      name: 'Cash App',
      icon: <Smartphone className="h-6 w-6 text-green-600" />,
      description: 'Instant transfers with $Cashtag',
      fees: '0% for debit, 3% for credit',
      processingTime: 'Instant',
      minAmount: 1,
      maxAmount: 7500,
      securityLevel: 'High'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <Building className="h-6 w-6 text-blue-600" />,
      description: 'Secure global payments',
      fees: '2.9% + $0.30 per transaction',
      processingTime: 'Instant',
      minAmount: 1,
      maxAmount: 10000,
      securityLevel: 'Maximum'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !amount) {
      toast({
        title: "Missing information",
        description: "Please select a payment method and enter an amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiRequest('POST', '/api/payments/process', {
        method: selectedMethod,
        amount: parseFloat(amount),
        userId: user?.id
      });

      if (response.ok) {
        toast({
          title: "Payment initiated successfully!",
          description: "Your deposit is being processed securely",
        });
        
        setAmount('');
        setSelectedMethod('');
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Trusted Payment Gateways
          </CardTitle>
          <CardDescription>
            Secure, regulated payment processing with full transaction transparency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Security & Transparency</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• All payments processed through PCI DSS Level 1 certified gateways</li>
                  <li>• SSL encryption for all financial data transmission</li>
                  <li>• Real-time transaction monitoring and fraud protection</li>
                  <li>• Complete transaction history and receipts provided</li>
                  <li>• Instant email confirmations for all deposits and withdrawals</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit Funds</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deposit" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all ${
                  selectedMethod === method.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fees:</span>
                      <span className="font-medium">{method.fees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing:</span>
                      <span className="font-medium">{method.processingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Limits:</span>
                      <span className="font-medium">${method.minAmount} - ${method.maxAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedMethod && (
            <Card>
              <CardHeader>
                <CardTitle>Enter Deposit Amount</CardTitle>
                <CardDescription>
                  All transactions are encrypted and processed through secure gateways
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing || !amount}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Secure Deposit ${amount || '0.00'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Withdrawal Options</h3>
              <p className="text-muted-foreground mb-4">
                Withdraw your winnings securely through the same trusted payment methods
              </p>
              <Button variant="outline">
                Set Up Withdrawal Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrustedPaymentGateways;