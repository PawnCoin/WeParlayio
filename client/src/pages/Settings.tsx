import React, { useState, useEffect } from 'react';
import UserProfile from '@/components/user/UserProfile';
import TeamThemeSelector from '@/components/settings/TeamThemeSelector';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    id: 1, // Sample user ID
    username: 'WeParlay_User',
    balance: 1000,
    avatarSettings: null
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // In a real app, this would fetch the user from your API
        // const response = await apiRequest('GET', '/api/user');
        // const userData = await response.json();
        
        // For demo purposes, we're using mock data
        const userData = {
          id: 1,
          username: 'WeParlay_User',
          balance: 1000,
          avatarSettings: {
            skinTone: '#F1C27D',
            suitColor: '#0074D9',
            hairStyle: 'short',
            accessory: 'none'
          }
        };
        
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchUser();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Manage your account settings and customize your WeParlay experience
      </p>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfile user={user} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how WeParlay looks for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TeamThemeSelector />
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Display Options</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Additional display preferences will be added soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  More detailed notification settings will be available soon. For now, you can toggle
                  bet notifications on/off using the notification bell in the header.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Security settings including password changes, two-factor authentication, and 
                  connected wallet management will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;