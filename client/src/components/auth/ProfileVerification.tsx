import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Shield, UserCheck, Mail, Phone } from 'lucide-react';

interface ProfileVerificationProps {
  onVerificationComplete?: () => void;
}

const ProfileVerification: React.FC<ProfileVerificationProps> = ({
  onVerificationComplete
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [profileStatus, setProfileStatus] = useState({
    emailVerified: false,
    profileComplete: false,
    authMethod: '',
    lastLogin: null,
    accountStatus: 'active'
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      verifyProfileIntegrity();
    }
  }, [isAuthenticated, user]);

  const verifyProfileIntegrity = async () => {
    if (!user) return;
    
    setIsVerifying(true);
    
    try {
      // Verify user profile data integrity
      const response = await apiRequest('POST', '/api/auth/verify-profile', {
        userId: user.id,
        authMethod: user.authMethod || 'unknown'
      });

      if (response.ok) {
        const result = await response.json();
        setProfileStatus(result.profileStatus);
        
        if (result.needsUpdate) {
          // Auto-update profile if needed
          await updateProfileData(result.suggestedUpdates);
        }
        
        toast({
          title: "Profile verified successfully!",
          description: "Your account data is secure and up-to-date.",
        });
        
        onVerificationComplete?.();
      } else {
        throw new Error('Profile verification failed');
      }
    } catch (error: any) {
      console.error('Profile verification error:', error);
      toast({
        title: "Profile verification issue",
        description: "There was an issue verifying your profile. Your account is still secure.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const updateProfileData = async (updates: any) => {
    try {
      const response = await apiRequest('PATCH', '/api/auth/update-profile', {
        userId: user?.id,
        updates
      });

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been automatically updated for better security.",
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-yellow-500" />
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Profile Security
        </CardTitle>
        <CardDescription>
          Your account verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Email Verified</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(profileStatus.emailVerified)}
              <Badge variant={profileStatus.emailVerified ? "default" : "secondary"}>
                {profileStatus.emailVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm">Profile Complete</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(profileStatus.profileComplete)}
              <Badge variant={profileStatus.profileComplete ? "default" : "secondary"}>
                {profileStatus.profileComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Account Status</span>
            </div>
            <Badge variant="default" className="bg-green-500">
              {profileStatus.accountStatus}
            </Badge>
          </div>
        </div>

        {profileStatus.authMethod && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Login Method: {profileStatus.authMethod}
            </p>
            {profileStatus.lastLogin && (
              <p className="text-xs text-muted-foreground">
                Last Login: {new Date(profileStatus.lastLogin).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <Button
          onClick={verifyProfileIntegrity}
          disabled={isVerifying}
          className="w-full"
          size="sm"
        >
          {isVerifying ? "Verifying..." : "Re-verify Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileVerification;