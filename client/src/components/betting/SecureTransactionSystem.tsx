import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  CreditCard, 
  Wallet, 
  ChevronsUpDown, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Info, 
  Lock, 
  ExternalLink,
  RefreshCw,
  DollarSign,
  Bitcoin
} from 'lucide-react';
import BettingCompliance from '@/components/betting/BettingCompliance';

interface SecureTransactionSystemProps {
  defaultAmount?: number;
  isDeposit?: boolean;
  onTransactionComplete?: (success: boolean, amount: number, transactionId: string) => void;
  onCancel?: () => void;
}

const SecureTransactionSystem: React.FC<SecureTransactionSystemProps> = ({
  defaultAmount = 50,
  isDeposit = true,
  onTransactionComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState<string>('creditCard');
  const [cryptoType, setCryptoType] = useState<string>('bitcoin');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [isComplianceVerified, setIsComplianceVerified] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>(isDeposit ? 'deposit' : 'withdraw');
  const [transactionId, setTransactionId] = useState<string>('');
  
  const popularAmounts = [25, 50, 100, 250, 500, 1000];
  
  // Simulate API call for processing a transaction
  const processTransaction = async () => {
    if (!isComplianceVerified) {
      toast({
        title: "Compliance Check Failed",
        description: "Please complete all compliance requirements before proceeding.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setTransactionStatus('processing');
    setProcessingProgress(0);
    
    // Generate a unique transaction ID
    const newTransactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setTransactionId(newTransactionId);
    
    // Simulate transaction processing with progress updates
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 15);
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 500);
    
    // Simulate transaction completion after a delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // 95% chance of success for demo purposes
      const isSuccess = Math.random() < 0.95;
      
      if (isSuccess) {
        setTransactionStatus('success');
        
        toast({
          title: `${isDeposit ? 'Deposit' : 'Withdrawal'} Successful`,
          description: `$${amount.toFixed(2)} has been ${isDeposit ? 'added to' : 'withdrawn from'} your account.`,
          variant: "default"
        });
        
        if (onTransactionComplete) {
          onTransactionComplete(true, amount, newTransactionId);
        }
      } else {
        setTransactionStatus('error');
        
        toast({
          title: `${isDeposit ? 'Deposit' : 'Withdrawal'} Failed`,
          description: "There was an issue processing your transaction. Please try again.",
          variant: "destructive"
        });
        
        if (onTransactionComplete) {
          onTransactionComplete(false, 0, newTransactionId);
        }
      }
      
      setIsProcessing(false);
    }, 3000);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAmount(value);
    } else {
      setAmount(0);
    }
  };
  
  const handleComplianceVerified = (isVerified: boolean) => {
    setIsComplianceVerified(isVerified);
  };
  
  // Format the selected crypto for display
  const getCryptoDetails = () => {
    const cryptoOptions = {
      bitcoin: { name: "Bitcoin", symbol: "BTC", icon: <Bitcoin className="h-4 w-4" /> },
      ethereum: { name: "Ethereum", symbol: "ETH", icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 12.2222L12 16.5L21 12.2222L12 2Z" fill="currentColor" /><path d="M12 16.5V22L21 12.2222L12 16.5Z" fill="currentColor" /><path d="M12 16.5L3 12.2222L12 22V16.5Z" fill="currentColor" /><path d="M12 9.5L3 12.2222L12 16.5L21 12.2222L12 9.5Z" fill="currentColor" /></svg> },
      litecoin: { name: "Litecoin", symbol: "LTC", icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm-.262,3.678h2.584a.343.343,0,0,1,.331.436L12.437,14.2l1.89-.633L13.6,15.5l-1.926.637L10.8,18.164H16.5l-.491,1.637H7.4a.343.343,0,0,1-.327-.437l2.259-7.513-1.89.633.726-1.931,1.891-.633.971-3.236,0-.013Z" /></svg> },
      usdc: { name: "USD Coin", symbol: "USDC", icon: <DollarSign className="h-4 w-4" /> },
      weplaytoken: { name: "WePlay Token", symbol: "WPLY", icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg> }
    };
    
    return cryptoOptions[cryptoType as keyof typeof cryptoOptions] || cryptoOptions.bitcoin;
  };
  
  const cryptoDetails = getCryptoDetails();
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          {isDeposit ? (
            <>
              <ChevronsUpDown className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Secure Funds Transfer
            </>
          ) : (
            <>
              <ChevronsUpDown className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Withdraw Funds
            </>
          )}
        </CardTitle>
        <CardDescription>
          Securely manage your WeParlay balance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pl-8"
                  min={5}
                  step={1}
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {popularAmounts.map((value) => (
                  <Button 
                    key={value} 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAmount(value)}
                    className={amount === value ? "border-primary bg-primary/10" : ""}
                  >
                    ${value}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <Tabs defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="creditCard" className="flex items-center justify-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="flex items-center justify-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Crypto
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="creditCard" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Card Information</label>
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium">Secure Payment</span>
                        </div>
                        <div className="flex space-x-1">
                          <svg className="h-5 w-7" viewBox="0 0 32 21" fill="none">
                            <rect width="32" height="21" rx="3" fill="#1A1A1A"/>
                            <path d="M10.151 7.441C9.457 7.85 9.027 8.565 9.027 9.386C9.027 10.623 10.031 11.626 11.267 11.626H14.147C14.328 11.626 14.474 11.772 14.474 11.953C14.474 12.134 14.328 12.28 14.147 12.28H11.267C9.671 12.28 8.373 10.982 8.373 9.386C8.373 8.317 8.94 7.376 9.835 6.856C10.235 6.615 10.703 6.466 11.204 6.438C12.04 6.391 12.855 6.604 13.513 7.04L13.891 7.28L13.909 7.292C14.057 7.404 14.073 7.615 13.952 7.754C13.836 7.889 13.635 7.906 13.496 7.793L13.483 7.786L13.1 7.542C12.585 7.196 11.96 7.027 11.316 7.063C10.91 7.086 10.51 7.207 10.151 7.441Z" fill="white"/>
                            <path d="M15.834 8.2C16.015 8.2 16.161 8.346 16.161 8.527C16.161 8.708 16.015 8.854 15.834 8.854H14.18C13.999 8.854 13.853 8.708 13.853 8.527C13.853 8.346 13.999 8.2 14.18 8.2H15.834Z" fill="white"/>
                            <path d="M15.834 9.713C16.015 9.713 16.161 9.859 16.161 10.04C16.161 10.221 16.015 10.367 15.834 10.367H14.18C13.999 10.367 13.853 10.221 13.853 10.04C13.853 9.859 13.999 9.713 14.18 9.713H15.834Z" fill="white"/>
                            <path d="M22.826 8.2C23.007 8.2 23.153 8.346 23.153 8.527C23.153 8.708 23.007 8.854 22.826 8.854H21.173C20.992 8.854 20.846 8.708 20.846 8.527C20.846 8.346 20.992 8.2 21.173 8.2H22.826Z" fill="white"/>
                            <path d="M22.826 9.713C23.007 9.713 23.153 9.859 23.153 10.04C23.153 10.221 23.007 10.367 22.826 10.367H21.173C20.992 10.367 20.846 10.221 20.846 10.04C20.846 9.859 20.992 9.713 21.173 9.713H22.826Z" fill="white"/>
                            <path d="M15.834 11.226C16.015 11.226 16.161 11.372 16.161 11.553C16.161 11.734 16.015 11.88 15.834 11.88H14.18C13.999 11.88 13.853 11.734 13.853 11.553C13.853 11.372 13.999 11.226 14.18 11.226H15.834Z" fill="white"/>
                            <path d="M19.819 12.28H16.939C16.758 12.28 16.612 12.134 16.612 11.953C16.612 11.772 16.758 11.626 16.939 11.626H19.819C21.055 11.626 22.059 10.623 22.059 9.386C22.059 8.565 21.629 7.85 20.935 7.441C20.576 7.207 20.176 7.086 19.77 7.063C19.126 7.027 18.501 7.196 17.986 7.542L17.603 7.786L17.59 7.793C17.451 7.906 17.25 7.889 17.134 7.754C17.013 7.615 17.029 7.404 17.177 7.292L17.195 7.28L17.574 7.04C18.231 6.604 19.046 6.391 19.882 6.438C20.383 6.466 20.851 6.615 21.251 6.856C22.146 7.376 22.712 8.317 22.712 9.386C22.712 10.982 21.415 12.28 19.819 12.28Z" fill="white"/>
                            <path d="M22.826 11.226C23.007 11.226 23.153 11.372 23.153 11.553C23.153 11.734 23.007 11.88 22.826 11.88H21.173C20.992 11.88 20.846 11.734 20.846 11.553C20.846 11.372 20.992 11.226 21.173 11.226H22.826Z" fill="white"/>
                            <path d="M19.351 14.5C19.532 14.5 19.678 14.646 19.678 14.827C19.678 15.008 19.532 15.154 19.351 15.154H17.699C17.518 15.154 17.372 15.008 17.372 14.827C17.372 14.646 17.518 14.5 17.699 14.5H19.351Z" fill="white"/>
                            <path d="M19.351 13.8C19.532 13.8 19.678 13.946 19.678 14.127C19.678 14.308 19.532 14.454 19.351 14.454H16.939C16.758 14.454 16.612 14.308 16.612 14.127C16.612 13.946 16.758 13.8 16.939 13.8H19.351Z" fill="white"/>
                          </svg>
                          <svg className="h-5 w-7" viewBox="0 0 32 21" fill="none">
                            <rect width="32" height="21" rx="3" fill="#3C58BF"/>
                            <rect width="32" height="21" rx="3" fill="url(#paint0_linear_2180_28386)"/>
                            <path d="M12.397 14.376H10.529L9.13965 9.34179C9.08525 9.14902 8.97213 8.97688 8.79963 8.88911C8.33659 8.67348 7.82617 8.50134 7.26953 8.41357V8.2H10.0819C10.4818 8.2 10.7503 8.50134 10.7964 8.80134L11.5039 12.3549L13.2419 8.2H15.0569L12.397 14.376ZM15.7643 14.376H13.9955L15.4574 8.2H17.2261L15.7643 14.376ZM19.4458 10.4045C19.4458 9.96242 19.8457 9.69107 20.3857 9.69107C21.1393 9.64732 21.9389 9.8192 22.6002 10.2174L22.9539 8.50134C22.2925 8.19973 21.5851 8.05759 20.9236 8.05759C19.2318 8.05759 18.0314 8.94509 18.0314 10.2629C18.0314 11.2415 18.8773 11.7291 19.4919 12.0308C20.1533 12.3324 20.4218 12.5451 20.3779 12.847C20.3779 13.2854 19.8918 13.4833 19.4043 13.4833C18.7428 13.4833 18.0776 13.2814 17.5069 12.9799L17.1532 14.6959C17.77 14.9975 18.4312 15.1396 19.0464 15.1396C20.9236 15.1836 22.0779 14.2961 22.0779 12.8868C22.0779 10.9925 19.4458 10.8603 19.4458 10.4045ZM27.1934 14.376L25.7776 8.2H24.1936C23.8861 8.2 23.6176 8.4156 23.5253 8.71723L21.0991 14.376H22.9154L23.2691 13.394H25.4629L25.6436 14.376H27.1934ZM23.7579 11.8657L24.5115 9.51924L24.9106 11.8657H23.7579Z" fill="white"/>
                            <defs>
                            <linearGradient id="paint0_linear_2180_28386" x1="16" y1="0" x2="16" y2="21" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#3C58BF"/>
                            <stop offset="1" stop-color="#293688"/>
                            </linearGradient>
                            </defs>
                          </svg>
                          <svg className="h-5 w-7" viewBox="0 0 32 21" fill="none">
                            <rect width="32" height="21" rx="3" fill="#D8D8D8"/>
                            <path d="M16.0031 15.6129C18.5909 15.6129 20.6921 13.5117 20.6921 10.9239C20.6921 8.3361 18.5909 6.23492 16.0031 6.23492C13.4153 6.23492 11.3141 8.3361 11.3141 10.9239C11.3141 13.5117 13.4153 15.6129 16.0031 15.6129Z" fill="#D8D8D8"/>
                            <path d="M12.8906 6.98592H19.2906V14.6759H12.8906V6.98592Z" fill="#D8D8D8"/>
                            <path d="M13.2207 10.9239C13.2207 9.38993 14.4691 8.14159 16.0031 8.14159C17.5371 8.14159 18.7854 9.38993 18.7854 10.9239C18.7854 12.4579 17.5371 13.7063 16.0031 13.7063C14.4691 13.7063 13.2207 12.4579 13.2207 10.9239Z" fill="#EB001B"/>
                            <path d="M16.0031 8.14159C17.5371 8.14159 18.7854 9.38993 18.7854 10.9239C18.7854 12.4579 17.5371 13.7063 16.0031 13.7063C14.4691 13.7063 13.2207 12.4579 13.2207 10.9239" fill="#F79E1B"/>
                            <path opacity="0.5" d="M12.8906 6.98592H19.2906V14.6759H12.8906V6.98592Z" fill="white"/>
                            <path d="M13.2207 10.924C13.2207 9.39004 14.4691 8.1417 16.0031 8.1417C17.5371 8.1417 18.7854 9.39004 18.7854 10.924C18.7854 12.458 17.5371 13.7064 16.0031 13.7064C14.4691 13.7064 13.2207 12.458 13.2207 10.924Z" fill="#EB001B"/>
                            <path d="M16.0031 8.1417C17.5371 8.1417 18.7854 9.39004 18.7854 10.924C18.7854 12.458 17.5371 13.7064 16.0031 13.7064C14.4691 13.7064 13.2207 12.458 13.2207 10.924" fill="#F79E1B"/>
                          </svg>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground py-1">
                        Card details are securely processed and stored by our payment provider in compliance with PCI-DSS standards.
                      </p>
                      
                      <Button className="w-full mt-2" variant="outline">
                        Use Saved Card
                      </Button>
                      
                      <div className="text-center mt-2">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-xs text-blue-600 dark:text-blue-400"
                        >
                          Add a new card
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Cryptocurrency</label>
                    <Select value={cryptoType} onValueChange={setCryptoType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                        <SelectItem value="litecoin">Litecoin (LTC)</SelectItem>
                        <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                        <SelectItem value="weplaytoken">WePlay Token (WPLY) +5% Bonus</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {cryptoType === 'weplaytoken' && (
                      <Alert className="mt-2 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                        <Info className="h-4 w-4" />
                        <AlertTitle>5% Bonus</AlertTitle>
                        <AlertDescription>
                          Get 5% extra when depositing with WePlay Token!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 border p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center">
                        {cryptoDetails.icon}
                        <span className="ml-2 font-medium">{cryptoDetails.name}</span>
                      </div>
                      <div>
                        <Badge variant="outline">
                          {cryptoDetails.symbol}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Processing state */}
            {transactionStatus === 'processing' && (
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Processing your deposit</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <div className="mt-2 text-center">
                  <span className="text-xs text-muted-foreground flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Verifying transaction...
                  </span>
                </div>
              </div>
            )}
            
            {/* Success message */}
            {transactionStatus === 'success' && (
              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Deposit Successful</AlertTitle>
                <AlertDescription>
                  <p>${amount.toFixed(2)} has been added to your account.</p>
                  <p className="text-xs mt-1">Transaction ID: {transactionId}</p>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error message */}
            {transactionStatus === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Deposit Failed</AlertTitle>
                <AlertDescription>
                  There was an error processing your transaction. Please try again or contact support.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show compliance checks for real money */}
            <BettingCompliance 
              isRealMoney={true}
              amount={amount}
              onComplianceVerified={handleComplianceVerified}
            />
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pl-8"
                  min={5}
                  max={user?.balance || 0}
                  step={1}
                />
              </div>
              
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-muted-foreground">Available Balance:</span>
                <span className="font-medium">${user?.balance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Withdrawal Method</label>
              <Tabs defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="creditCard" className="flex items-center justify-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bank Account
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="flex items-center justify-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Crypto Wallet
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="creditCard" className="space-y-4 mt-4">
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Bank Account</span>
                      <Badge variant="outline">FDIC Insured</Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground py-1">
                      Withdrawals typically process within 1-3 business days depending on your financial institution.
                    </p>
                    
                    <Button className="w-full mt-2" variant="outline">
                      Use Saved Account
                    </Button>
                    
                    <div className="text-center mt-2">
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-xs text-blue-600 dark:text-blue-400"
                      >
                        Add a new bank account
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Cryptocurrency</label>
                    <Select value={cryptoType} onValueChange={setCryptoType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                        <SelectItem value="litecoin">Litecoin (LTC)</SelectItem>
                        <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                        <SelectItem value="weplaytoken">WePlay Token (WPLY)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="mt-4">
                      <label className="text-sm font-medium mb-2 block">Wallet Address</label>
                      <Input placeholder={`Enter ${cryptoDetails.name} wallet address`} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Double-check the address. Transactions cannot be reversed once sent.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Processing state */}
            {transactionStatus === 'processing' && (
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Processing your withdrawal</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <div className="mt-2 text-center">
                  <span className="text-xs text-muted-foreground flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Verifying transaction...
                  </span>
                </div>
              </div>
            )}
            
            {/* Success message */}
            {transactionStatus === 'success' && (
              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Withdrawal Requested</AlertTitle>
                <AlertDescription>
                  <p>Your withdrawal of ${amount.toFixed(2)} has been initiated.</p>
                  <p className="text-xs mt-1">Transaction ID: {transactionId}</p>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error message */}
            {transactionStatus === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Withdrawal Failed</AlertTitle>
                <AlertDescription>
                  There was an error processing your withdrawal. Please try again or contact support.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show compliance checks for real money */}
            <BettingCompliance 
              isRealMoney={true}
              amount={amount}
              onComplianceVerified={handleComplianceVerified}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={processTransaction}
          disabled={isProcessing || !isComplianceVerified || amount <= 0 || (selectedTab === 'withdraw' && amount > (user?.balance || 0))}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {selectedTab === 'deposit' ? 'Deposit' : 'Withdraw'} ${amount.toFixed(2)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SecureTransactionSystem;