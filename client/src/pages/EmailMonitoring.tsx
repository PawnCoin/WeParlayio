import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, MailCheck, MailX, Search, Filter, RefreshCw, 
  Users, TrendingUp, AlertTriangle, CheckCircle,
  MessageSquare, Bell, Eye, Download
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EmailLog {
  id: string;
  type: 'welcome' | 'bet_confirmation' | 'win_notification' | 'security_alert' | 'admin_alert' | 'promo';
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  userId?: string;
  metadata?: any;
}

export default function EmailMonitoring() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalEmails: 0,
    successRate: 0,
    todayCount: 0,
    failedCount: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailLogs();
    fetchStats();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/email-logs');
      const data = await response.json();
      setEmailLogs(data.emails || []);
      setSmsLogs(data.sms || []);
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
      // Show demo data for development
      setEmailLogs([
        {
          id: '1',
          type: 'welcome',
          recipient: 'user@example.com',
          subject: 'Welcome to WeParlay - Your Sports Betting Adventure Begins!',
          status: 'sent',
          timestamp: new Date().toISOString(),
          userId: 'user_123',
          metadata: { registrationType: 'quick' }
        },
        {
          id: '2',
          type: 'admin_alert',
          recipient: 'support@weparlay.io',
          subject: 'WeParlay Admin Alert: New User Registration',
          status: 'sent',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          metadata: { newUserId: 'user_123' }
        },
        {
          id: '3',
          type: 'bet_confirmation',
          recipient: 'player@example.com',
          subject: 'Bet Confirmed - Lakers vs Warriors',
          status: 'sent',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userId: 'user_456',
          metadata: { betAmount: 50, event: 'Lakers vs Warriors' }
        },
        {
          id: '4',
          type: 'win_notification',
          recipient: 'winner@example.com',
          subject: '🎉 Congratulations! You Won!',
          status: 'sent',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          userId: 'user_789',
          metadata: { winAmount: 95 }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/email-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      // Demo stats
      setStats({
        totalEmails: 1247,
        successRate: 98.5,
        todayCount: 23,
        failedCount: 3
      });
    }
  };

  const testEmailSystem = async () => {
    try {
      const response = await apiRequest('POST', '/api/notifications/test-email', {
        type: 'welcome',
        recipient: 'support@weparlay.io'
      });
      
      if (response.ok) {
        toast({
          title: "✅ Email Test Successful",
          description: "Test email sent to support@weparlay.io"
        });
        fetchEmailLogs();
      }
    } catch (error) {
      toast({
        title: "❌ Email Test Failed",
        description: "Check your SMTP configuration",
        variant: "destructive"
      });
    }
  };

  const filteredLogs = emailLogs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch = log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Users className="h-4 w-4" />;
      case 'bet_confirmation': return <CheckCircle className="h-4 w-4" />;
      case 'win_notification': return <TrendingUp className="h-4 w-4" />;
      case 'security_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'admin_alert': return <Bell className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500"><MailCheck className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><MailX className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📧 Email & SMS Monitoring</h1>
            <p className="text-gray-600">Monitor all communications sent to users and admin</p>
          </div>
          <Button onClick={testEmailSystem} className="bg-blue-600 hover:bg-blue-700">
            <Mail className="h-4 w-4 mr-2" />
            Test Email System
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold">{stats.totalEmails.toLocaleString()}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Count</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.todayCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Email Communication Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by recipient or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="welcome">Welcome Emails</SelectItem>
                  <SelectItem value="bet_confirmation">Bet Confirmations</SelectItem>
                  <SelectItem value="win_notification">Win Notifications</SelectItem>
                  <SelectItem value="security_alert">Security Alerts</SelectItem>
                  <SelectItem value="admin_alert">Admin Alerts</SelectItem>
                  <SelectItem value="promo">Promotional</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchEmailLogs} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Email Logs Table */}
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getTypeIcon(log.type)}
                          <span className="capitalize">{log.type.replace('_', ' ')}</span>
                        </div>
                        {getStatusBadge(log.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">{log.subject}</p>
                        <p className="text-sm text-gray-600">To: {log.recipient}</p>
                        {log.userId && (
                          <p className="text-xs text-gray-500">User ID: {log.userId}</p>
                        )}
                      </div>

                      {log.metadata && (
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          <strong>Details:</strong> {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No email logs found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Communication Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smsLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No SMS logs available</p>
                  <p className="text-sm">SMS notifications will appear here when sent</p>
                </div>
              ) : (
                smsLogs.map((sms, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sms.message}</p>
                        <p className="text-sm text-gray-600">To: {sms.recipient}</p>
                      </div>
                      <Badge variant={sms.status === 'sent' ? 'default' : 'destructive'}>
                        {sms.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}