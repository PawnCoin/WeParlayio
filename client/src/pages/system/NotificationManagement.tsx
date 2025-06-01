import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Mail, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';

interface NotificationStatistics {
  totalSentToday: number;
  dailyGrowth: number;
  emailDeliveryRate: number;
  smsDeliveryRate: number;
  lastUpdated: string;
}

interface NotificationTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  status: 'active' | 'inactive';
}

interface NotificationSettings {
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smsEnabled: boolean;
  twilioAccountSid: string;
  twilioFromNumber: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-1">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

export default function NotificationManagement() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch notification statistics from real backend
  const { data: statistics, isLoading: statisticsLoading } = useQuery<NotificationStatistics>({
    queryKey: ['/api/notifications/statistics'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch notification templates from real backend
  const { data: templates, isLoading: templatesLoading } = useQuery<NotificationTemplate[]>({
    queryKey: ['/api/notifications/templates'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch notification settings from real backend
  const { data: settings, isLoading: settingsLoading } = useQuery<NotificationSettings>({
    queryKey: ['/api/notifications/settings'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Send test notification mutation
  const sendTestMutation = useMutation({
    mutationFn: async (data: { type: string; recipient: string; template: number }) => {
      return apiRequest('POST', '/api/notifications/test', data);
    },
    onSuccess: () => {
      toast({
        title: 'Test Notification Sent',
        description: 'Check your email/phone for the test notification',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Send Test',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<NotificationSettings>) => {
      return apiRequest('PUT', '/api/notifications/settings', updatedSettings);
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Notification settings have been saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (statisticsLoading || templatesLoading || settingsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">
            Monitor and configure platform notification systems
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Bell className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sent Today"
          value={statistics?.totalSentToday || 0}
          icon={Send}
          trend={statistics?.dailyGrowth}
        />
        <StatCard
          title="Email Delivery Rate"
          value={`${statistics?.emailDeliveryRate || 0}%`}
          icon={Mail}
        />
        <StatCard
          title="SMS Delivery Rate"
          value={`${statistics?.smsDeliveryRate || 0}%`}
          icon={MessageSquare}
        />
        <StatCard
          title="Active Templates"
          value={templates?.filter(t => t.status === 'active').length || 0}
          icon={Bell}
        />
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="test">Test Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Manage email, SMS, and push notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates && templates.length > 0 ? (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Type: {template.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No notification templates found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email and SMS notification providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-enabled">Email Notifications</Label>
                      <Switch
                        id="email-enabled"
                        checked={settings?.emailEnabled || false}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        value={settings?.smtpHost || ''}
                        placeholder="smtp.gmail.com"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        value={settings?.smtpPort || 587}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SMS Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-enabled">SMS Notifications</Label>
                      <Switch
                        id="sms-enabled"
                        checked={settings?.smsEnabled || false}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilio-sid">Twilio Account SID</Label>
                      <Input
                        id="twilio-sid"
                        value={settings?.twilioAccountSid || ''}
                        placeholder="AC***"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilio-phone">From Phone Number</Label>
                      <Input
                        id="twilio-phone"
                        value={settings?.twilioFromNumber || ''}
                        placeholder="+1234567890"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>
                Send test notifications to verify system functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => sendTestMutation.mutate({
                    type: 'email',
                    recipient: 'test@example.com',
                    template: 1
                  })}
                  disabled={sendTestMutation.isPending}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Test Email
                </Button>
                <Button
                  onClick={() => sendTestMutation.mutate({
                    type: 'sms',
                    recipient: '+1234567890',
                    template: 2
                  })}
                  disabled={sendTestMutation.isPending}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Test SMS
                </Button>
              </div>
              {statistics && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(statistics.lastUpdated).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}