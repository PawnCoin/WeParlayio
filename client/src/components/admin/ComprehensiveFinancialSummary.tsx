import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  ArrowUpRight,
  BanknoteIcon,
  PiggyBank,
  Wallet,
  Activity,
  PercentIcon
} from "lucide-react";

type FinancialSummary = {
  totalRevenue?: string;
  revenueToday?: string;
  totalUsers?: string;
  activeUsers?: string;
  newUsersToday?: string;
  totalBets?: string;
  avgBetSize?: string;
  conversionRate?: string;
  profitMargin?: string;
  platformFees?: string;
  pendingPayouts?: string;
  processingFees?: string;
  monthlyGrowth?: string;
  yearlyProjection?: string;
  revenueByCategory?: {
    [key: string]: string;
  };
};

type FinancialMetricCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  subtitle?: string;
  gradient?: string;
};

const FinancialMetricCard: React.FC<FinancialMetricCardProps> = ({
  title,
  value,
  icon,
  change,
  subtitle,
  gradient = "from-primary/10 to-primary/5"
}) => {
  return (
    <Card className={`bg-gradient-to-br ${gradient}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-2 flex items-center text-xs">
            <span className={`flex items-center ${
              change.type === 'positive' ? 'text-green-500' : 
              change.type === 'negative' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {change.type === 'positive' ? <TrendingUp className="mr-1 h-3 w-3" /> : 
               change.type === 'negative' ? <TrendingDown className="mr-1 h-3 w-3" /> : 
               <ArrowUpRight className="mr-1 h-3 w-3" />}
              {change.value}
            </span>
          </div>
        )}
        {subtitle && (
          <div className="mt-1 text-xs text-muted-foreground">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ComprehensiveFinancialSummary: React.FC<{ financialSummary: FinancialSummary }> = ({ 
  financialSummary 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Financial Performance</h2>
        <div className="text-sm text-muted-foreground">Updated: {new Date().toLocaleDateString()}</div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users & Bets</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialMetricCard
              title="Total Revenue"
              value={`$${financialSummary.totalRevenue || '152,000'}`}
              icon={<DollarSign className="h-4 w-4 text-primary" />}
              change={{
                value: "20.1% from last period",
                type: "positive"
              }}
              subtitle={`Today: $${financialSummary.revenueToday || '5,230'}`}
            />
            
            <FinancialMetricCard
              title="User Metrics"
              value={financialSummary.totalUsers || '18,246'}
              icon={<Users className="h-4 w-4 text-blue-500" />}
              gradient="from-blue-500/10 to-blue-500/5"
              change={{
                value: "3.2% growth rate",
                type: "positive"
              }}
              subtitle={`Active now: ${financialSummary.activeUsers || '8,942'}`}
            />
            
            <FinancialMetricCard
              title="Platform Earnings"
              value={`$${financialSummary.platformFees || '38,500'}`}
              icon={<PiggyBank className="h-4 w-4 text-green-500" />}
              gradient="from-green-500/10 to-green-500/5"
              change={{
                value: `${financialSummary.profitMargin || '22.8'}% profit margin`,
                type: "neutral"
              }}
              subtitle={`Pending: $${financialSummary.pendingPayouts || '12,450'}`}
            />
            
            <FinancialMetricCard
              title="Betting Activity"
              value={financialSummary.totalBets || '24,389'}
              icon={<Activity className="h-4 w-4 text-orange-500" />}
              gradient="from-orange-500/10 to-orange-500/5"
              change={{
                value: "18.7% from last period",
                type: "positive"
              }}
              subtitle={`Avg. bet: $${financialSummary.avgBetSize || '178'}`}
            />
          </div>
        </TabsContent>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialMetricCard
              title="Total Revenue"
              value={`$${financialSummary.totalRevenue || '152,000'}`}
              icon={<DollarSign className="h-4 w-4 text-primary" />}
              change={{
                value: "20.1% from last period",
                type: "positive"
              }}
            />
            
            <FinancialMetricCard
              title="Platform Fees"
              value={`$${financialSummary.platformFees || '38,500'}`}
              icon={<BanknoteIcon className="h-4 w-4 text-green-500" />}
              gradient="from-green-500/10 to-green-500/5"
              change={{
                value: "15.3% from last period",
                type: "positive"
              }}
            />
            
            <FinancialMetricCard
              title="Processing Fees"
              value={`$${financialSummary.processingFees || '5,840'}`}
              icon={<Wallet className="h-4 w-4 text-blue-500" />}
              gradient="from-blue-500/10 to-blue-500/5"
              change={{
                value: "2.1% from last period",
                type: "positive"
              }}
            />
            
            <FinancialMetricCard
              title="Profit Margin"
              value={`${financialSummary.profitMargin || '22.8'}%`}
              icon={<PercentIcon className="h-4 w-4 text-purple-500" />}
              gradient="from-purple-500/10 to-purple-500/5"
              change={{
                value: "1.5% from last period",
                type: "positive"
              }}
            />
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(financialSummary.revenueByCategory || {
                    "NBA": "42,560",
                    "NFL": "38,900",
                    "NHL": "22,100",
                    "Other": "48,440"
                  }).map(([category, value]) => (
                    <div key={category} className="flex flex-col space-y-1">
                      <div className="text-sm font-medium">{category}</div>
                      <div className="text-xl font-bold">${value}</div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            category === "NBA" ? "bg-blue-500" :
                            category === "NFL" ? "bg-green-500" :
                            category === "NHL" ? "bg-red-500" :
                            "bg-yellow-500"
                          }`} 
                          style={{ 
                            width: `${Math.min(100, parseInt(value.replace(/,/g, '')) / 1000)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users & Bets Tab */}
        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialMetricCard
              title="Total Users"
              value={financialSummary.totalUsers || '18,246'}
              icon={<Users className="h-4 w-4 text-blue-500" />}
              gradient="from-blue-500/10 to-blue-500/5"
              change={{
                value: "3.2% growth rate",
                type: "positive"
              }}
            />
            
            <FinancialMetricCard
              title="Active Users"
              value={financialSummary.activeUsers || '8,942'}
              icon={<Users className="h-4 w-4 text-green-500" />}
              gradient="from-green-500/10 to-green-500/5"
              change={{
                value: "49% of total users",
                type: "neutral"
              }}
            />
            
            <FinancialMetricCard
              title="New Users Today"
              value={financialSummary.newUsersToday || '124'}
              icon={<Users className="h-4 w-4 text-orange-500" />}
              gradient="from-orange-500/10 to-orange-500/5"
              change={{
                value: "5.2% from yesterday",
                type: "positive"
              }}
            />
            
            <FinancialMetricCard
              title="Conversion Rate"
              value={`${financialSummary.conversionRate || '16.4'}%`}
              icon={<Activity className="h-4 w-4 text-purple-500" />}
              gradient="from-purple-500/10 to-purple-500/5"
              change={{
                value: "2.1% from last period",
                type: "positive"
              }}
              subtitle="Visitors who place bets"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Betting Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Bets</div>
                    <div className="font-bold">{financialSummary.totalBets || '24,389'}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Average Bet Size</div>
                    <div className="font-bold">${financialSummary.avgBetSize || '178'}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Bets per Active User</div>
                    <div className="font-bold">2.7</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Win Rate</div>
                    <div className="font-bold">38.2%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-md">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Daily Active Users</div>
                    <div className="font-bold">5,247</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Average Session Time</div>
                    <div className="font-bold">18:42 min</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Retention Rate (7-day)</div>
                    <div className="font-bold">64.8%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">User Growth Rate</div>
                    <div className="font-bold">+3.2% / week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialMetricCard
              title="Monthly Growth"
              value={`${financialSummary.monthlyGrowth || '8.4'}%`}
              icon={<TrendingUp className="h-4 w-4 text-green-500" />}
              gradient="from-green-500/10 to-green-500/5"
              subtitle="Revenue growth rate"
            />
            
            <FinancialMetricCard
              title="Yearly Projection"
              value={`$${financialSummary.yearlyProjection || '2.4M'}`}
              icon={<Calendar className="h-4 w-4 text-blue-500" />}
              gradient="from-blue-500/10 to-blue-500/5"
              subtitle="Based on current trends"
            />
            
            <FinancialMetricCard
              title="User Growth Projection"
              value="32K"
              icon={<Users className="h-4 w-4 text-orange-500" />}
              gradient="from-orange-500/10 to-orange-500/5"
              subtitle="Expected by year end"
            />
            
            <FinancialMetricCard
              title="Projected Profit Margin"
              value="26.5%"
              icon={<PercentIcon className="h-4 w-4 text-purple-500" />}
              gradient="from-purple-500/10 to-purple-500/5"
              subtitle="EOY target"
            />
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-800/20 flex items-center justify-center mr-4">
                      <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Increase in Tournament Betting</div>
                      <div className="text-sm text-muted-foreground">Projected 32% revenue increase with expanded tournament offerings</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-800/20 flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold">User Referral Program</div>
                      <div className="text-sm text-muted-foreground">Potential 15% user base growth through incentivized referrals</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-800/20 flex items-center justify-center mr-4">
                      <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Esports Integration</div>
                      <div className="text-sm text-muted-foreground">Adding esports could increase platform revenue by 18%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveFinancialSummary;