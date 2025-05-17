import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Clock, AlertCircle, CheckCircle2, BanknoteIcon } from "lucide-react";

// Revenue Overview Bar Chart
export const RevenueBarChart = ({ data }: { data: any[] }) => {
  const colors = {
    totalBets: '#3498db',
    revenue: '#2ecc71',
    payouts: '#e74c3c'
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue, bets, and payouts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => `$${value.toLocaleString()}`}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar dataKey="totalBets" fill={colors.totalBets} name="Total Bets" />
              <Bar dataKey="revenue" fill={colors.revenue} name="Revenue" />
              <Bar dataKey="payouts" fill={colors.payouts} name="Payouts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// User Activity Line Chart
export const UserActivityChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
        <CardDescription>Daily active users and betting activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="activeUsers" stroke="#3498db" name="Active Users" />
              <Line yAxisId="right" type="monotone" dataKey="betsPlaced" stroke="#e67e22" name="Bets Placed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Sports Distribution Pie Chart
export const SportsPieChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#3498db', '#2ecc71', '#e67e22', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c', '#34495e'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Betting by Sport</CardTitle>
        <CardDescription>Distribution of bets across sports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value.toLocaleString()} bets`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Win Rate / Success Rate Chart
export const WinRateChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Win Rates</CardTitle>
        <CardDescription>Distribution of user betting success</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => `${value}%`}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Bar dataKey="winRate" fill="#3498db" name="Win Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Daily Earnings Chart
export const DailyEarningsChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Platform Earnings</CardTitle>
        <CardDescription>Gross and net revenue by day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="grossRevenue" stroke="#3498db" name="Gross Revenue" />
              <Line type="monotone" dataKey="netRevenue" stroke="#2ecc71" name="Net Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Transaction Volume Chart
export const TransactionVolumeChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <CardDescription>Deposits, withdrawals, and bet volume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="deposits" stackId="a" fill="#3498db" name="Deposits" />
              <Bar dataKey="withdrawals" stackId="a" fill="#e74c3c" name="Withdrawals" />
              <Bar dataKey="bets" stackId="a" fill="#2ecc71" name="Bets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Import necessary components
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, Download, Filter } from "lucide-react";

// Interactive Dashboard Controls
export const InteractiveDashboardControls = ({ 
  onDateRangeChange,
  onRefresh
}: { 
  onDateRangeChange: (range: string) => void,
  onRefresh: () => void
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => onDateRangeChange('24h')}
          className="text-xs"
        >
          24H
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onDateRangeChange('7d')}
          className="text-xs"
        >
          7D
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onDateRangeChange('30d')}
          className="text-xs"
        >
          30D
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onDateRangeChange('90d')}
          className="text-xs"
        >
          90D
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onDateRangeChange('1y')}
          className="text-xs"
        >
          1Y
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onDateRangeChange('all')}
          className="text-xs"
        >
          All Time
        </Button>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onRefresh}
        className="text-xs ml-auto"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh
      </Button>
    </div>
  );
};

// Report Generation Button
export const ReportGenerationButton = ({ 
  onGenerateReport,
  isLoading
}: { 
  onGenerateReport: (period: 'day' | 'week' | 'month' | 'year') => void,
  isLoading: boolean
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="relative">
      <Button 
        variant="default" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                onGenerateReport('day');
                setIsOpen(false);
              }}
            >
              Last 24 Hours
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                onGenerateReport('week');
                setIsOpen(false);
              }}
            >
              Last 7 Days
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                onGenerateReport('month');
                setIsOpen(false);
              }}
            >
              Last 30 Days
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => {
                onGenerateReport('year');
                setIsOpen(false);
              }}
            >
              Last Year
            </button>
          </div>
        </div>
      )}
    </div>
  );
};