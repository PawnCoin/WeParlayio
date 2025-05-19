import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BiometricSetup } from '@/components/auth/BiometricSetup';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Bell, Eye, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

const SecuritySettings: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    navigate('/login?redirect=/security-settings');
    return null;
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-3xl font-bold">Security Settings</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Configure your security preferences and authentication methods to enhance your account protection.
      </p>
      
      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="authentication" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Security Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biometric Authentication</CardTitle>
              <CardDescription>
                Enable biometric login for faster and more secure access to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BiometricSetup />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security by requiring a second form of verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Authentication</h3>
                  <p className="text-sm text-muted-foreground">Receive a code via email when logging in from a new device</p>
                </div>
                <Switch id="email-mfa" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">SMS Authentication</h3>
                  <p className="text-sm text-muted-foreground">Receive a code via SMS for login verification</p>
                </div>
                <Switch id="sms-mfa" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Authenticator App</h3>
                  <p className="text-sm text-muted-foreground">Use an authenticator app like Google Authenticator or Authy</p>
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Coming soon", description: "Authenticator app integration will be available in a future update" })}>
                  Set Up
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password Settings</CardTitle>
              <CardDescription>
                Manage your password and account recovery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">Update your password regularly for increased security</p>
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Coming soon", description: "Password change functionality will be available soon" })}>
                  Change
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Require Password on Sensitive Actions</h3>
                  <p className="text-sm text-muted-foreground">Prompt for password when making bets, withdrawals, or changing settings</p>
                </div>
                <Switch id="password-actions" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
              <CardDescription>
                Manage how your data is used and who can see your activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Profile Visibility</h3>
                  <p className="text-sm text-muted-foreground">Control who can see your betting activity and profile</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="profile-visibility">Public</Label>
                  <Switch id="profile-visibility" />
                  <Label htmlFor="profile-visibility">Private</Label>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Social Sharing</h3>
                  <p className="text-sm text-muted-foreground">Allow sharing your bets on social platforms</p>
                </div>
                <Switch id="social-sharing" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Activity Tracking</h3>
                  <p className="text-sm text-muted-foreground">Allow WeParlay to track your preferences for better recommendations</p>
                </div>
                <Switch id="activity-tracking" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Device Management</CardTitle>
              <CardDescription>
                View and manage devices that have access to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Current Device</h3>
                      <p className="text-sm text-muted-foreground">
                        {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') 
                          ? 'iPhone/iPad' 
                          : navigator.userAgent.includes('Android')
                            ? 'Android Device'
                            : 'Desktop'}
                      </p>
                      <p className="text-xs text-muted-foreground">Last active: Just now</p>
                    </div>
                    <div className="flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-sm font-medium">Current</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Coming soon", description: "Device management will be available in a future update" })}>
                  View All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Configure how you want to be notified about security events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">New Login Alerts</h3>
                  <p className="text-sm text-muted-foreground">Get notified when your account is accessed from a new device</p>
                </div>
                <Switch id="login-alerts" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Suspicious Activity Alerts</h3>
                  <p className="text-sm text-muted-foreground">Get notified of unusual activity on your account</p>
                </div>
                <Switch id="suspicious-alerts" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password Change Alerts</h3>
                  <p className="text-sm text-muted-foreground">Get notified when your password is changed</p>
                </div>
                <Switch id="password-alerts" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Transaction Alerts</h3>
                  <p className="text-sm text-muted-foreground">Get notified of large deposits or withdrawals</p>
                </div>
                <Switch id="transaction-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Alert Methods</CardTitle>
              <CardDescription>
                Choose how you want to receive security alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive security alerts via email</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">SMS Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive security alerts via text message</p>
                </div>
                <Switch id="sms-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">In-App Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive security alerts within the WeParlay app</p>
                </div>
                <Switch id="app-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 mb-4 flex justify-center">
        <Button 
          variant="outline" 
          className="flex items-center" 
          onClick={() => navigate('/security')}
        >
          <Shield className="h-4 w-4 mr-2" />
          View Security Measures
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;