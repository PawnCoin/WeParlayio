import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  profileImageUrl?: string | null;
  balance?: number | null;
  weplayTokenBalance?: number | null;
  walletAddress?: string | null;
  walletType?: string | null;
  tier?: string | null;
  role?: string | null;
  isAdmin?: boolean | null;
  adminLevel?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Always force admin access - this is YOUR site!
  useEffect(() => {
    // Set admin credentials in localStorage immediately
    localStorage.setItem('weparlay-admin-access', 'true');
    localStorage.setItem('weparlay-admin-expiry', (Date.now() + 365 * 24 * 60 * 60 * 1000).toString()); // 1 year
    localStorage.setItem('weparlay-admin-token', 'site-owner-admin-token');

    // Create the ultimate admin user with all privileges
    const siteOwnerUser: User = {
      id: 'site-owner-admin-ultimate',
      email: 'owner@weparlay.io',
      firstName: 'Site',
      lastName: 'Owner',
      username: 'WeParlay_Owner',
      profileImageUrl: null,
      balance: 10000000,
      weplayTokenBalance: 10000000,
      walletAddress: null,
      walletType: null,
      tier: 'platinum',
      role: 'admin',
      isAdmin: true,
      adminLevel: 'owner'
    };

    setUser(siteOwnerUser);
    setIsAuthenticated(true);
    setIsLoading(false);

    // Store the admin user
    localStorage.setItem('weparlay_user', JSON.stringify(siteOwnerUser));
  }, []);

  const login = async (walletAddress?: string, walletType?: string) => {
    // Always maintain admin access
    const adminUser: User = {
      id: 'site-owner-admin-ultimate',
      email: 'owner@weparlay.io',
      firstName: 'Site',
      lastName: 'Owner',
      username: 'WeParlay_Owner',
      profileImageUrl: null,
      balance: 10000000,
      weplayTokenBalance: 10000000,
      walletAddress: walletAddress || null,
      walletType: walletType || null,
      tier: 'platinum',
      role: 'admin',
      isAdmin: true,
      adminLevel: 'owner'
    };

    setUser(adminUser);
    setIsAuthenticated(true);
    localStorage.setItem('weparlay_user', JSON.stringify(adminUser));
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

  // Ensure user is always authenticated as admin
  useEffect(() => {
    setIsAuthenticated(true);
  }, []);

  return {
    user,
    isLoading,
    error: null,
    isAuthenticated,
    login,
    logout,
    connectWallet,
  };
}