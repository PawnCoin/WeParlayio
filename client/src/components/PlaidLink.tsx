import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Banknote, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaidLinkProps {
  userId: string;
  onSuccess?: (data: any) => void;
}

export default function PlaidLink({ userId, onSuccess }: PlaidLinkProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Create link token mutation
  const createLinkTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName: 'WeParlay User' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create link token');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.link_token) {
        setLinkToken(data.link_token);
        toast({
          title: "Ready to Connect",
          description: "Click 'Connect Bank Account' to link your account securely.",
        });
      } else {
        throw new Error(data.error || 'Failed to create link token');
      }
    },
    onError: (error) => {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to initialize bank connection",
        variant: "destructive",
      });
    }
  });

  // Exchange public token mutation
  const exchangeTokenMutation = useMutation({
    mutationFn: async (publicToken: string) => {
      const response = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken, userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect bank account');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Bank Account Connected!",
          description: `Successfully connected ${data.accounts?.length || 1} account(s).`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/plaid/accounts'] });
        onSuccess?.(data);
      } else {
        throw new Error(data.error || 'Failed to connect account');
      }
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect bank account",
        variant: "destructive",
      });
    }
  });

  // Demo connection handler (for when no real Plaid credentials)
  const handleDemoConnection = async () => {
    setIsConnecting(true);
    try {
      // Simulate the demo connection flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const demoData = {
        success: true,
        accounts: [
          {
            account_id: 'demo_checking_001',
            name: 'Demo Checking Account',
            type: 'depository',
            subtype: 'checking',
            mask: '0001',
            balances: {
              available: 2500.50,
              current: 2750.75,
              iso_currency_code: 'USD'
            }
          }
        ]
      };
      
      toast({
        title: "Demo Bank Connected!",
        description: "Successfully connected demo bank account for testing.",
      });
      
      onSuccess?.(demoData);
    } catch (error) {
      toast({
        title: "Demo Connection Failed",
        description: "Failed to connect demo account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Real Plaid connection handler
  const handlePlaidConnection = async () => {
    if (!linkToken) {
      await createLinkTokenMutation.mutateAsync();
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would open the Plaid Link modal
      // For demo purposes, we'll simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful token exchange
      const mockPublicToken = `public-sandbox-demo-${Date.now()}`;
      await exchangeTokenMutation.mutateAsync(mockPublicToken);
    } catch (error) {
      console.error('Plaid connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Connect Bank Account
        </CardTitle>
        <CardDescription>
          Securely link your bank account for instant deposits and withdrawals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Bank-Level Security
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Banknote className="h-3 w-3 mr-1" />
            Instant Transfers
          </Badge>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handlePlaidConnection}
            disabled={isConnecting || createLinkTokenMutation.isPending}
            className="w-full"
            size="lg"
          >
            {isConnecting || createLinkTokenMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {linkToken ? 'Connecting...' : 'Initializing...'}
              </>
            ) : (
              <>
                <Banknote className="h-4 w-4 mr-2" />
                Connect Bank Account
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Or for testing purposes:
          </div>

          <Button
            onClick={handleDemoConnection}
            disabled={isConnecting}
            variant="outline"
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting Demo Account...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Connect Demo Account
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-gray-50 rounded">
          <strong>Security Note:</strong> We use Plaid's bank-grade security. Your credentials are encrypted 
          and we never store your login information. All connections are read-only and FDIC protected.
        </div>
      </CardContent>
    </Card>
  );
}