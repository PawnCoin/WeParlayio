import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bar, BarChart, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9146FF', '#FF6B6B'];

export function FeeSummary() {
  const [timeRange, setTimeRange] = useState('month');
  const [feeType, setFeeType] = useState('all');

  // Fetch fee configuration
  const { data: feeConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['/api/fees/config'],
    staleTime: 3600000, // 1 hour
  });

  // Fetch fee summary data
  const { data: feeSummary, isLoading: isLoadingFeeSummary } = useQuery({
    queryKey: ['/api/fees/summary', timeRange],
    staleTime: 300000, // 5 minutes
  });

  // Fetch detailed fee breakdown by type
  const { data: feeBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ['/api/fees/breakdown', timeRange, feeType],
    staleTime: 300000, // 5 minutes
  });

  // Filter data based on fee type if needed
  const getFilteredData = () => {
    if (!feeSummary?.data || feeType === 'all') return feeSummary?.data;
    return feeSummary?.data.filter((item: any) => item.type === feeType);
  };

  // Mock data for preview purposes - will be replaced by real API data when available
  const mockFeeConfig = {
    bettingFees: {
      percentage: 0.025,
      tiers: [
        { maxAmount: 100, percentage: 0.03 },
        { maxAmount: 500, percentage: 0.025 },
        { maxAmount: 1000, percentage: 0.02 },
        { maxAmount: 5000, percentage: 0.015 },
        { maxAmount: Infinity, percentage: 0.01 }
      ],
      minimumFee: 1.00
    },
    withdrawalFees: {
      standardPercentage: 0.015,
      minimumFee: 3.00
    },
    premiumFeatures: {
      vipMembership: { monthlyFee: 19.99 },
      analyticsPackage: { monthlyFee: 9.99 },
      prioritySupport: { monthlyFee: 4.99 }
    }
  };

  const mockSummaryData = [
    { name: 'Betting Fees', value: 18750, percentage: 56.3 },
    { name: 'Withdrawal Fees', value: 8920, percentage: 26.8 },
    { name: 'Deposit Fees', value: 2100, percentage: 6.3 },
    { name: 'VIP Subscriptions', value: 2400, percentage: 7.2 },
    { name: 'Analytics Package', value: 800, percentage: 2.4 },
    { name: 'Priority Support', value: 350, percentage: 1.0 },
  ];

  const mockMonthlyData = [
    { month: 'Jan', betting: 12500, withdrawal: 6000, deposit: 1500, subscription: 2500 },
    { month: 'Feb', betting: 14000, withdrawal: 6500, deposit: 1600, subscription: 2800 },
    { month: 'Mar', betting: 16000, withdrawal: 7200, deposit: 1800, subscription: 3000 },
    { month: 'Apr', betting: 18750, withdrawal: 8920, deposit: 2100, subscription: 3550 },
  ];

  const mockFeeBreakdown = {
    count: 3254,
    average: 9.21,
    highest: 250.50,
    lowest: 1.00,
    distribution: [
      { range: '0-5', count: 1245, percentage: 38.3 },
      { range: '5-10', count: 876, percentage: 26.9 },
      { range: '10-20', count: 645, percentage: 19.8 },
      { range: '20-50', count: 321, percentage: 9.9 },
      { range: '50-100', count: 142, percentage: 4.4 },
      { range: '100+', count: 25, percentage: 0.7 },
    ]
  };

  // ONLY use real API data - no fake data
  const config = feeConfig?.data;
  const summaryData = feeSummary?.data;
  const monthlyData = null; // Will show loading state until real API data available
  const breakdownData = feeBreakdown?.data;

  // If no real data, show loading or "no data" message
  if (!config || !summaryData || !breakdownData) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Revenue Summary</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading real financial data...</p>
          <p className="text-sm text-gray-400 mt-2">No demo data will be shown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Fee Revenue Management</h2>
        <div className="flex space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="year">Last 365 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={feeType} onValueChange={setFeeType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fees</SelectItem>
              <SelectItem value="betting">Betting Fees</SelectItem>
              <SelectItem value="withdrawal">Withdrawal Fees</SelectItem>
              <SelectItem value="deposit">Deposit Fees</SelectItem>
              <SelectItem value="subscription">Subscription Fees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Total fees collected in selected period</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary">
              ${summaryData.reduce((total, item) => total + item.value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {timeRange === 'day' ? 'Last 24 hours' : 
               timeRange === 'week' ? 'Last 7 days' : 
               timeRange === 'month' ? 'Last 30 days' : 
               timeRange === 'quarter' ? 'Last 90 days' : 'Last 365 days'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Transactions</CardTitle>
            <CardDescription>Number of fee transactions</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary">
              {breakdownData.count.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Avg fee: ${breakdownData.average}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Range</CardTitle>
            <CardDescription>Min/Max fee amounts</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Minimum</div>
                <div className="text-2xl font-bold text-primary">${breakdownData.lowest}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Maximum</div>
                <div className="text-2xl font-bold text-primary">${breakdownData.highest}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="fee-structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Fee Type</CardTitle>
              <CardDescription>
                Breakdown of revenue from different fee types
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summaryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {summaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>
                Tracking revenue trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="betting" stroke="#0088FE" strokeWidth={2} />
                    <Line type="monotone" dataKey="withdrawal" stroke="#00C49F" strokeWidth={2} />
                    <Line type="monotone" dataKey="deposit" stroke="#FFBB28" strokeWidth={2} />
                    <Line type="monotone" dataKey="subscription" stroke="#FF8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee-structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Fee Structure</CardTitle>
              <CardDescription>
                Overview of current platform fee configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Betting Fees</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">Standard Rate:</div>
                    <div className="text-sm font-semibold">{(config.bettingFees.percentage * 100).toFixed(1)}%</div>
                    <div className="text-sm">Minimum Fee:</div>
                    <div className="text-sm font-semibold">${config.bettingFees.minimumFee.toFixed(2)}</div>
                  </div>
                  <h4 className="text-md font-semibold mt-3 mb-1">Tiered Structure:</h4>
                  <div className="text-sm space-y-1">
                    {config.bettingFees.tiers.map((tier: any, index: number) => (
                      <div key={index} className="grid grid-cols-2">
                        <div>
                          {tier.maxAmount < Infinity 
                            ? `Up to $${tier.maxAmount}` 
                            : 'Above $5,000'}:
                        </div>
                        <div className="font-semibold">{(tier.percentage * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Withdrawal Fees</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">Standard Rate:</div>
                    <div className="text-sm font-semibold">{(config.withdrawalFees.standardPercentage * 100).toFixed(1)}%</div>
                    <div className="text-sm">Minimum Fee:</div>
                    <div className="text-sm font-semibold">${config.withdrawalFees.minimumFee.toFixed(2)}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Premium Subscriptions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">VIP Membership:</div>
                    <div className="text-sm font-semibold">${config.premiumFeatures.vipMembership.monthlyFee.toFixed(2)}/month</div>
                    <div className="text-sm">Analytics Package:</div>
                    <div className="text-sm font-semibold">${config.premiumFeatures.analyticsPackage.monthlyFee.toFixed(2)}/month</div>
                    <div className="text-sm">Priority Support:</div>
                    <div className="text-sm font-semibold">${config.premiumFeatures.prioritySupport.monthlyFee.toFixed(2)}/month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fee Amount Distribution</CardTitle>
              <CardDescription>
                Analysis of fee amounts collected
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownData.distribution}>
                    <XAxis dataKey="range" />
                    <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                    <YAxis yAxisId="right" orientation="right" stroke="#FF8042" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Number of Fees" fill="#0088FE" />
                    <Bar yAxisId="right" dataKey="percentage" name="Percentage (%)" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FeeSummary;