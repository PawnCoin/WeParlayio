import React, { lazy, Suspense } from 'react';
import { Route } from 'wouter';
import AdminRoute from './AdminRoute';
import LoadingFallback from './LoadingFallback';

// Lazy load admin components for better performance
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ManageUsers = lazy(() => import("@/pages/admin/ManageUsers"));
const FinancialOverview = lazy(() => import("@/pages/admin/FinancialOverview"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const SimplePlatformSettings = lazy(() => import("@/pages/admin/SimplePlatformSettings"));
const VisualComponentEditorPage = lazy(() => import("@/pages/admin/VisualComponentEditor"));
const SocialMediaDashboard = lazy(() => import("@/pages/system/SocialMediaDashboard"));
const AdminVerificationDashboard = lazy(() => import("@/components/AdminVerificationDashboard"));
const SecurityDashboard = lazy(() => import("@/pages/admin/SecurityDashboard"));

// Development/Testing components (only load in dev)
const AdminLoginTest = lazy(() => import("@/pages/AdminLoginTest"));
const ApiTestPage = lazy(() => import("@/pages/ApiTestPage"));

export function AdminRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Route path="/admin" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin-dashboard" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
      <Route path="/users" component={(props) => <AdminRoute component={ManageUsers} {...props} />} />
      <Route path="/admin/manage-users" component={(props) => <AdminRoute component={ManageUsers} {...props} />} />
      <Route path="/admin/financial-overview" component={(props) => <AdminRoute component={FinancialOverview} {...props} />} />
      <Route path="/admin/analytics" component={(props) => <AdminRoute component={Analytics} {...props} />} />
      <Route path="/admin/platform-settings" component={(props) => <AdminRoute component={SimplePlatformSettings} {...props} />} />
      <Route path="/admin/visual-component-editor" component={(props) => <AdminRoute component={VisualComponentEditorPage} {...props} />} />
      <Route path="/social-media-bots" component={(props) => <AdminRoute component={SocialMediaDashboard} {...props} />} />
      <Route path="/admin/social-media-dashboard" component={(props) => <AdminRoute component={SocialMediaDashboard} {...props} />} />
      <Route path="/admin/verification" component={(props) => <AdminRoute component={AdminVerificationDashboard} {...props} />} />
      <Route path="/admin/security" component={(props) => <AdminRoute component={SecurityDashboard} {...props} />} />
    </Suspense>
  );
}

export function DevRoutes() {
  // Only render these routes in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Route path="/admin-login-test" component={AdminLoginTest} />
      <Route path="/api-test" component={ApiTestPage} />
    </Suspense>
  );
}

export function SystemRoutes() {
  const NotificationManagement = lazy(() => import("@/pages/system/NotificationManagement"));
  const TransactionManagement = lazy(() => import("@/pages/system/TransactionManagement"));
  const PayoutManagement = lazy(() => import("@/pages/system/PayoutManagement"));
  const SystemLogs = lazy(() => import("@/pages/system/SystemLogs"));
  const ApiStatus = lazy(() => import("@/pages/system/ApiStatus"));
  const SystemHealth = lazy(() => import("@/pages/system/SystemHealth"));
  const UnifiedGaming = lazy(() => import("@/pages/system/UnifiedGaming"));
  const LiveSportsStreaming = lazy(() => import("@/pages/system/LiveSportsStreaming"));

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Route path="/system/notifications" component={(props) => <AdminRoute component={NotificationManagement} {...props} />} />
      <Route path="/system/transactions" component={(props) => <AdminRoute component={TransactionManagement} {...props} />} />
      <Route path="/system/payouts" component={(props) => <AdminRoute component={PayoutManagement} {...props} />} />
      <Route path="/system/logs" component={(props) => <AdminRoute component={SystemLogs} {...props} />} />
      <Route path="/system/api-status" component={(props) => <AdminRoute component={ApiStatus} {...props} />} />
      <Route path="/system/health" component={(props) => <AdminRoute component={SystemHealth} {...props} />} />
      <Route path="/system/gaming" component={(props) => <AdminRoute component={UnifiedGaming} {...props} />} />
      <Route path="/system/streaming" component={(props) => <AdminRoute component={LiveSportsStreaming} {...props} />} />
    </Suspense>
  );
}