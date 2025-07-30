import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, DollarSign, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlaidLinkProps {
  userId: string;
  userName?: string;
  onSuccess?: (accounts: any[]) => void;
}

interface BankAccount {
  id: number;
  accountName: string;
  accountType: string;
  accountSubtype: string;
  mask: string;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function PlaidLink({ userId, userName, onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's bank accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/plaid/accounts', userId],
    queryFn: () => apiRequest(`/api/plaid/accounts/${userId}`),
    enabled: !!userId
  });

  // Create link token mutation
  const createLinkTokenMutation = useMutation({
    mutationFn: () => apiRequest('/api/plaid/create-link-token', {
      method: 'POST',
      body: JSON.stringify({ userId, userName })
    }),
    onSuccess: (data) => {
      if (data.success) {
        setLinkToken(data.link_token);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create link token",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Failed to initialize bank connection",
        variant: "destructive"
      });
    }
  });

  // Exchange public token mutation
  const exchangeTokenMutation = useMutation({
    mutationFn: (publicToken: string) => apiRequest('/api/plaid/exchange-public-token', {
      method: 'POST',
      body: JSON.stringify({ publicToken, userId })
    }),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Bank Account Connected!",
          description: `Successfully linked ${data.accounts?.length || 0} account(s)`,
          variant: "default"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/plaid/accounts', userId] });
        onSuccess?.(data.accounts);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to link bank account",
          variant: "destructive"
        });
      }
      setIsLinking(false);
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Failed to link bank account",
        variant: "destructive"
      });
      setIsLinking(false);
    }
  });

  // Remove bank account mutation
  const removeAccountMutation = useMutation({
    mutationFn: (accountId: number) => apiRequest(`/api/plaid/accounts/${userId}/${accountId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: "Account Removed",
        description: "Bank account has been unlinked successfully",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/plaid/accounts', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove bank account",
        variant: "destructive"
      });
    }
  });

  const onPlaidSuccess = useCallback((public_token: string, metadata: any) => {
    setIsLinking(true);
    exchangeTokenMutation.mutate(public_token);
  }, [exchangeTokenMutation]);

  const onPlaidExit = useCallback((err: any, metadata: any) => {
    if (err) {
      console.error('Plaid Link error:', err);
      toast({
        title: "Connection Cancelled",
        description: "Bank account linking was cancelled",
        variant: "default"
      });
    }
    setLinkToken(null);
  }, [toast]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  const handleStartLinking = () => {
    createLinkTokenMutation.mutate();
  };

  const handleRemoveAccount = (accountId: number) => {
    if (confirm('Are you sure you want to remove this bank account?')) {
      removeAccountMutation.mutate(accountId);
    }
  };

  // Auto-open Plaid Link when token is ready
  React.useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const formatCurrency = (amount: number | null, currency: string = 'USD') => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getAccountTypeColor = (type: string, subtype: string) => {
    if (type === 'depository') {
      return subtype === 'checking' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Link New Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Connect Bank Account
          </CardTitle>
          <CardDescription>
            Securely link your bank account for instant deposits and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleStartLinking}
            disabled={createLinkTokenMutation.isPending || isLinking}
            className="w-full"
          >
            {createLinkTokenMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : isLinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting Account...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Link Bank Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Linked Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Linked Bank Accounts
          </CardTitle>
          <CardDescription>
            Your connected bank accounts for deposits and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No bank accounts connected yet</p>
              <p className="text-sm">Link your first account to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account: BankAccount) => (
                <div key={account.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{account.accountName}</h3>
                        <Badge className={getAccountTypeColor(account.accountType, account.accountSubtype)}>
                          {account.accountSubtype || account.accountType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          •••• {account.mask}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available Balance</p>
                          <p className="font-medium">
                            {formatCurrency(account.balances.available, account.balances.iso_currency_code)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Balance</p>
                          <p className="font-medium">
                            {formatCurrency(account.balances.current, account.balances.iso_currency_code)}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Connected {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAccount(account.id)}
                      disabled={removeAccountMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      {removeAccountMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}