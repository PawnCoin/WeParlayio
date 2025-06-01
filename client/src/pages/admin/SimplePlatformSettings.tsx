import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Server, CreditCard, Zap } from "lucide-react";
import TierGuard from "@/components/TierGuard";

export default function SimplePlatformSettings() {
  return (
    <TierGuard requiredTier="diamond" userTier="none" feature="Platform Settings">
      <PlatformSettingsContent />
    </TierGuard>
  );
}

function PlatformSettingsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch settings data
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/platform-settings'],
    retry: 2,
    staleTime: 30000
  });

  // Safely access settings data with fallbacks
  const settingsData = settings || {};
  const siteName = settingsData.general?.siteName || "WeParlay.io";
  const maintenanceMode = settingsData.general?.maintenanceMode || false;
  const registrationEnabled = settingsData.general?.registrationEnabled || true;
  const minBetAmount = settingsData.general?.minBetAmount || 1;
  const maxBetAmount = settingsData.general?.maxBetAmount || 10000;
  
  // Feature flags
  const parlayEnabled = settingsData.betting?.parlayEnabled || true;
  const liveStreaming = settingsData.betting?.liveStreaming || true;
  const fantasyEnabled = settingsData.features?.fantasyEnabled || true;
  const socialBetting = settingsData.features?.socialBetting || true;
  
  // Integration status
  const stripeEnabled = settingsData.integrations?.stripeEnabled || false;
  const paypalEnabled = settingsData.integrations?.paypalEnabled || false;
  const twilioEnabled = settingsData.integrations?.twilioEnabled || false;

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
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
    },
  });

  // Maintenance mode toggle
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("POST", "/api/admin/maintenance-mode", { enabled });
    },
    onSuccess: (_, enabled) => {
      toast({
        title: enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: enabled ? "Site is now in maintenance mode" : "Site is now live",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-settings"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Loading system configuration...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={maintenanceMode ? "destructive" : "default"}>
            {maintenanceMode ? "Maintenance Mode" : "Live"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="betting" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Betting
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>Basic site settings and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" value={siteName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBet">Minimum Bet Amount</Label>
                  <Input id="minBet" type="number" value={minBetAmount} readOnly />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={(checked) => toggleMaintenanceMutation.mutate(checked)}
                  disabled={toggleMaintenanceMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                </div>
                <Switch
                  id="registration"
                  checked={registrationEnabled}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="betting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Betting Features</CardTitle>
              <CardDescription>Configure betting-related features and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parlay Betting</Label>
                    <p className="text-sm text-muted-foreground">Enable parlay bets</p>
                  </div>
                  <Switch checked={parlayEnabled} disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Live Streaming</Label>
                    <p className="text-sm text-muted-foreground">Enable live sports streaming</p>
                  </div>
                  <Switch checked={liveStreaming} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fantasy Sports</Label>
                    <p className="text-sm text-muted-foreground">Enable fantasy sports features</p>
                  </div>
                  <Switch checked={fantasyEnabled} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Social Betting</Label>
                    <p className="text-sm text-muted-foreground">Enable social betting features</p>
                  </div>
                  <Switch checked={socialBetting} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Integrations</CardTitle>
              <CardDescription>External service integrations and API connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <Label>Stripe Payment Gateway</Label>
                      <p className="text-sm text-muted-foreground">Process credit card payments</p>
                    </div>
                  </div>
                  <Badge variant={stripeEnabled ? "default" : "secondary"}>
                    {stripeEnabled ? "Connected" : "Not Configured"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <Label>PayPal Integration</Label>
                      <p className="text-sm text-muted-foreground">PayPal payment processing</p>
                    </div>
                  </div>
                  <Badge variant={paypalEnabled ? "default" : "secondary"}>
                    {paypalEnabled ? "Connected" : "Not Configured"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5" />
                    <div>
                      <Label>Twilio SMS Service</Label>
                      <p className="text-sm text-muted-foreground">SMS notifications and alerts</p>
                    </div>
                  </div>
                  <Badge variant={twilioEnabled ? "default" : "secondary"}>
                    {twilioEnabled ? "Connected" : "Not Configured"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}