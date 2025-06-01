import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Bitcoin, CreditCard, ArrowUpRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  userId: string;
  type: 'withdrawal' | 'winnings' | 'refund' | 'bonus';
  currency: 'USD' | 'WEPARLAY' | 'BTC' | 'ETH';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'bank_transfer' | 'crypto_wallet' | 'paypal' | 'stripe';
  destination: string;
  description: string;
  createdAt: string;
  processedAt?: string;
  user?: {
    username: string;
    email: string;
    tier: string;
  };
}

export default function PayoutManagement() {
  const { toast } = useToast();
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  // Fetch payouts
  const { data: payouts, isLoading } = useQuery({
    queryKey: ['/api/payouts/list'],
    staleTime: 30 * 1000,
  });

  // Fetch payout statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/payouts/statistics'],
    staleTime: 60 * 1000,
  });

  // Process payout mutation
  const processPayoutMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      return apiRequest('POST', `/api/payouts/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payouts/list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payouts/statistics'] });
      toast({
        title: 'Payout Updated',
        description: 'Payout has been processed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Processing Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk process payouts mutation
  const bulkProcessMutation = useMutation({
    mutationFn: async ({ action, payoutIds }: { action: string; payoutIds: string[] }) => {
      return apiRequest('POST', '/api/payouts/bulk-process', { action, payoutIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payouts/list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payouts/statistics'] });
      toast({
        title: 'Bulk Operation Complete',
        description: 'Selected payouts have been processed',
      });
    },
  });

  const StatCard = ({ title, value, icon: Icon, change }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-muted-foreground">
                {change > 0 ? '+' : ''}{change}% from last month
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'destructive';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'BTC':
      case 'ETH':
        return Bitcoin;
      case 'WEPARLAY':
        return ArrowUpRight;
      default:
        return DollarSign;
    }
  };

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'crypto_wallet': return 'Crypto Wallet';
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      default: return method;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-muted-foreground">Manage user withdrawals and winnings payouts</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => bulkProcessMutation.mutate({
              action: 'approve',
              payoutIds: payouts?.filter((p: Payout) => p.status === 'pending').map((p: Payout) => p.id) || []
            })}
          >
            Approve All Pending
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Payouts (24h)"
          value={`$${stats?.totalPayouts24h?.toLocaleString() || 0}`}
          icon={DollarSign}
          change={stats?.payoutChange}
        />
        <StatCard
          title="Pending Payouts"
          value={stats?.pendingCount || 0}
          icon={AlertTriangle}
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          icon={CheckCircle}
        />
        <StatCard
          title="Average Processing Time"
          value={`${stats?.avgProcessingTime || 0}h`}
          icon={CreditCard}
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({payouts?.filter((p: Payout) => p.status === 'pending').length || 0})</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>
                Payouts awaiting manual review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading payouts...</div>
                ) : payouts?.filter((p: Payout) => p.status === 'pending').length > 0 ? (
                  payouts.filter((p: Payout) => p.status === 'pending').map((payout: Payout) => {
                    const CurrencyIcon = getCurrencyIcon(payout.currency);
                    return (
                      <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-center gap-4">
                          <CurrencyIcon className="h-8 w-8 text-red-600" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{payout.description}</p>
                              <Badge variant="outline">{payout.type}</Badge>
                              <Badge variant="secondary">{getMethodDisplay(payout.method)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payout.user?.username} ({payout.user?.tier} tier) • {new Date(payout.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              To: {payout.destination}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-lg">
                              {payout.currency === 'USD' ? '$' : ''}
                              {payout.amount.toLocaleString()}
                              {payout.currency !== 'USD' ? ` ${payout.currency}` : ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              via {getMethodDisplay(payout.method)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => processPayoutMutation.mutate({
                                id: payout.id,
                                action: 'approve'
                              })}
                              disabled={processPayoutMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => processPayoutMutation.mutate({
                                id: payout.id,
                                action: 'reject'
                              })}
                              disabled={processPayoutMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending payouts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Payouts</CardTitle>
              <CardDescription>
                Payouts currently being processed by payment providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts?.filter((p: Payout) => p.status === 'processing').length > 0 ? (
                  payouts.filter((p: Payout) => p.status === 'processing').map((payout: Payout) => {
                    const CurrencyIcon = getCurrencyIcon(payout.currency);
                    return (
                      <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-4">
                          <CurrencyIcon className="h-8 w-8 text-blue-600" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{payout.description}</p>
                              <Badge variant={getStatusColor(payout.status)}>
                                {payout.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payout.user?.username} • {new Date(payout.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {payout.currency === 'USD' ? '$' : ''}
                            {payout.amount.toLocaleString()}
                            {payout.currency !== 'USD' ? ` ${payout.currency}` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Processing via {getMethodDisplay(payout.method)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No processing payouts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Payouts</CardTitle>
              <CardDescription>
                Successfully processed payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts?.filter((p: Payout) => p.status === 'completed').slice(0, 20).map((payout: Payout) => {
                  const CurrencyIcon = getCurrencyIcon(payout.currency);
                  return (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <CurrencyIcon className="h-8 w-8 text-green-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{payout.description}</p>
                            <Badge variant="default">Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payout.user?.username} • Completed {payout.processedAt ? new Date(payout.processedAt).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {payout.currency === 'USD' ? '$' : ''}
                          {payout.amount.toLocaleString()}
                          {payout.currency !== 'USD' ? ` ${payout.currency}` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          via {getMethodDisplay(payout.method)}
                        </p>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed payouts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payouts</CardTitle>
              <CardDescription>
                Payouts that failed processing and may need manual intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts?.filter((p: Payout) => p.status === 'failed').length > 0 ? (
                  payouts.filter((p: Payout) => p.status === 'failed').map((payout: Payout) => {
                    const CurrencyIcon = getCurrencyIcon(payout.currency);
                    return (
                      <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-center gap-4">
                          <CurrencyIcon className="h-8 w-8 text-red-600" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{payout.description}</p>
                              <Badge variant="destructive">Failed</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {payout.user?.username} • {new Date(payout.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {payout.currency === 'USD' ? '$' : ''}
                              {payout.amount.toLocaleString()}
                              {payout.currency !== 'USD' ? ` ${payout.currency}` : ''}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processPayoutMutation.mutate({
                              id: payout.id,
                              action: 'approve'
                            })}
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No failed payouts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}