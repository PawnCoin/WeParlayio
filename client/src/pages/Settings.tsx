import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, User, CreditCard, Shield, Bell, Moon, Sun, DollarSign, Bitcoin, Wallet, CircleHelp } from "lucide-react";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [currency, setCurrency] = useState<string>("USD");
  const [liveBettingUpdates, setLiveBettingUpdates] = useState<boolean>(true);
  const [odds, setOdds] = useState<string>("american");

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Account Settings</h1>
      
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="wallet">Wallet & Payments</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">General Preferences</CardTitle>
              <CardDescription>Manage your display and betting preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base text-foreground">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-muted-foreground" />
                    <Switch 
                      id="dark-mode" 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode} 
                    />
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="odds-format" className="text-base text-foreground">Odds Format</Label>
                    <p className="text-sm text-muted-foreground">Choose how odds are displayed</p>
                  </div>
                  <Select value={odds} onValueChange={setOdds}>
                    <SelectTrigger className="w-[180px] bg-background text-foreground">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American (+300)</SelectItem>
                      <SelectItem value="decimal">Decimal (4.00)</SelectItem>
                      <SelectItem value="fractional">Fractional (3/1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="currency" className="text-base text-foreground">Default Currency</Label>
                    <p className="text-sm text-muted-foreground">Set your preferred currency</p>
                  </div>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-[180px] bg-background text-foreground">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="BTC">Bitcoin (₿)</SelectItem>
                      <SelectItem value="ETH">Ethereum (Ξ)</SelectItem>
                      <SelectItem value="SOL">Solana (◎)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="live-updates" className="text-base text-foreground">Live Betting Updates</Label>
                    <p className="text-sm text-muted-foreground">Auto-refresh rates for live betting</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="live-updates" 
                      checked={liveBettingUpdates} 
                      onCheckedChange={setLiveBettingUpdates} 
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} className="mt-6">
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Wallet & Payments Tab */}
        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Wallet & Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods and crypto wallets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-medium text-foreground">Current Balance</h3>
                      <div className="text-2xl font-bold text-foreground">$1,250.00</div>
                    </div>
                  </div>
                  <Button variant="outline" className="bg-background text-foreground">
                    Deposit
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-foreground">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8">Edit</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <div className="flex items-center space-x-3">
                      <Bitcoin className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-foreground">Bitcoin Wallet</p>
                        <p className="text-sm text-muted-foreground">Connected</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8">Manage</Button>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2 bg-background text-foreground">
                    <Wallet className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-foreground">Transaction History</h3>
                <div className="border rounded-md divide-y bg-background">
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">Deposit</p>
                      <p className="text-sm text-muted-foreground">May 10, 2025</p>
                    </div>
                    <p className="font-medium text-green-600">+$500.00</p>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">Winning</p>
                      <p className="text-sm text-muted-foreground">May 8, 2025</p>
                    </div>
                    <p className="font-medium text-green-600">+$250.00</p>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">Bet Placement</p>
                      <p className="text-sm text-muted-foreground">May 8, 2025</p>
                    </div>
                    <p className="font-medium text-red-500">-$100.00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
                  <Input id="current-password" type="password" className="bg-background text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                  <Input id="new-password" type="password" className="bg-background text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" className="bg-background text-foreground" />
                </div>
                <Button className="mt-2">Change Password</Button>
              </div>
              
              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-medium text-foreground">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="bg-background text-foreground">
                    <Shield className="mr-2 h-4 w-4" />
                    Setup 2FA
                  </Button>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <h3 className="text-base font-medium mb-3 text-foreground">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md bg-background">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">Current Session</p>
                        <p className="text-sm text-muted-foreground">Chrome on macOS • New York, USA</p>
                      </div>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-background text-foreground">Log Out All Devices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Notification Settings</CardTitle>
              <CardDescription>Control which notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base text-foreground">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive bet results and promotions via email</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={notifications} 
                    onCheckedChange={setNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="text-base text-foreground">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive live betting updates and game notifications</p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={true} 
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications" className="text-base text-foreground">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive special offers and exclusive promotions</p>
                  </div>
                  <Switch 
                    id="sms-notifications" 
                    checked={false} 
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-notifications" className="text-base text-foreground">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">Receive news about new features and promotions</p>
                  </div>
                  <Switch 
                    id="marketing-notifications" 
                    checked={false} 
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} className="mt-6">
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <CircleHelp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-foreground">Our support team is available 24/7 to assist you with any questions.</p>
              <Button variant="link" className="p-0 h-auto text-primary">Contact Support</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;