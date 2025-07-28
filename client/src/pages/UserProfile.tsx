import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, Shield, Crown, Star, Settings, Bell, Lock, CreditCard } from "lucide-react";
import PermissionBadge from "@/components/auth/PermissionBadge";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ProfilePictureUpload from "@/components/user/ProfilePictureUpload";

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Type assertion for user object
  const currentUser = user as any || {};

  const [profileData, setProfileData] = useState({
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    dateOfBirth: currentUser.dateOfBirth || '',
    bio: currentUser.bio || ''
  });
  
  const [profileImageUrl, setProfileImageUrl] = useState(currentUser.profileImageUrl || '');

  const [showNotifications, setShowNotifications] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, this would make an API call
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Please log in to view your profile</h2>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <ProfilePictureUpload 
              currentImageUrl={profileImageUrl}
              onImageUpdate={setProfileImageUrl}
              className="flex-shrink-0"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {currentUser.firstName} {currentUser.lastName}
                </h1>
                <PermissionBadge />
              </div>
              
              <p className="text-muted-foreground mb-3">@{currentUser.username}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">${currentUser.balance?.toLocaleString() || '0'}</span>
                </div>
                
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {currentUser.tier?.charAt(0).toUpperCase() + currentUser.tier?.slice(1) || 'Bronze'} Tier
                </Badge>
                
                {currentUser.isAdmin && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Administrator
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              
              <Button
                variant="outline"
                onClick={logout}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Profile Settings */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="betting">Betting</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Update Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Change Password
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Security Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Two-factor authentication enabled</li>
                      <li>• Login notifications active</li>
                      <li>• Account monitoring enabled</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your WeParlay experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive betting updates via email</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get instant bet settlement alerts</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">SMS Alerts</h4>
                        <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="betting">
              <Card>
                <CardHeader>
                  <CardTitle>Betting Statistics</CardTitle>
                  <CardDescription>
                    Your betting history and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">67%</div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">$2,450</div>
                      <div className="text-sm text-muted-foreground">Total Winnings</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">142</div>
                      <div className="text-sm text-muted-foreground">Bets Placed</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">28</div>
                      <div className="text-sm text-muted-foreground">Days Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {showNotifications && (
            <NotificationCenter 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Verification</span>
                <Badge variant="default">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Type</span>
                <Badge variant="secondary">{user.tier?.charAt(0).toUpperCase() + user.tier?.slice(1)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Member Since</span>
                <span className="text-sm text-muted-foreground">Jan 2024</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Tier
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;