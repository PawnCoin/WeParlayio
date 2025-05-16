import React, { useState, useEffect } from 'react';
import UserProfile from '@/components/user/UserProfile';
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
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      <UserProfile user={user} />
    </div>
  );
};

export default Settings;