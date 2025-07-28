import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'vip' | 'moderator';
  requiredTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requiredSubscription?: 'wood' | 'bronze' | 'silver' | 'gold' | 'platinum';
  requireAuth?: boolean;
  adminOnly?: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

export function PermissionGate({
  children,
  requiredRole,
  requiredTier,
  requiredSubscription,
  requireAuth = false,
  adminOnly = false,
  fallback = null,
  className = ''
}: PermissionGateProps) {
  const { user, isAuthenticated } = useAuth();

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check admin requirement
  if (adminOnly && (!(user as any)?.isAdmin && (user as any)?.role !== 'admin')) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole) {
    const userRole = (user as any)?.role || 'user';
    const roleHierarchy = {
      user: 0,
      moderator: 1,
      vip: 2,
      admin: 3
    };

    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return <>{fallback}</>;
    }
  }

  // Check tier requirement
  if (requiredTier) {
    const userTier = (user as any)?.tier || 'bronze';
    const tierHierarchy = {
      bronze: 0,
      silver: 1,
      gold: 2,
      platinum: 3,
      diamond: 4
    };

    const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      return <>{fallback}</>;
    }
  }

  // Check subscription requirement
  if (requiredSubscription) {
    const userSubscription = (user as any)?.subscriptionTier || 'wood';
    const subscriptionHierarchy = {
      wood: 0,
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4
    };

    const userSubLevel = subscriptionHierarchy[userSubscription as keyof typeof subscriptionHierarchy] || 0;
    const requiredSubLevel = subscriptionHierarchy[requiredSubscription] || 0;

    if (userSubLevel < requiredSubLevel) {
      return <>{fallback}</>;
    }
  }

  // If all checks pass, render the children
  return <div className={className}>{children}</div>;
}

export default PermissionGate;