import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { Badge } from '@/components/ui/badge';

interface CryptoCheckoutProps {
  tierName: string;
  amount: number;
  currency: string;
}

export default function CryptoCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { account, connectWallet, isConnecting } = useWallet();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Contract details for Pawn Coin ($PC)
  const PAWN_COIN_CONTRACT = '0x2Fe269292f74F0a98C5786088317B4f86313C211';
  const PAYMENT_ADDRESS = '0x742d35Cc6639C0532fddC27F419E07C6A0C25F4C'; // WeParlay treasury

  useEffect(() => {
    // Get payment details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency') || 'PC';

    if (!tier || !amount) {
      toast({
        title: "Invalid Payment Link",
        description: "This payment link is invalid or expired.",
        variant: "destructive",
      });
      setLocation('/upgrade-tier');
      return;
    }

    setPaymentDetails({
      tierName: tier,
      amount: parseFloat(amount),
      currency,
    });
  }, [setLocation, toast]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_ADDRESS);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Payment address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSent = () => {
    setPaymentStatus('processing');
    
    // Simulate payment verification process
    setTimeout(() => {
      setPaymentStatus('completed');
      setTransactionHash('0x' + Math.random().toString(16).substr(2, 40));
      toast({
        title: "Payment Received",
        description: "Your tier upgrade has been processed successfully!",
      });
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        setLocation('/tier-upgrade-success');
      }, 3000);
    }, 5000);
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <Card className="max-w-lg w-full bg-gray-900 border-gray-800">
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
            <CardTitle className="text-white">Crypto Payment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Tier Upgrade:</span>
                <span className="text-white font-medium">{paymentDetails.tierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-medium">
                  {paymentDetails.amount} {paymentDetails.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white font-medium">Pawn Coin ($PC)</span>
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          {!account ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Connect Your Wallet</h3>
              <p className="text-gray-400 text-sm">
                Connect your Web3 wallet to proceed with the crypto payment.
              </p>
              <Button 
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Wallet Connected */}
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>

              {/* Payment Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Payment Instructions</h3>
                
                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Send Pawn Coin ($PC) to:
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-700 p-2 rounded text-sm text-white break-all">
                        {PAYMENT_ADDRESS}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyAddress}
                        className="shrink-0"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Pawn Coin Contract Address:
                    </label>
                    <code className="block bg-gray-700 p-2 rounded text-sm text-white break-all">
                      {PAWN_COIN_CONTRACT}
                    </code>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Amount to Send:
                    </label>
                    <div className="text-xl font-bold text-orange-400">
                      {paymentDetails.amount} $PC
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Payment Status:</span>
                    <Badge variant={
                      paymentStatus === 'completed' ? 'default' :
                      paymentStatus === 'processing' ? 'secondary' :
                      paymentStatus === 'failed' ? 'destructive' : 'outline'
                    }>
                      {paymentStatus === 'pending' && 'Waiting for Payment'}
                      {paymentStatus === 'processing' && 'Processing...'}
                      {paymentStatus === 'completed' && 'Payment Confirmed'}
                      {paymentStatus === 'failed' && 'Payment Failed'}
                    </Badge>
                  </div>

                  {paymentStatus === 'pending' && (
                    <Button 
                      onClick={handlePaymentSent}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      I've Sent the Payment
                    </Button>
                  )}

                  {paymentStatus === 'processing' && (
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying payment on blockchain...</span>
                    </div>
                  )}

                  {paymentStatus === 'completed' && transactionHash && (
                    <div className="space-y-2">
                      <div className="text-green-400 font-medium">
                        Payment confirmed! Your tier has been upgraded.
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Transaction
                      </Button>
                    </div>
                  )}
                </div>

                {/* Help Text */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Make sure you're sending from the connected wallet address</p>
                  <p>• Double-check the payment address before sending</p>
                  <p>• Payments are typically confirmed within 1-5 minutes</p>
                  <p>• Contact support if you experience any issues</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}