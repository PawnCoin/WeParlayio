import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

export default function AdminRoute({ component: Component, ...props }: AdminRouteProps) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!(user?.isAdmin === true || user?.role === 'admin')) {
    return <Redirect to="/auth" />;
  }
  
  return <Component {...props} />;
}

// Higher-order component version for easier use
export function withAdminProtection<T extends object>(WrappedComponent: React.ComponentType<T>) {
  return function AdminProtectedComponent(props: T) {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    if (!(user?.isAdmin === true || user?.role === 'admin')) {
      return <Redirect to="/auth" />;
    }
    return <WrappedComponent {...props} />;
  };
}
