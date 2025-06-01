import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, MessageSquare, Settings, Send, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  subject: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
}

export default function NotificationManagement() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch notification templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/notifications/templates'],
    staleTime: 30 * 1000,
  });

  // Fetch notification settings
  const { data: settings } = useQuery({
    queryKey: ['/api/notifications/settings'],
    staleTime: 60 * 1000,
  });

  // Fetch notification statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/notifications/stats'],
    staleTime: 30 * 1000,
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
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      return apiRequest('PATCH', '/api/notifications/settings', newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Notification settings have been saved',
      });
    },
  });

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground">
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">Manage system notifications and templates</p>
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
          value={stats?.totalSentToday || 0}
          icon={Send}
          trend={stats?.dailyGrowth}
        />
        <StatCard
          title="Email Delivery Rate"
          value={`${stats?.emailDeliveryRate || 0}%`}
          icon={Mail}
        />
        <StatCard
          title="SMS Delivery Rate"
          value={`${stats?.smsDeliveryRate || 0}%`}
          icon={MessageSquare}
        />
        <StatCard
          title="Active Templates"
          value={templates?.filter((t: any) => t.isActive).length || 0}
          icon={Bell}
        />
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="test">Test Notifications</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
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
                {templatesLoading ? (
                  <div className="text-center py-8">Loading templates...</div>
                ) : templates?.length > 0 ? (
                  templates.map((template: NotificationTemplate) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendTestMutation.mutate({
                            type: template.type,
                            recipient: 'test@example.com',
                            template: template.id
                          })}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates found
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
                Configure notification providers and delivery settings
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
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ emailEnabled: checked })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        value={settings?.smtpHost || ''}
                        placeholder="smtp.gmail.com"
                        onChange={(e) => 
                          updateSettingsMutation.mutate({ smtpHost: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        value={settings?.smtpPort || ''}
                        placeholder="587"
                        onChange={(e) => 
                          updateSettingsMutation.mutate({ smtpPort: parseInt(e.target.value) })
                        }
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
                        onCheckedChange={(checked) => 
                          updateSettingsMutation.mutate({ smsEnabled: checked })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilio-sid">Twilio Account SID</Label>
                      <Input
                        id="twilio-sid"
                        value={settings?.twilioAccountSid || ''}
                        placeholder="ACxxxxxxxxxxxxx"
                        onChange={(e) => 
                          updateSettingsMutation.mutate({ twilioAccountSid: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilio-phone">From Phone Number</Label>
                      <Input
                        id="twilio-phone"
                        value={settings?.twilioFromNumber || ''}
                        placeholder="+1234567890"
                        onChange={(e) => 
                          updateSettingsMutation.mutate({ twilioFromNumber: e.target.value })
                        }
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
                Send test notifications to verify your configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Test</h3>
                  <div className="space-y-3">
                    <Input placeholder="test@example.com" />
                    <Button 
                      onClick={() => sendTestMutation.mutate({
                        type: 'email',
                        recipient: 'test@example.com',
                        template: 1
                      })}
                      disabled={sendTestMutation.isPending}
                    >
                      Send Test Email
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SMS Test</h3>
                  <div className="space-y-3">
                    <Input placeholder="+1234567890" />
                    <Button 
                      onClick={() => sendTestMutation.mutate({
                        type: 'sms',
                        recipient: '+1234567890',
                        template: 1
                      })}
                      disabled={sendTestMutation.isPending}
                    >
                      Send Test SMS
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Logs</CardTitle>
              <CardDescription>
                View recent notification delivery logs and failures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Notification logs will appear here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}