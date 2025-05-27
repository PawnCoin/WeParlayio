import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Users, TrendingUp, DollarSign, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Check admin status
  const { data: adminStatus } = useQuery({
    queryKey: ["/api/user/admin-status"],
    retry: false,
  });

  // Create admin accounts mutation
  const createAdminMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/setup-admin-accounts", {}),
    onSuccess: (data) => {
      toast({
        title: "🚀 Admin Accounts Created!",
        description: "WeParlay and WeParlay.io admin accounts are now active",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/admin-status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Admin Setup Error",
        description: error.message || "Failed to create admin accounts",
        variant: "destructive",
      });
    }
  });

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, newPassword }: { email: string; newPassword: string }) =>
      apiRequest("POST", "/api/reset-password", { email, newPassword }),
    onSuccess: () => {
      toast({
        title: "🔒 Password Reset Available",
        description: "Admin password reset is ready",
      });
      setResetEmail("");
      setNewPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Reset Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  });

  const handlePasswordReset = () => {
    if (!resetEmail || !newPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and new password",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate({ email: resetEmail, newPassword });
  };

  if (!adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                WeParlay Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome, {adminStatus?.username} - Site Owner & Top Tier Admin
              </p>
            </div>
          </div>

          {/* Admin Status Badges */}
          <div className="flex gap-3 flex-wrap">
            <Badge variant="default" className="bg-yellow-500 text-white px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              SITE OWNER
            </Badge>
            <Badge variant="default" className="bg-purple-500 text-white px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              {adminStatus?.tier?.toUpperCase()} TIER
            </Badge>
            <Badge variant="default" className="bg-green-500 text-white px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              FULL ACCESS
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Admin Account Setup */}
          <Card className="border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-600" />
                Admin Account Setup
              </CardTitle>
              <CardDescription>
                Create your WeParlay and WeParlay.io admin accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Admin Accounts:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Username: WeParlay</li>
                    <li>• Username: WeParlay.io</li>
                    <li>• Email: support@weparlay.io</li>
                    <li>• Password: Baysides3!</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => createAdminMutation.mutate()}
                  disabled={createAdminMutation.isPending}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {createAdminMutation.isPending ? "Creating..." : "🚀 Create Admin Accounts"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Reset */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Password Reset
              </CardTitle>
              <CardDescription>
                Reset password for admin accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="support@weparlay.io"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <Button 
                  onClick={handlePasswordReset}
                  disabled={resetPasswordMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "🔒 Reset Password"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Privileges */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-green-600" />
                Your Admin Privileges
              </CardTitle>
              <CardDescription>
                You have unlimited access to all platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Full Site Access</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">1,000,000 WeParlay Cash</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Platinum Tier Benefits</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">User Management</span>
                </div>
                <div className="bg-green-50 p-3 rounded-lg mt-4">
                  <p className="text-xs text-green-800 font-medium">
                    🏆 TOP DOG STATUS: You're ranked #1 in all user categories and have unlimited access regardless of rewards or subscription status!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-purple-200 lg:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Quick Admin Actions
              </CardTitle>
              <CardDescription>
                Manage your WeParlay platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span>Manage Users</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span>Financial Overview</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <span>Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Settings className="w-6 h-6 text-gray-600" />
                  <span>Platform Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-white rounded-lg border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 WeParlay Platform Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">API Coverage:</p>
              <p className="text-green-600">7 Premium Sources Active</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Esports Coverage:</p>
              <p className="text-green-600">74,000+ Series Available</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Platform Status:</p>
              <p className="text-green-600">96% Launch Ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}