import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Shield, Bell, Palette, Server, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    minBetAmount: number;
    maxBetAmount: number;
    defaultCurrency: string;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  integrations: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    twilioEnabled: boolean;
    analyticsEnabled: boolean;
  };
}

export default function PlatformSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/platform-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/platform-settings");
      return response as PlatformSettings;
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<PlatformSettings>) => {
      return apiRequest("PUT", "/api/admin/platform-settings", updates);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Platform settings have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-settings"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update platform settings.",
        variant: "destructive",
      });
    }
  });

  // System maintenance mutation
  const maintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("POST", "/api/admin/maintenance-mode", { enabled });
    },
    onSuccess: (_, enabled) => {
      toast({
        title: enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: enabled 
          ? "Platform is now in maintenance mode." 
          : "Platform is now live for users.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-settings"] });
    }
  });

  // Test integrations mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (service: string) => {
      return apiRequest("POST", `/api/admin/test-integration/${service}`);
    },
    onSuccess: (data, service) => {
      toast({
        title: "Integration Test",
        description: `${service} integration is working correctly.`,
      });
    },
    onError: (error, service) => {
      toast({
        title: "Integration Error",
        description: `${service} integration test failed. Please check configuration.`,
        variant: "destructive",
      });
    }
  });

  const handleSettingUpdate = (section: keyof PlatformSettings, field: string, value: any) => {
    if (!settings) return;
    
    const updates = {
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    };
    
    updateSettingsMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Configure your WeParlay platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={settings?.general.maintenanceMode ? "destructive" : "default"}>
            {settings?.general.maintenanceMode ? "Maintenance Mode" : "Live"}
          </Badge>
          <Button
            variant={settings?.general.maintenanceMode ? "default" : "destructive"}
            onClick={() => maintenanceMutation.mutate(!settings?.general.maintenanceMode)}
          >
            {settings?.general.maintenanceMode ? "Go Live" : "Enable Maintenance"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Server className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings?.general.siteName || ""}
                    onChange={(e) => handleSettingUpdate("general", "siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select 
                    value={settings?.general.defaultCurrency}
                    onValueChange={(value) => handleSettingUpdate("general", "defaultCurrency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings?.general.siteDescription || ""}
                  onChange={(e) => handleSettingUpdate("general", "siteDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBet">Minimum Bet Amount</Label>
                  <Input
                    id="minBet"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings?.general.minBetAmount || 0}
                    onChange={(e) => handleSettingUpdate("general", "minBetAmount", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBet">Maximum Bet Amount</Label>
                  <Input
                    id="maxBet"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings?.general.maxBetAmount || 0}
                    onChange={(e) => handleSettingUpdate("general", "maxBetAmount", parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <Switch
                  checked={settings?.general.registrationEnabled}
                  onCheckedChange={(checked) => handleSettingUpdate("general", "registrationEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Platform security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                </div>
                <Switch
                  checked={settings?.security.twoFactorRequired}
                  onCheckedChange={(checked) => handleSettingUpdate("security", "twoFactorRequired", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                </div>
                <Switch
                  checked={settings?.security.requireEmailVerification}
                  onCheckedChange={(checked) => handleSettingUpdate("security", "requireEmailVerification", checked)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    value={settings?.security.sessionTimeout || 30}
                    onChange={(e) => handleSettingUpdate("security", "sessionTimeout", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    value={settings?.security.maxLoginAttempts || 5}
                    onChange={(e) => handleSettingUpdate("security", "maxLoginAttempts", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    value={settings?.security.passwordMinLength || 8}
                    onChange={(e) => handleSettingUpdate("security", "passwordMinLength", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure platform notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send system emails to users</p>
                </div>
                <Switch
                  checked={settings?.notifications.emailNotifications}
                  onCheckedChange={(checked) => handleSettingUpdate("notifications", "emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS alerts for important events</p>
                </div>
                <Switch
                  checked={settings?.notifications.smsNotifications}
                  onCheckedChange={(checked) => handleSettingUpdate("notifications", "smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={settings?.notifications.pushNotifications}
                  onCheckedChange={(checked) => handleSettingUpdate("notifications", "pushNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Send promotional and marketing emails</p>
                </div>
                <Switch
                  checked={settings?.notifications.marketingEmails}
                  onCheckedChange={(checked) => handleSettingUpdate("notifications", "marketingEmails", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Manage external service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <h4 className="font-medium">Stripe Payment Processing</h4>
                      <p className="text-sm text-muted-foreground">Credit card payments and subscriptions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.integrations.stripeEnabled}
                      onCheckedChange={(checked) => handleSettingUpdate("integrations", "stripeEnabled", checked)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testIntegrationMutation.mutate("stripe")}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <h4 className="font-medium">PayPal Payments</h4>
                      <p className="text-sm text-muted-foreground">Alternative payment method</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.integrations.paypalEnabled}
                      onCheckedChange={(checked) => handleSettingUpdate("integrations", "paypalEnabled", checked)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testIntegrationMutation.mutate("paypal")}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div>
                      <h4 className="font-medium">Twilio SMS Service</h4>
                      <p className="text-sm text-muted-foreground">SMS notifications and 2FA</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.integrations.twilioEnabled}
                      onCheckedChange={(checked) => handleSettingUpdate("integrations", "twilioEnabled", checked)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testIntegrationMutation.mutate("twilio")}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <div>
                      <h4 className="font-medium">Google Analytics</h4>
                      <p className="text-sm text-muted-foreground">User behavior tracking and insights</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.integrations.analyticsEnabled}
                      onCheckedChange={(checked) => handleSettingUpdate("integrations", "analyticsEnabled", checked)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testIntegrationMutation.mutate("analytics")}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}