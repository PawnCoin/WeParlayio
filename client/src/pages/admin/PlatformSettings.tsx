import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Globe, CreditCard, Activity } from "lucide-react";
import TierGuard from "@/components/TierGuard";

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
  betting: {
    parlayEnabled: boolean;
    liveStreaming: boolean;
    maxBetSlipSize: number;
    autoAcceptOddsChanges: boolean;
    minimumStakeAmount: number;
    maximumWinnings: number;
  };
  features: {
    fantasyEnabled: boolean;
    socialBetting: boolean;
    challenges: boolean;
    tournaments: boolean;
    esportsHub: boolean;
    yahooIntegration: boolean;
  };
  integrations: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    twilioEnabled: boolean;
    analyticsEnabled: boolean;
  };
}

export default function PlatformSettings() {
  const { isAdmin } = useAuth();

  // Admin users bypass tier restrictions
  if (isAdmin) {
    return <PlatformSettingsContent />;
  }

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

  // Default settings that will always be available
  const defaultSettings: PlatformSettings = {
    general: {
      siteName: "WeParlay.io",
      siteDescription: "Premier Sports Betting Platform with Multi-Currency Support",
      maintenanceMode: false,
      registrationEnabled: true,
      minBetAmount: 1,
      maxBetAmount: 10000,
      defaultCurrency: "USD"
    },
    betting: {
      parlayEnabled: true,
      liveStreaming: true,
      maxBetSlipSize: 10,
      autoAcceptOddsChanges: false,
      minimumStakeAmount: 1,
      maximumWinnings: 100000
    },
    features: {
      fantasyEnabled: true,
      socialBetting: true,
      challenges: true,
      tournaments: true,
      esportsHub: true,
      yahooIntegration: false
    },
    integrations: {
      stripeEnabled: false,
      paypalEnabled: false,
      twilioEnabled: false,
      analyticsEnabled: false
    }
  };

  // Fetch current settings with fallback to defaults
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/platform-settings"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/platform-settings");
        return response as PlatformSettings;
      } catch (error) {
        console.warn("Failed to fetch platform settings, using defaults:", error);
        return defaultSettings;
      }
    },
    retry: 1,
    staleTime: 30000
  });

  const currentSettings = settings || defaultSettings;

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

  const handleSettingUpdate = (section: keyof PlatformSettings, field: string, value: any) => {
    const updates = {
      ...currentSettings,
      [section]: {
        ...currentSettings[section],
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
          <Settings className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Configure your WeParlay platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={currentSettings.general.maintenanceMode ? "destructive" : "default"}>
            {currentSettings.general.maintenanceMode ? "Maintenance Mode" : "Live"}
          </Badge>
          <Button
            variant={currentSettings.general.maintenanceMode ? "default" : "destructive"}
            onClick={() => maintenanceMutation.mutate(!currentSettings.general.maintenanceMode)}
            disabled={maintenanceMutation.isPending}
          >
            {currentSettings.general.maintenanceMode ? "Go Live" : "Enable Maintenance"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="betting">Betting</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={currentSettings.general.siteName}
                    onChange={(e) => handleSettingUpdate('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Input
                    id="defaultCurrency"
                    value={currentSettings.general.defaultCurrency}
                    onChange={(e) => handleSettingUpdate('general', 'defaultCurrency', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={currentSettings.general.siteDescription}
                  onChange={(e) => handleSettingUpdate('general', 'siteDescription', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="registration">Registration Enabled</Label>
                <Switch
                  id="registration"
                  checked={currentSettings.general.registrationEnabled}
                  onCheckedChange={(checked) => handleSettingUpdate('general', 'registrationEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="betting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Betting Configuration</span>
              </CardTitle>
              <CardDescription>Configure betting limits and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBet">Minimum Bet Amount</Label>
                  <Input
                    id="minBet"
                    type="number"
                    value={currentSettings.general.minBetAmount}
                    onChange={(e) => handleSettingUpdate('general', 'minBetAmount', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBet">Maximum Bet Amount</Label>
                  <Input
                    id="maxBet"
                    type="number"
                    value={currentSettings.general.maxBetAmount}
                    onChange={(e) => handleSettingUpdate('general', 'maxBetAmount', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="parlay">Parlay Betting</Label>
                  <Switch
                    id="parlay"
                    checked={currentSettings.betting.parlayEnabled}
                    onCheckedChange={(checked) => handleSettingUpdate('betting', 'parlayEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="streaming">Live Streaming</Label>
                  <Switch
                    id="streaming"
                    checked={currentSettings.betting.liveStreaming}
                    onCheckedChange={(checked) => handleSettingUpdate('betting', 'liveStreaming', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Platform Features</span>
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(currentSettings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => handleSettingUpdate('features', key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Third-Party Integrations</span>
              </CardTitle>
              <CardDescription>Manage external service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(currentSettings.integrations).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={value ? "default" : "secondary"}>
                      {value ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => handleSettingUpdate('integrations', key, checked)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}