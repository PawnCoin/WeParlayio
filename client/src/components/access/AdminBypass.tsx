import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AdminBypassProps {
  children: React.ReactNode;
}

// This component ensures admin users ALWAYS have access to everything
export default function AdminBypass({ children }: AdminBypassProps) {
  const { user } = useAuth();
  
  // Support@weparlay.io and all admin users get IMMEDIATE access
  const isAdmin = user?.email === 'support@weparlay.io' || 
                  user?.email === 'admin@weparlay.io' ||
                  user?.email === 'weparlay@admin.com' ||
                  user?.role === 'admin' || 
                  user?.isAdmin === true;

  // Admin users bypass ALL restrictions
  if (isAdmin) {
    return <>{children}</>;
  }

  // For non-admin users, show content (they can upgrade if needed)
  return <>{children}</>;
}