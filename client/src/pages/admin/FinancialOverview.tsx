import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FinancialSummary {
  totalRevenue: number;
  totalPayouts: number;
  netProfit: number;
  activeUsers: number;
  totalTransactions: number;
  avgBetSize: number;
  monthlyGrowth: number;
  platformBalance: number;
}

interface Transaction {
  id: number;
  userId: string;
  username: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
}

export default function FinancialOverview() {
  // Fetch financial summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/admin/financial-summary"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/financial-summary");
      return response as FinancialSummary;
    }
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/transactions?limit=50");
      return response as Transaction[];
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
      case 'win':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
      case 'bet':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Financial Overview</h1>
            <p className="text-muted-foreground">Monitor revenue, payouts, and platform finances</p>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "Loading..." : formatCurrency(summary?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{summary?.monthlyGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "Loading..." : formatCurrency(summary?.totalPayouts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              User winnings and withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "Loading..." : formatCurrency(summary?.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "Loading..." : (summary?.activeUsers || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Balance</CardTitle>
            <CardDescription>Total funds held in platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {summaryLoading ? "Loading..." : formatCurrency(summary?.platformBalance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Bet Size</CardTitle>
            <CardDescription>Mean bet amount per transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {summaryLoading ? "Loading..." : formatCurrency(summary?.avgBetSize || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
            <CardDescription>All-time transaction count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {summaryLoading ? "Loading..." : (summary?.totalTransactions || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest financial activity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="font-medium">#{transaction.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.username}</div>
                        <div className="text-sm text-muted-foreground">{transaction.userId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.type?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}