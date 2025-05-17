import React, { useState } from 'react';
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';
import ConnectedWalletManager from '@/components/wallet/ConnectedWalletManager';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Bell, Wallet, Key, User, LockKeyhole } from 'lucide-react';

const SecuritySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('security');

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security, notifications, and wallet connections
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="flex w-full border-b p-0 bg-transparent h-auto space-x-2">
          <TabsTrigger 
            value="security" 
            className="flex items-center h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="wallets" 
            className="flex items-center h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Wallets
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center h-9 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Security Tab Content */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  View and update your profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="flex items-center mt-1">
                        <span className="text-muted-foreground">user@example.com</span>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <div className="flex items-center mt-1">
                        <span className="text-muted-foreground">+1 (555) 123-4567</span>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Login</label>
                    <div className="mt-1 text-muted-foreground">
                      May 16, 2023 at 2:30 PM from Los Angeles, CA
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Password
                </CardTitle>
                <CardDescription>
                  Update your password regularly to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <button className="text-sm underline">
                    Change Password
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-medium">Password Strength</p>
                    <p className="text-sm text-muted-foreground">
                      Your password is strong
                    </p>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-4/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TwoFactorAuth />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LockKeyhole className="mr-2 h-5 w-5" />
                  Login History
                </CardTitle>
                <CardDescription>
                  Review your recent account access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { device: 'Windows PC', browser: 'Chrome', location: 'Los Angeles, CA', time: 'Today, 2:30 PM', current: true },
                    { device: 'iPhone', browser: 'Safari', location: 'Los Angeles, CA', time: 'Yesterday, 7:15 AM', current: false },
                    { device: 'MacBook Pro', browser: 'Firefox', location: 'San Francisco, CA', time: 'May 10, 2023, 11:45 AM', current: false }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium flex items-center">
                          {session.device} - {session.browser}
                          {session.current && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Current Session
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.location} · {session.time}
                        </p>
                      </div>
                      {!session.current && (
                        <button className="text-sm text-red-600 hover:text-red-700">
                          Sign Out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Wallets Tab Content */}
        <TabsContent value="wallets">
          <ConnectedWalletManager />
        </TabsContent>

        {/* Notifications Tab Content */}
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;