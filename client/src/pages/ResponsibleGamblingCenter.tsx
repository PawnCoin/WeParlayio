import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar,
  Eye,
  Lock,
  Heart,
  Phone
} from 'lucide-react';

export default function ResponsibleGamblingCenter() {
  const [depositLimitEnabled, setDepositLimitEnabled] = useState(true);
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(false);
  const [realityChecksEnabled, setRealityChecksEnabled] = useState(true);
  const [selfExclusionActive, setSelfExclusionActive] = useState(false);

  // This would come from your responsible gambling service
  const rgData = {
    currentLimits: {
      dailyDeposit: 500,
      weeklyDeposit: 1500,
      monthlyDeposit: 5000,
      sessionTime: 120, // minutes
      realityCheckInterval: 60 // minutes
    },
    spendingAnalysis: {
      thisWeek: 850,
      lastWeek: 1200,
      thisMonth: 2400,
      trend: 'decreasing'
    },
    timeAnalysis: {
      todayMinutes: 45,
      weeklyAverage: 90,
      longestSession: 180,
      trend: 'healthy'
    },
    riskAssessment: {
      level: 'low',
      score: 25,
      factors: ['moderate_spending', 'healthy_session_times', 'regular_breaks']
    },
    coolingOffHistory: [
      { period: '24_hours', date: '2024-11-15', reason: 'voluntary_break' },
      { period: '7_days', date: '2024-10-20', reason: 'loss_limit_reached' }
    ],
    supportResources: [
      { name: 'GamCare', phone: '0808 8020 133', website: 'gamcare.org.uk' },
      { name: 'Gamblers Anonymous', phone: '020 7384 3040', website: 'gamblersanonymous.org.uk' },
      { name: 'BeGambleAware', phone: '0808 8020 133', website: 'begambleaware.org' }
    ]
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (trend === 'decreasing') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Shield className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Responsible Gambling Center</h1>
        <p className="text-gray-600">Tools and resources to help you stay in control</p>
      </div>

      {/* Risk Assessment Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Risk Assessment</span>
            <Badge className={getRiskColor(rgData.riskAssessment.level)}>
              {rgData.riskAssessment.level.toUpperCase()} RISK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{rgData.riskAssessment.score}/100</div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <Progress value={rgData.riskAssessment.score} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2 flex items-center justify-center">
                ${rgData.spendingAnalysis.thisWeek}
                {getTrendIcon(rgData.spendingAnalysis.trend)}
              </div>
              <p className="text-sm text-gray-600">This Week's Spending</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2 flex items-center justify-center">
                {rgData.timeAnalysis.todayMinutes}m
                {getTrendIcon(rgData.timeAnalysis.trend)}
              </div>
              <p className="text-sm text-gray-600">Today's Session Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="limits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="limits">Deposit & Time Limits</TabsTrigger>
          <TabsTrigger value="analytics">Spending Analytics</TabsTrigger>
          <TabsTrigger value="controls">Safety Controls</TabsTrigger>
          <TabsTrigger value="support">Get Support</TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Deposit Limits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="depositLimitToggle">Enable Deposit Limits</Label>
                  <Switch 
                    id="depositLimitToggle"
                    checked={depositLimitEnabled}
                    onCheckedChange={setDepositLimitEnabled}
                  />
                </div>
                
                {depositLimitEnabled && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
                      <Input 
                        id="dailyLimit" 
                        type="number" 
                        defaultValue={rgData.currentLimits.dailyDeposit}
                        placeholder="Enter daily limit"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weeklyLimit">Weekly Limit ($)</Label>
                      <Input 
                        id="weeklyLimit" 
                        type="number" 
                        defaultValue={rgData.currentLimits.weeklyDeposit}
                        placeholder="Enter weekly limit"
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyLimit">Monthly Limit ($)</Label>
                      <Input 
                        id="monthlyLimit" 
                        type="number" 
                        defaultValue={rgData.currentLimits.monthlyDeposit}
                        placeholder="Enter monthly limit"
                      />
                    </div>
                  </div>
                )}
                
                <Button className="w-full">Update Deposit Limits</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Session Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sessionTimeout">Session Time Limits</Label>
                  <Switch 
                    id="sessionTimeout"
                    checked={sessionTimeoutEnabled}
                    onCheckedChange={setSessionTimeoutEnabled}
                  />
                </div>
                
                {sessionTimeoutEnabled && (
                  <div>
                    <Label htmlFor="sessionTime">Max Session Time (minutes)</Label>
                    <Input 
                      id="sessionTime" 
                      type="number" 
                      defaultValue={rgData.currentLimits.sessionTime}
                      placeholder="Enter session limit"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="realityChecks">Reality Check Reminders</Label>
                  <Switch 
                    id="realityChecks"
                    checked={realityChecksEnabled}
                    onCheckedChange={setRealityChecksEnabled}
                  />
                </div>
                
                {realityChecksEnabled && (
                  <div>
                    <Label htmlFor="realityInterval">Reminder Interval (minutes)</Label>
                    <Select defaultValue={rgData.currentLimits.realityCheckInterval.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button className="w-full">Update Session Controls</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-bold">${rgData.spendingAnalysis.thisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Week</span>
                    <span className="font-bold">${rgData.spendingAnalysis.lastWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-bold">${rgData.spendingAnalysis.thisMonth}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(rgData.spendingAnalysis.trend)}
                      <span className="text-sm">
                        Spending trend: {rgData.spendingAnalysis.trend}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today</span>
                    <span className="font-bold">{rgData.timeAnalysis.todayMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weekly Average</span>
                    <span className="font-bold">{rgData.timeAnalysis.weeklyAverage} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Longest Session</span>
                    <span className="font-bold">{rgData.timeAnalysis.longestSession} minutes</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(rgData.timeAnalysis.trend)}
                      <span className="text-sm">
                        Session pattern: {rgData.timeAnalysis.trend}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rgData.riskAssessment.factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="capitalize">{factor.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Self-Exclusion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Self-exclusion prevents you from accessing your account for a chosen period. 
                  This action cannot be reversed once activated.
                </p>
                
                <div className="space-y-2">
                  <Label>Exclusion Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose exclusion period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="48h">48 Hours</SelectItem>
                      <SelectItem value="1w">1 Week</SelectItem>
                      <SelectItem value="1m">1 Month</SelectItem>
                      <SelectItem value="3m">3 Months</SelectItem>
                      <SelectItem value="6m">6 Months</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="destructive" className="w-full">
                  Activate Self-Exclusion
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cooling-Off Periods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Take a short break from betting. You can reactivate your account after the cooling-off period ends.
                </p>
                
                <div className="space-y-2">
                  <Label>Break Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose break duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="6h">6 Hours</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="72h">72 Hours</SelectItem>
                      <SelectItem value="1w">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="w-full">
                  Start Cooling-Off Period
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cooling-Off History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rgData.coolingOffHistory.map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium capitalize">{period.period.replace('_', ' ')}</span>
                      <p className="text-sm text-gray-600">{period.date}</p>
                    </div>
                    <Badge variant="outline">{period.reason.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Professional Support Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rgData.supportResources.map((resource, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{resource.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{resource.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>{resource.website}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Contact Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warning Signs of Problem Gambling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Behavioral Signs</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Gambling for longer than planned</li>
                    <li>• Increasing bet amounts to feel excitement</li>
                    <li>• Chasing losses with bigger bets</li>
                    <li>• Gambling to escape problems or negative feelings</li>
                    <li>• Lying about gambling activities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Financial Signs</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Spending more money than intended</li>
                    <li>• Borrowing money to gamble</li>
                    <li>• Hiding financial losses</li>
                    <li>• Neglecting bills or responsibilities</li>
                    <li>• Using credit cards for gambling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emergency Alerts */}
      <div className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your current risk assessment shows healthy gambling patterns. Continue using the tools above to maintain control.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            Remember: All limit changes have a 24-hour cooling period before taking effect to prevent impulsive decisions.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}