
import React, { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Smartphone, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Plus,
  DollarSign
} from 'lucide-react';

interface LinkedAccount {
  id: string;
  institutionName: string;
  accountType: 'bank' | 'cash_app';
  accounts: Array<{
    accountId: string;
    name: string;
    type: string;
    subtype: string;
    mask: string;
    isCashApp: boolean;
  }>;
  balances?: Array<{
    accountId: string;
    available: number;
    current: number;
  }>;
  isActive: boolean;
  linkedAt: string;
}

const PlaidLinkComponent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [linkToken, setLinkToken] = useState<string>('');
  const [isLinking, setIsLinking] = useState(false);

  // Fetch link token
  const { data: linkTokenData } = useQuery({
    queryKey: ['/api/plaid/create-link-token'],
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch linked accounts
  const { data: linkedAccounts = [], isLoading } = useQuery<LinkedAccount[]>({
    queryKey: ['/api/plaid/linked-accounts'],
    enabled: !!user,
  });

  // Handle successful link
  const onSuccess = useCallback(async (public_token: string, metadata: any) => {
    setIsLinking(true);
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Account Linked Successfully!",
          description: `${data.institutionName} has been linked to your account.`,
          duration: 5000,
        });
        
        // Refresh linked accounts
        queryClient.invalidateQueries({ queryKey: ['/api/plaid/linked-accounts'] });
      } else {
        throw new Error(data.message || 'Failed to link account');
      }
    } catch (error: any) {
      toast({
        title: "Linking Failed",
        description: error.message || "Failed to link your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  }, [toast, queryClient]);

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkTokenData?.link_token || '',
    onSuccess,
    onEvent: (eventName, metadata) => {
      console.log('Plaid event:', eventName, metadata);
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link exit error:', err);
      }
    },
  });

  const handleUnlinkAccount = async (itemId: string, institutionName: string) => {
    try {
      const response = await fetch(`/api/plaid/linked-accounts/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Account Unlinked",
          description: `${institutionName} has been removed from your account.`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/plaid/linked-accounts'] });
      } else {
        throw new Error(data.message || 'Failed to unlink account');
      }
    } catch (error: any) {
      toast({
        title: "Unlink Failed",
        description: error.message || "Failed to unlink account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAccountIcon = (accountType: string, isCashApp: boolean) => {
    if (isCashApp) {
      return <Smartphone className="h-5 w-5 text-green-600" />;
    }
    return accountType === 'bank' ? <Building2 className="h-5 w-5 text-blue-600" /> : <CreditCard className="h-5 w-5 text-purple-600" />;
  };

  const formatAccountName = (account: any) => {
    if (account.isCashApp) {
      return 'Cash App';
    }
    return account.name || account.officialName || `${account.type} Account`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Link New Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Link Your Bank Account or Cash App
          </CardTitle>
          <CardDescription>
            Securely connect your bank account or Cash App for instant deposits and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Bank-Level Security</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• 256-bit SSL encryption protects all data</li>
                  <li>• We never store your banking credentials</li>
                  <li>• Powered by Plaid - trusted by millions</li>
                  <li>• Instant transfers with participating banks</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => open()} 
            disabled={!ready || isLinking}
            className="w-full"
            size="lg"
          >
            {isLinking ? (
              "Linking Account..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Link Bank Account or Cash App
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      {linkedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Linked Accounts</CardTitle>
            <CardDescription>
              Manage your connected bank accounts and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedAccounts.map((linkedAccount) => (
              <div key={linkedAccount.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getAccountIcon(linkedAccount.accountType, linkedAccount.accounts.some(acc => acc.isCashApp))}
                    <div>
                      <h4 className="font-medium">{linkedAccount.institutionName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Linked {new Date(linkedAccount.linkedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={linkedAccount.isActive ? "default" : "secondary"}>
                      {linkedAccount.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlinkAccount(linkedAccount.id, linkedAccount.institutionName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {linkedAccount.accounts.map((account) => (
                    <div key={account.accountId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {account.isCashApp ? (
                          <Badge className="bg-green-100 text-green-800">Cash App</Badge>
                        ) : (
                          <Badge variant="outline">{account.type}</Badge>
                        )}
                        <span className="text-sm">{formatAccountName(account)}</span>
                        {account.mask && (
                          <span className="text-xs text-muted-foreground">•••• {account.mask}</span>
                        )}
                      </div>
                      {linkedAccount.balances?.find(b => b.accountId === account.accountId) && (
                        <div className="text-sm text-right">
                          <p className="font-medium">
                            ${linkedAccount.balances.find(b => b.accountId === account.accountId)?.available?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-xs text-muted-foreground">Available</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlaidLinkComponent;
