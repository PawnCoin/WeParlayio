
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  Clock, 
  DollarSign,
  Smartphone,
  Mail,
  Bell,
  Lock,
  Unlock,
  Activity,
  Zap,
  RefreshCw,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';

const LiveSecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    isConnected, 
    connectionStatus, 
    lastMessage, 
    subscribe, 
    unsubscribe 
  } = useWebSocket();
  
  // Real-time monitoring state
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [accountFrozen, setAccountFrozen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(5000);
  const [withdrawalLimit, setWithdrawalLimit] = useState(2000);
  const [liveTransactions, setLiveTransactions] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<any[]>([]);

  // Real-time WebSocket data handling
  useEffect(() => {
    if (!isConnected || !isMonitoring) return;

    // Subscribe to security and transaction channels
    subscribe(['transactions', 'security_alerts', 'balance_updates', 'session_updates']);

    return () => {
      unsubscribe(['transactions', 'security_alerts', 'balance_updates', 'session_updates']);
    };
  }, [isConnected, isMonitoring, subscribe, unsubscribe]);

  // Handle real-time WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'transaction_update':
        const newTransaction = {
          id: Date.now(),
          type: lastMessage.data?.type || 'deposit',
          amount: lastMessage.data?.amount || 0,
          timestamp: new Date(),
          status: lastMessage.data?.status || 'pending',
          location: lastMessage.data?.location || 'Unknown',
          ipAddress: lastMessage.data?.ipAddress || '192.168.1.1',
          risk: lastMessage.data?.risk || 'low'
        };

        setLiveTransactions(prev => [newTransaction, ...prev.slice(0, 19)]);

        if (newTransaction.risk === 'high') {
          setSuspiciousActivity(prev => [newTransaction, ...prev.slice(0, 9)]);
        }
        break;

      case 'security_alert':
        setSuspiciousActivity(prev => [lastMessage.data, ...prev.slice(0, 9)]);
        break;

      case 'session_update':
        // Update active sessions from real-time data
        if (lastMessage.data?.sessions) {
          setActiveSessions(lastMessage.data.sessions);
        }
        break;
    }
  }, [lastMessage]);

  // Initialize mock session data
  useEffect(() => {
    setActiveSessions([
      {
        id: 1,
        device: 'Chrome on Windows',
        location: 'New York, NY',
        ipAddress: '192.168.1.100',
        loginTime: new Date(Date.now() - 30000),
        isCurrentSession: true
      },
      {
        id: 2,
        device: 'Safari on iPhone',
        location: 'Los Angeles, CA',
        loginTime: new Date(Date.now() - 300000),
        isCurrentSession: false
      }
    ]);
  }, []);

  const freezeAccount = () => {
    setAccountFrozen(true);
    setIsMonitoring(false);
    
    toast({
      title: "🔒 ACCOUNT FROZEN",
      description: "All transactions have been immediately suspended for security review.",
      variant: "destructive"
    });
  };

  const unfreezeAccount = () => {
    setAccountFrozen(false);
    setIsMonitoring(true);
    
    toast({
      title: "🔓 Account Unfrozen",
      description: "Normal banking operations have been restored.",
    });
  };

  const updateLimits = () => {
    toast({
      title: "Limits Updated",
      description: `Daily: $${dailyLimit}, Withdrawal: $${withdrawalLimit}`,
    });
  };

  const killSession = (sessionId: number) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({
      title: "Session Terminated",
      description: "Remote session has been forcibly logged out.",
    });
  };

  return (
    <div className="space-y-6">
      {/* REAL-TIME CONNECTION STATUS */}
      <Card className={`border-2 mb-4 ${isConnected ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`font-bold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                REAL-TIME MONITORING: {connectionStatus.toUpperCase()}
              </span>
            </div>
            <Badge className={isConnected ? 'bg-green-600' : 'bg-red-600'}>
              {isConnected ? 'LIVE' : 'DISCONNECTED'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* PANIC CONTROLS */}
      <Card className={`border-2 ${accountFrozen ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {accountFrozen ? <Lock className="h-6 w-6 text-red-600" /> : <Shield className="h-6 w-6 text-green-600" />}
              EMERGENCY CONTROLS
            </div>
            <Badge className={accountFrozen ? 'bg-red-600' : 'bg-green-600'}>
              {accountFrozen ? 'FROZEN' : 'ACTIVE'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={accountFrozen ? unfreezeAccount : freezeAccount}
              className={`h-16 text-lg font-bold ${
                accountFrozen 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {accountFrozen ? <Unlock className="h-6 w-6 mr-2" /> : <Lock className="h-6 w-6 mr-2" />}
              {accountFrozen ? 'UNFREEZE ACCOUNT' : 'FREEZE ACCOUNT'}
            </Button>
            
            <Button variant="outline" className="h-16 text-lg">
              <Mail className="h-6 w-6 mr-2" />
              EMERGENCY CONTACT
            </Button>
            
            <Button variant="outline" className="h-16 text-lg">
              <Smartphone className="h-6 w-6 mr-2" />
              SMS BACKUP ACCESS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* REAL-TIME TRANSACTION MONITOR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Transaction Monitor
              {isMonitoring && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </div>
            <Switch checked={isMonitoring} onCheckedChange={setIsMonitoring} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {liveTransactions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No recent transactions</p>
            )}
            {liveTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`h-4 w-4 ${
                      tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium">
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tx.location} • {tx.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    tx.risk === 'high' ? 'bg-red-100 text-red-800' :
                    tx.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {tx.risk.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline">{tx.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTION LIMITS CONTROL */}
      <Card>
        <CardHeader>
          <CardTitle>Instant Limit Controls</CardTitle>
          <CardDescription>Set and modify your transaction limits in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="daily-limit">Daily Spending Limit</Label>
              <Input
                id="daily-limit"
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="text-lg font-bold"
              />
            </div>
            <div>
              <Label htmlFor="withdrawal-limit">Single Withdrawal Limit</Label>
              <Input
                id="withdrawal-limit"
                type="number"
                value={withdrawalLimit}
                onChange={(e) => setWithdrawalLimit(Number(e.target.value))}
                className="text-lg font-bold"
              />
            </div>
          </div>
          <Button onClick={updateLimits} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Apply Limits Instantly
          </Button>
        </CardContent>
      </Card>

      {/* ACTIVE SESSIONS MONITOR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Active Login Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    session.isCurrentSession ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Smartphone className={`h-4 w-4 ${
                      session.isCurrentSession ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium">{session.device}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.location} • {session.ipAddress}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active since {session.loginTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.isCurrentSession ? (
                    <Badge className="bg-green-100 text-green-800">Current</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => killSession(session.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Kill Session
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SUSPICIOUS ACTIVITY ALERTS */}
      {suspiciousActivity.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Suspicious Activity Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suspiciousActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                  <div className="text-sm">
                    <span className="font-medium text-red-700">
                      {activity.type.toUpperCase()} ${activity.amount}
                    </span>
                    <span className="text-red-600 ml-2">
                      from {activity.location}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Allow
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="h-4 w-4 mr-1" />
                      Block
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSecurityMonitor;
