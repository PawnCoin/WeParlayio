import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageSquare, Send, Bell, Settings, Users, AlertTriangle,
  CheckCircle, Clock, Smartphone, Globe, Shield, Zap,
  TrendingUp, DollarSign, Target, Crown, Star, Award
} from "lucide-react";

interface SMSMessage {
  id: string;
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: string;
  type: 'promotional' | 'transactional' | 'alert' | 'verification';
  cost: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  type: 'welcome' | 'bet_confirmation' | 'payout' | 'promotion' | 'alert';
  variables: string[];
}

interface SMSSettings {
  enabled: boolean;
  marketingConsent: boolean;
  alertsEnabled: boolean;
  betNotifications: boolean;
  payoutNotifications: boolean;
  emergencyAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const SMSCenter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [bulkRecipients, setBulkRecipients] = useState('');

  // Fetch SMS messages history
  const { data: messages = [], isLoading: messagesLoading } = useQuery<SMSMessage[]>({
    queryKey: ['/api/sms/messages'],
    enabled: isAuthenticated
  });

  // Fetch SMS templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<SMSTemplate[]>({
    queryKey: ['/api/sms/templates'],
    enabled: isAuthenticated
  });

  // Fetch SMS settings
  const { data: smsSettings, isLoading: settingsLoading } = useQuery<SMSSettings>({
    queryKey: ['/api/sms/settings'],
    enabled: isAuthenticated
  });

  // Fetch SMS analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/sms/analytics'],
    enabled: isAuthenticated
  });

  // Send single SMS mutation
  const sendSMSMutation = useMutation({
    mutationFn: async (data: { recipient: string; message: string; type: string }) => {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send SMS');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SMS Sent",
        description: "Your message has been sent successfully",
      });
      setRecipient('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/sms/messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "SMS Failed",
        description: error.message || "Failed to send SMS",
        variant: "destructive",
      });
    }
  });

  // Send bulk SMS mutation
  const sendBulkSMSMutation = useMutation({
    mutationFn: async (data: { recipients: string[]; message: string; type: string }) => {
      const response = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send bulk SMS');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk SMS Sent",
        description: `Messages sent to ${data.sentCount} recipients`,
      });
      setBulkRecipients('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/sms/messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk SMS Failed",
        description: error.message || "Failed to send bulk SMS",
        variant: "destructive",
      });
    }
  });

  // Update SMS settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SMSSettings>) => {
      const response = await fetch('/api/sms/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "SMS preferences saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sms/settings'] });
    }
  });

  const handleSendSMS = () => {
    if (!recipient.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both recipient and message",
        variant: "destructive",
      });
      return;
    }

    sendSMSMutation.mutate({
      recipient: recipient.trim(),
      message: message.trim(),
      type: 'promotional'
    });
  };

  const handleSendBulkSMS = () => {
    const recipients = bulkRecipients
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (recipients.length === 0 || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter recipients and message",
        variant: "destructive",
      });
      return;
    }

    sendBulkSMSMutation.mutate({
      recipients,
      message: message.trim(),
      type: 'promotional'
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-3 w-3" />;
      case 'delivered': return <CheckCircle className="h-3 w-3" />;
      case 'failed': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access the SMS Center</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            SMS Center
          </h1>
          <p className="text-muted-foreground">Manage SMS communications and notifications</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Smartphone className="h-3 w-3" />
          Twilio Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-1">
            <Send className="h-4 w-4" />
            Send SMS
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Bulk SMS
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-500" />
                  Messages Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalSent || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analytics?.sentToday || 0} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Delivery Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.deliveryRate || 98}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics?.totalCost || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full text-white ${getStatusColor(msg.status)}`}>
                          {getStatusIcon(msg.status)}
                        </div>
                        <div>
                          <p className="font-medium">{formatPhoneNumber(msg.recipient)}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">
                          {msg.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Send SMS Tab */}
        <TabsContent value="send">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Single SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Recipient Phone Number</Label>
                  <Input
                    id="recipient"
                    placeholder="+1 (555) 123-4567"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.length}/160 characters
                  </p>
                </div>

                <Button
                  onClick={handleSendSMS}
                  disabled={sendSMSMutation.isPending}
                  className="w-full"
                >
                  {sendSMSMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Message Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {template.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bulk SMS Tab */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk SMS Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulk-recipients">Recipients (one per line)</Label>
                <Textarea
                  id="bulk-recipients"
                  placeholder="+1 (555) 123-4567&#10;+1 (555) 987-6543&#10;+1 (555) 456-7890"
                  value={bulkRecipients}
                  onChange={(e) => setBulkRecipients(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bulkRecipients.split('\n').filter(r => r.trim()).length} recipients
                </p>
              </div>

              <div>
                <Label htmlFor="bulk-message">Message</Label>
                <Textarea
                  id="bulk-message"
                  placeholder="Enter your bulk message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSendBulkSMS}
                disabled={sendBulkSMSMutation.isPending}
                className="w-full"
              >
                {sendBulkSMSMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending Bulk SMS...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Send Bulk SMS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SMS History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messagesLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No messages sent yet</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full text-white ${getStatusColor(msg.status)}`}>
                          {getStatusIcon(msg.status)}
                        </div>
                        <div>
                          <p className="font-medium">{formatPhoneNumber(msg.recipient)}</p>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize mb-2">
                          {msg.type}
                        </Badge>
                        <p className="text-sm font-medium">${msg.cost.toFixed(4)}</p>
                        <Badge variant="outline" className={`capitalize ${
                          msg.status === 'delivered' ? 'border-green-500 text-green-500' :
                          msg.status === 'failed' ? 'border-red-500 text-red-500' :
                          'border-blue-500 text-blue-500'
                        }`}>
                          {msg.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {smsSettings && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-enabled">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable SMS notifications
                        </p>
                      </div>
                      <Switch
                        id="sms-enabled"
                        checked={smsSettings.enabled}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ enabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-consent">Marketing Messages</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional offers
                        </p>
                      </div>
                      <Switch
                        id="marketing-consent"
                        checked={smsSettings.marketingConsent}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ marketingConsent: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="bet-notifications">Bet Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for bet confirmations
                        </p>
                      </div>
                      <Switch
                        id="bet-notifications"
                        checked={smsSettings.betNotifications}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ betNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="payout-notifications">Payout Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for winnings
                        </p>
                      </div>
                      <Switch
                        id="payout-notifications"
                        checked={smsSettings.payoutNotifications}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ payoutNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emergency-alerts">Emergency Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Critical security alerts
                        </p>
                      </div>
                      <Switch
                        id="emergency-alerts"
                        checked={smsSettings.emergencyAlerts}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ emergencyAlerts: checked })
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quiet Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {smsSettings && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                        <p className="text-sm text-muted-foreground">
                          No notifications during these hours
                        </p>
                      </div>
                      <Switch
                        id="quiet-hours"
                        checked={smsSettings.quietHours.enabled}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({
                            quietHours: { ...smsSettings.quietHours, enabled: checked }
                          })
                        }
                      />
                    </div>

                    {smsSettings.quietHours.enabled && (
                      <>
                        <div>
                          <Label htmlFor="quiet-start">Start Time</Label>
                          <Input
                            id="quiet-start"
                            type="time"
                            value={smsSettings.quietHours.start}
                            onChange={(e) =>
                              updateSettingsMutation.mutate({
                                quietHours: {
                                  ...smsSettings.quietHours,
                                  start: e.target.value
                                }
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="quiet-end">End Time</Label>
                          <Input
                            id="quiet-end"
                            type="time"
                            value={smsSettings.quietHours.end}
                            onChange={(e) =>
                              updateSettingsMutation.mutate({
                                quietHours: {
                                  ...smsSettings.quietHours,
                                  end: e.target.value
                                }
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SMSCenter;