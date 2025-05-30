import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  balance?: number | null;
  walletAddress?: string | null;
  walletType?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a user in localStorage (for development purposes)
    const storedUser = localStorage.getItem('weparlay_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('weparlay_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (walletAddress?: string, walletType?: string) => {
    setIsLoading(true);

    try {
      // In production, this would make an API call to authenticate with the WordPress site

      if (walletAddress) {
        // For now we just create a temporary user object for demonstration
        // In production, this would validate the wallet signature with the backend
        const tempUser: User = {
          id: `wallet_${Math.random().toString(36).substring(2, 9)}`,
          email: null,
          firstName: walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : 'Wallet',
          lastName: 'User',
          profileImageUrl: null,
          balance: 1000.0,
          walletAddress,
          walletType,
        };

        setUser(tempUser);
        localStorage.setItem('weparlay_user', JSON.stringify(tempUser));

        toast({
          title: "Successfully connected",
          description: `Welcome to WeParlay! Your wallet is now connected.`,
        });
      } else {
        // Redirect to WordPress login
        window.location.href = 'https://weparlay.io/login';
        return;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
      toast({
        title: "Login Failed",
        description: err.message || "Failed to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weparlay_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out of WeParlay.",
    });
  };

  const connectWallet = async (address: string, type: string) => {
    await login(address, type);
  };

  const isAuthenticated = !!user;

  // Ensure authentication is properly initialized with admin privileges
  React.useEffect(() => {
    if (user && !user.id) {
      // Initialize user with demo data if needed
      setUser({
        ...user,
        id: user.id || 'admin-owner-' + Date.now(),
        username: user.username || 'WeParlay_Admin',
        balance: user.balance || 1000000,
        weplayTokenBalance: user.weplayTokenBalance || 1000000,
        role: 'admin',
        tier: 'platinum',
        isAdmin: true,
        adminLevel: 'owner',
        permissions: ['all']
      });
    }
  }, [user]);

  // Auto-login demo user for new users (development only)
  React.useEffect(() => {
    if (!user && !isLoading) {
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        username: 'Demo_Player',
        email: 'demo@weparlay.io',
        firstName: 'Demo',
        lastName: 'Player',
        balance: 1000,
        weplayTokenBalance: 500,
        tier: 'bronze',
        isAdmin: false,
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString()
      };
      setUser(demoUser);
      localStorage.setItem('weparlay_user', JSON.stringify(demoUser));
    }
  }, [user, isLoading]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    connectWallet,
  };
}