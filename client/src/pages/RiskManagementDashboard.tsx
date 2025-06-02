import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Eye,
  Clock,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function RiskManagementDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [riskThreshold, setRiskThreshold] = useState('medium');

  // Real-time risk management data - would come from your risk engine
  const riskData = {
    realTimeAlerts: [
      {
        id: 1,
        type: 'arbitrage_detected',
        severity: 'high',
        user: 'user_4532',
        description: 'Potential arbitrage betting pattern detected across multiple events',
        timestamp: '2 minutes ago',
        value: '$2,450'
      },
      {
        id: 2,
        type: 'unusual_betting_volume',
        severity: 'medium',
        user: 'user_7891',
        description: 'Betting volume 400% above normal pattern',
        timestamp: '8 minutes ago',
        value: '$890'
      },
      {
        id: 3,
        type: 'sharp_money_indicator',
        severity: 'high',
        user: 'user_2156',
        description: 'Consistent profitable betting pattern - possible professional bettor',
        timestamp: '15 minutes ago',
        value: '$5,200'
      }
    ],
    exposureMetrics: {
      totalExposure: 125400,
      maxSingleEventExposure: 45000,
      sharpMoneyPercentage: 23,
      publicMoneyPercentage: 77,
      bookAdvantage: 4.2
    },
    fraudDetection: {
      suspiciousAccounts: 12,
      blockedTransactions: 8,
      investigationQueue: 5,
      falsePositiveRate: 2.1
    },
    bettingPatterns: {
      arbers: { count: 7, exposure: 15600 },
      sharps: { count: 23, exposure: 89400 },
      syndicates: { count: 3, exposure: 125000 },
      recreational: { count: 2847, exposure: 234500 }
    },
    lineMovement: [
      {
        event: 'Lakers vs Warriors',
        originalLine: -3.5,
        currentLine: -5.0,
        movement: -1.5,
        sharpAction: 'heavy_favorite',
        publicSplit: '78% Lakers'
      },
      {
        event: 'Chiefs vs Bills',
        originalLine: -2.5,
        currentLine: -1.0,
        movement: +1.5,
        sharpAction: 'underdog_support',
        publicSplit: '65% Chiefs'
      }
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'arbitrage_detected': return <Target className="h-4 w-4" />;
      case 'unusual_betting_volume': return <TrendingUp className="h-4 w-4" />;
      case 'sharp_money_indicator': return <Eye className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Risk Management Dashboard</h1>
        <p className="text-gray-600">Real-time fraud detection and betting pattern analysis</p>
      </div>

      {/* Real-time Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${riskData.exposureMetrics.totalExposure.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all active events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharp Money</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskData.exposureMetrics.sharpMoneyPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs {riskData.exposureMetrics.publicMoneyPercentage}% public
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskData.realTimeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Book Advantage</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskData.exposureMetrics.bookAdvantage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current hold percentage
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Live Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Betting Patterns</TabsTrigger>
          <TabsTrigger value="line-movement">Line Movement</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Real-Time Risk Alerts</span>
                <div className="flex space-x-2">
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskData.realTimeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {getRiskIcon(alert.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{alert.description}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>User: {alert.user}</span>
                          <span>Value: {alert.value}</span>
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Investigate</Button>
                      <Button size="sm" variant="destructive">Block</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bettor Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(riskData.bettingPatterns).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                        <div className="text-sm text-gray-600">{data.count} users</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${data.exposure.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">exposure</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="riskLevel">Risk Tolerance Level</Label>
                  <Select value={riskThreshold} onValueChange={setRiskThreshold}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Maximum Single Bet Exposure</Label>
                  <Input type="number" placeholder="Enter max bet amount" />
                </div>
                
                <div className="space-y-2">
                  <Label>Sharp Money Alert Threshold (%)</Label>
                  <Input type="number" placeholder="25" />
                </div>
                
                <Button className="w-full">Update Risk Parameters</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="line-movement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Line Movement Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskData.lineMovement.map((line, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{line.event}</h4>
                      <Badge variant={Math.abs(line.movement) > 1 ? 'destructive' : 'default'}>
                        {line.movement > 0 ? '+' : ''}{line.movement}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Original:</span>
                        <div className="font-medium">{line.originalLine}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <div className="font-medium">{line.currentLine}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Sharp Action:</span>
                        <div className="font-medium capitalize">{line.sharpAction.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Public Split:</span>
                        <div className="font-medium">{line.publicSplit}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Detection Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Suspicious Accounts</span>
                    <Badge variant="destructive">{riskData.fraudDetection.suspiciousAccounts}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Blocked Transactions</span>
                    <Badge variant="outline">{riskData.fraudDetection.blockedTransactions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Investigation Queue</span>
                    <Badge variant="secondary">{riskData.fraudDetection.investigationQueue}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>False Positive Rate</span>
                    <Badge variant="default">{riskData.fraudDetection.falsePositiveRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auto-block suspicious patterns</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Limit exposure on sharp money</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dynamic line adjustment</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>KYC re-verification triggers</span>
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Critical Alerts */}
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sharp money concentration detected on Lakers vs Warriors. Consider adjusting limits or suspending market.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Current exposure levels are within acceptable risk parameters. All automated systems operational.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}