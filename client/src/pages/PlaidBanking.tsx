import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Shield, Clock } from "lucide-react";
import PlaidLink from "@/components/PlaidLink";
import PlaidTransactions from "@/components/PlaidTransactions";
import { useQuery } from '@tanstack/react-query';
// import { apiRequest } from '@/lib/queryClient';

export default function PlaidBanking() {
  // Get current user from query or use demo user
  const { data: userInfo } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });
  
  const userId = userInfo?.id || "demo-user-1";
  const currentBalance = userInfo?.balance || 250.00;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bank Account Management</h1>
        <p className="text-muted-foreground">
          Securely connect your bank accounts for instant deposits and withdrawals
        </p>
      </div>

      {/* Security Info Banner */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">Bank-Level Security</h3>
              <p className="text-green-700 text-sm mb-3">
                We use Plaid's industry-leading security to protect your financial information. 
                Your login credentials are encrypted and never stored on our servers.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  256-bit SSL Encryption
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Banknote className="h-3 w-3 mr-1" />
                  FDIC Protected
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Instant Transfers
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabbed Interface */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Bank Accounts
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Deposits & Withdrawals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6">
          <PlaidLink 
            userId={userId}
            // userName={userInfo?.username || userInfo?.firstName || 'WeParlay User'}
            onSuccess={(accounts) => {
              console.log('Successfully linked accounts:', accounts);
            }}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <PlaidTransactions 
            userId={userId}
            currentBalance={currentBalance}
          />
        </TabsContent>
      </Tabs>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Instant Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Funds are available immediately for betting and trading. Start playing right away.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Secure & Private
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your banking information is protected by the same security used by major financial institutions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5 text-purple-600" />
              Low Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Competitive fees with free withdrawals for VIP members. No hidden charges.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Support Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you experience any issues with bank account linking or transactions, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <h4 className="font-medium">Processing Times</h4>
              <p className="text-sm text-muted-foreground">
                Deposits: Instant • Withdrawals: 1-3 business days
              </p>
            </div>
            <div>
              <h4 className="font-medium">Supported Banks</h4>
              <p className="text-sm text-muted-foreground">
                11,000+ banks and credit unions supported
              </p>
            </div>
            <div>
              <h4 className="font-medium">Account Types</h4>
              <p className="text-sm text-muted-foreground">
                Checking and savings accounts accepted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}