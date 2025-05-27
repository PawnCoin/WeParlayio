import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, TrendingUp, FileText, Download } from 'lucide-react';

export default function IncomeTracker() {
  const [selectedMonth, setSelectedMonth] = useState('april');
  
  // Professional income tracking data structure
  const incomeData = {
    april: {
      month: 'April 2025',
      totalIncome: 24000,
      sources: [
        { source: 'WeParlay Platform Revenue', amount: 12500, type: 'Business Income' },
        { source: 'Sports Betting Winnings', amount: 6800, type: 'Gaming Income' },
        { source: 'Consulting Services', amount: 3200, type: 'Professional Services' },
        { source: 'API Integration Payments', amount: 1500, type: 'Technical Services' }
      ],
      transactions: [
        { date: '2025-04-03', description: 'Platform Revenue Payment', amount: 4200, type: 'Credit' },
        { date: '2025-04-07', description: 'Betting Pool Winnings', amount: 2100, type: 'Credit' },
        { date: '2025-04-12', description: 'Client Consulting Fee', amount: 1600, type: 'Credit' },
        { date: '2025-04-18', description: 'Monthly Platform Share', amount: 3800, type: 'Credit' },
        { date: '2025-04-22', description: 'Tournament Winnings', amount: 2900, type: 'Credit' },
        { date: '2025-04-25', description: 'API Development Fee', amount: 1500, type: 'Credit' },
        { date: '2025-04-28', description: 'Weekly Betting Profits', amount: 1800, type: 'Credit' },
        { date: '2025-04-30', description: 'End-of-Month Bonus', amount: 4500, type: 'Credit' }
      ]
    },
    may: {
      month: 'May 2025',
      totalIncome: 24200,
      sources: [
        { source: 'WeParlay Platform Revenue', amount: 13200, type: 'Business Income' },
        { source: 'Sports Betting Winnings', amount: 6200, type: 'Gaming Income' },
        { source: 'Consulting Services', amount: 3400, type: 'Professional Services' },
        { source: 'Technical Integration', amount: 1400, type: 'Technical Services' }
      ],
      transactions: [
        { date: '2025-05-02', description: 'Platform Revenue Payment', amount: 4400, type: 'Credit' },
        { date: '2025-05-06', description: 'Major Tournament Win', amount: 3100, type: 'Credit' },
        { date: '2025-05-11', description: 'Consulting Project Complete', amount: 1700, type: 'Credit' },
        { date: '2025-05-15', description: 'Monthly Platform Dividend', amount: 3900, type: 'Credit' },
        { date: '2025-05-20', description: 'Betting Strategy Profits', amount: 2200, type: 'Credit' },
        { date: '2025-05-23', description: 'Technical Implementation', amount: 1400, type: 'Credit' },
        { date: '2025-05-27', description: 'Weekly Performance Bonus', amount: 2000, type: 'Credit' },
        { date: '2025-05-31', description: 'Month-End Platform Share', amount: 4900, type: 'Credit' }
      ]
    }
  };

  const currentData = incomeData[selectedMonth as keyof typeof incomeData];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generateReport = (monthData: any) => {
    const reportContent = `
INCOME SUMMARY REPORT
${monthData.month}

TOTAL INCOME: ${formatCurrency(monthData.totalIncome)}

INCOME SOURCES:
${monthData.sources.map((source: any) => 
  `• ${source.source}: ${formatCurrency(source.amount)} (${source.type})`
).join('\n')}

DETAILED TRANSACTIONS:
${monthData.transactions.map((tx: any) => 
  `${tx.date} | ${tx.description} | ${formatCurrency(tx.amount)}`
).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Income_Report_${monthData.month.replace(' ', '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Professional Income Tracker
        </h1>
        <p className="text-xl text-gray-600">
          Track and document your earnings with professional reporting
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Income Summary</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Details</TabsTrigger>
          <TabsTrigger value="reports">Generate Reports</TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedMonth === 'april' ? 'default' : 'outline'}
            onClick={() => setSelectedMonth('april')}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>April 2025</span>
          </Button>
          <Button
            variant={selectedMonth === 'may' ? 'default' : 'outline'}
            onClick={() => setSelectedMonth('may')}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>May 2025</span>
          </Button>
        </div>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span>{currentData.month} Income Summary</span>
              </CardTitle>
              <CardDescription>
                Comprehensive breakdown of income sources and totals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatCurrency(currentData.totalIncome)}
                    </div>
                    <div className="text-green-800 font-medium">Total Monthly Income</div>
                  </div>
                  
                  <div className="space-y-3">
                    {currentData.sources.map((source, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">{source.source}</div>
                          <Badge variant="outline" className="text-xs">{source.type}</Badge>
                        </div>
                        <div className="font-bold text-green-600">
                          {formatCurrency(source.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Income Distribution</h3>
                  {currentData.sources.map((source, index) => {
                    const percentage = (source.amount / currentData.totalIncome) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{source.source}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{currentData.month} Transaction History</CardTitle>
              <CardDescription>
                Detailed record of all income transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.transactions.map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-green-600">
                        {transaction.type}
                      </Badge>
                      <div className="font-bold text-green-600 text-lg">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Transactions:</span>
                  <span className="font-bold">{currentData.transactions.length}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(currentData.totalIncome)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span>Generate Professional Reports</span>
              </CardTitle>
              <CardDescription>
                Create downloadable income reports for your records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Reports</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => generateReport(incomeData.april)}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      April 2025 Income Report ({formatCurrency(incomeData.april.totalIncome)})
                    </Button>
                    <Button
                      onClick={() => generateReport(incomeData.may)}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      May 2025 Income Report ({formatCurrency(incomeData.may.totalIncome)})
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Report Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Complete income breakdown</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Detailed transaction history</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Professional formatting</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Date and time stamped</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Downloadable text format</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}