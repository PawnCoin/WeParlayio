import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DollarSign, CreditCard, Wallet, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

const EnhancedDepositWithdraw: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');

  // Mock deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'Deposit successful' };
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful",
        description: "Your funds have been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/overview'] });
      setDepositAmount('');
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Mock withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'Withdrawal successful' };
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/overview'] });
      setWithdrawAmount('');
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount && amount >= 10) {
      depositMutation.mutate({ amount, method: selectedMethod });
    } else {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit is $10.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount && amount >= 10) {
      withdrawMutation.mutate({ amount, method: selectedMethod });
    } else {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal is $10.",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="deposit" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="deposit">
          <ArrowUpCircle className="h-4 w-4 mr-2" />
          Deposit
        </TabsTrigger>
        <TabsTrigger value="withdraw">
          <ArrowDownCircle className="h-4 w-4 mr-2" />
          Withdraw
        </TabsTrigger>
      </TabsList>

      <TabsContent value="deposit">
        <Card>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add money to your WeParlay account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="10"
                max="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-method">Payment Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit/Debit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleDeposit} 
              disabled={depositMutation.isPending}
              className="w-full"
            >
              {depositMutation.isPending ? 'Processing...' : 'Deposit Funds'}
            </Button>

            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              Minimum: $10, Maximum: $5,000
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="withdraw">
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Transfer money from your WeParlay account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-method">Withdrawal Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Debit Card
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleWithdraw} 
              disabled={withdrawMutation.isPending}
              className="w-full"
            >
              {withdrawMutation.isPending ? 'Processing...' : 'Withdraw Funds'}
            </Button>

            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              Processing time: 1-3 business days
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default EnhancedDepositWithdraw;