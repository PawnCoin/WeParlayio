import React, { useState, useEffect } from 'react';
import UserProfile from '@/components/user/UserProfile';
import TeamThemeSelector from '@/components/settings/TeamThemeSelector';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const Settings = () => {
  // Redirect to user profile settings
  return (
    <div className="container mx-auto py-8 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Settings Moved</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Settings are now part of your user profile for better privacy and organization.
      </p>
      <p className="text-sm text-gray-500">
        Please access your settings through your user profile.
      </p>
    </div>
  );
};

export default Settings;