import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Lock,
  Key
} from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

const PasswordStrengthPolicy: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [lastPasswordUpdate, setLastPasswordUpdate] = useState<Date | null>(null);
  // Implementing passwordHistory state variable that was declared but never used
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);

  const passwordRequirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 12 characters long',
      test: (password) => password.length >= 12,
      met: false
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter (A-Z)',
      test: (password) => /[A-Z]/.test(password),
      met: false
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter (a-z)',
      test: (password) => /[a-z]/.test(password),
      met: false
    },
    {
      id: 'number',
      label: 'Contains number (0-9)',
      test: (password) => /\d/.test(password),
      met: false
    },
    {
      id: 'special',
      label: 'Contains special character (!@#$%^&*)',
      test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      met: false
    },
    {
      id: 'noSequential',
      label: 'No sequential characters (abc, 123)',
      test: (password) => {
        const sequential = ['abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz', '123', '234', '345', '456', '567', '678', '789'];
        return !sequential.some(seq => password.toLowerCase().includes(seq));
      },
      met: false
    },
    {
      id: 'noCommon',
      label: 'Not a common password',
      test: (password) => {
        const common = ['password', '123456', 'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome', 'monkey', 'dragon'];
        return !common.some(common => password.toLowerCase().includes(common));
      },
      met: false
    }
  ];

  const [requirements, setRequirements] = useState(passwordRequirements);

  useEffect(() => {
    if (user) {
      fetchPasswordInfo();
    }
  }, [user]);

  useEffect(() => {
    updatePasswordStrength(newPassword);
  }, [newPassword]);

  const fetchPasswordInfo = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/password-info');
      if (response.ok) {
        const data = await response.json();
        setLastPasswordUpdate(data.lastUpdate ? new Date(data.lastUpdate) : null);
        // Implementing passwordHistory functionality that was declared but never used
        setPasswordHistory(data.passwordHistory || []);
      }
    } catch (error) {
      console.error('Error fetching password info:', error);
    }
  };

  // Implementing validatePasswordHistory function that was declared but never called
  const validatePasswordHistory = (newPassword: string): boolean => {
    const hashedPassword = btoa(newPassword); // Simple hash for demonstration
    return !passwordHistory.includes(hashedPassword);
  };

  // Implementing generateSecurePassword function that was declared but no UI button existed
  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    // Ensure at least one of each required character type
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    result += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    result += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special
    
    // Fill remaining characters
    for (let i = 4; i < 16; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the result
    return result.split('').sort(() => Math.random() - 0.5).join('');
  };

  const updatePasswordStrength = (password: string) => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.test(password)
    }));
    
    setRequirements(updatedRequirements);
    
    const metCount = updatedRequirements.filter(req => req.met).length;
    const score = Math.round((metCount / updatedRequirements.length) * 100);
    setPasswordScore(score);
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-yellow-500';
    if (score < 90) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score < 40) return 'Weak';
    if (score < 70) return 'Fair';
    if (score < 90) return 'Good';
    return 'Strong';
  };

  const isPasswordExpired = () => {
    if (!lastPasswordUpdate) return false;
    const daysSinceUpdate = Math.floor((Date.now() - lastPasswordUpdate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate > 90; // 90 days
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive"
      });
      return;
    }

    const allRequirementsMet = requirements.every(req => req.met);
    if (!allRequirementsMet) {
      toast({
        title: "Password requirements not met",
        description: "Please ensure your password meets all security requirements",
        variant: "destructive"
      });
      return;
    }

    // Implementing validatePasswordHistory function that was declared but never called in form submission
    if (!validatePasswordHistory(newPassword)) {
      toast({
        title: "Password previously used",
        description: "Please choose a password you haven't used recently for better security",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      const response = await apiRequest('PUT', '/api/auth/update-password', {
        currentPassword,
        newPassword
      });

      if (response.ok) {
        toast({
          title: "Password updated successfully!",
          description: "Your password has been changed and your account is more secure",
        });

        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLastPasswordUpdate(new Date());
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Password update failed",
        description: error.message || "There was an error updating your password",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Password Security Policy
          </CardTitle>
          <CardDescription>
            Maintain strong password security with regular updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPasswordExpired() && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900">Password Update Required</h3>
                  <p className="text-red-700 text-sm">
                    Your password is over 90 days old. Please update it for better security.
                  </p>
                </div>
              </div>
            </div>
          )}

          {lastPasswordUpdate && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                <strong>Last updated:</strong> {lastPasswordUpdate.toLocaleDateString()}
                <span className="ml-2">
                  ({Math.floor((Date.now() - lastPasswordUpdate.getTime()) / (1000 * 60 * 60 * 24))} days ago)
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>
            Choose a strong password that meets all security requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-password">New Password</Label>
              {/* Implementing UI button for generateSecurePassword function that was declared but had no interface */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const generated = generateSecurePassword();
                  setNewPassword(generated);
                  toast({
                    title: "Secure password generated!",
                    description: "A strong password has been created for you",
                  });
                }}
                className="text-xs"
              >
                <Key className="h-3 w-3 mr-1" />
                Generate
              </Button>
            </div>
            <Input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
            
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Password Strength: {getPasswordStrengthLabel(passwordScore)}</span>
                  <span>{passwordScore}%</span>
                </div>
                <Progress 
                  value={passwordScore} 
                  className={`h-2 ${getPasswordStrengthColor(passwordScore)}`}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Password Requirements</h4>
            <div className="space-y-2">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={updatePassword}
            disabled={isUpdating || passwordScore < 90 || newPassword !== confirmPassword}
            className="w-full"
            size="lg"
          >
            {isUpdating ? (
              "Updating Password..."
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>Update your password every 90 days for maximum security</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>Never reuse passwords from other accounts</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>Use a password manager to generate and store unique passwords</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>Enable two-factor authentication for additional security</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordStrengthPolicy;