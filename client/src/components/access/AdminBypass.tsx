import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AdminBypassProps {
  children: React.ReactNode;
}

// This component ensures admin users ALWAYS have access to everything
export default function AdminBypass({ children }: AdminBypassProps) {
  const { user } = useAuth();
  
  // Only support@weparlay.io gets IMMEDIATE admin access
  const isAdmin = user?.email === 'support@weparlay.io';

  // Admin users bypass ALL restrictions
  if (isAdmin) {
    return <>{children}</>;
  }

  // For non-admin users, show content (they can upgrade if needed)
  return <>{children}</>;
}