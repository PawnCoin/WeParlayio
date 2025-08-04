import React from 'react';
import { Redirect } from 'wouter';

interface AdminRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

// Check if user has valid admin token and authentication
const isAdminUser = () => {
  // Check for valid admin token
  const token = localStorage.getItem('auth-token') || localStorage.getItem('weparlay-admin-token');
  const isAdminFlag = localStorage.getItem('weparlay-is-admin') === 'true';
  
  // If we have admin flag set, return true
  if (isAdminFlag) {
    return true;
  }
  
  if (!token) {
    return false;
  }
  
  try {
    // Basic token validation - check if it's a JWT
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      
      // Check for admin status in multiple ways
      if (payload.isAdmin === true || 
          payload.role === 'admin' || 
          payload.userRole === 'admin' ||
          payload.email === 'support@weparlay.io' ||
          payload.email === 'admin@weparlay.io' ||
          payload.email === 'weparlay@admin.com') {
        // Set admin flag for future checks
        localStorage.setItem('weparlay-is-admin', 'true');
        return true;
      }
    }
  } catch (e) {
    console.warn('Token parsing failed:', e);
  }
  
  return false;
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