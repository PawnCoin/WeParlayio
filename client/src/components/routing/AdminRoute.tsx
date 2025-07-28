import React from 'react';
import { Redirect } from 'wouter';

interface AdminRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

// Simple admin check - in production this would check against actual user role
const isAdminUser = () => {
  // Check for admin tokens, user role, etc.
  const adminEmails = ['support@weparlay.io', 'admin@weparlay.io', 'weparlay@admin.com'];
  const userEmail = localStorage.getItem('userEmail') || '';
  return adminEmails.includes(userEmail) || 
         localStorage.getItem('isAdmin') === 'true' ||
         sessionStorage.getItem('adminAccess') === 'true';
};

export default function AdminRoute({ component: Component, ...props }: AdminRouteProps) {
  if (!isAdminUser()) {
    return <Redirect to="/auth" />;
  }
  
  return <Component {...props} />;
}

// Higher-order component version for easier use
export function withAdminProtection<T extends object>(WrappedComponent: React.ComponentType<T>) {
  return function AdminProtectedComponent(props: T) {
    if (!isAdminUser()) {
      return <Redirect to="/auth" />;
    }
    return <WrappedComponent {...props} />;
  };
}