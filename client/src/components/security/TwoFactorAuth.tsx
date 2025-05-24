import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  QrCode,
  CheckCircle,
  AlertTriangle,
  Key,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface TwoFactorSettings {
  isEnabled: boolean;
  method: 'sms' | 'email' | 'authenticator' | null;
  phoneNumber?: string;
  email?: string;
  backupCodes?: string[];
  lastUsed?: Date;
}

const TwoFactorAuth: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<TwoFactorSettings>({
    isEnabled: false,
    method: null
  });
  const [setupStep, setSetupStep] = useState<'select' | 'verify' | 'complete'>('select');
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email' | 'authenticator'>('sms');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    fetchTwoFactorSettings();
  }, []);

  const fetchTwoFactorSettings = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/2fa/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching 2FA settings:', error);
    }
  };

  const enableTwoFactor = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/2fa/enable', {
        method: selectedMethod,
        phoneNumber: selectedMethod === 'sms' ? phoneNumber : undefined
      });

      if (response.ok) {
        const result = await response.json();
        
        if (selectedMethod === 'authenticator') {
          setQrCodeUrl(result.qrCode);
        }
        
        setSetupStep('verify');
        
        toast({
          title: "Verification code sent",
          description: `Check your ${selectedMethod === 'sms' ? 'phone' : 'email'} for the verification code`,
        });
      } else {
        throw new Error('Failed to enable 2FA');
      }
    } catch (error: any) {
      console.error('2FA enable error:', error);
      toast({
        title: "Setup failed",
        description: "There was an error setting up two-factor authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndComplete = async () => {
    if (!verificationCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/2fa/verify', {
        code: verificationCode,
        method: selectedMethod
      });

      if (response.ok) {
        const result = await response.json();
        
        setSettings({
          isEnabled: true,
          method: selectedMethod,
          phoneNumber: selectedMethod === 'sms' ? phoneNumber : undefined,
          email: user?.email,
          backupCodes: result.backupCodes,
          lastUsed: new Date()
        });
        
        setSetupStep('complete');
        
        toast({
          title: "Two-factor authentication enabled!",
          description: "Your account is now more secure with 2FA",
        });
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      toast({
        title: "Verification failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/2fa/disable');

      if (response.ok) {
        setSettings({
          isEnabled: false,
          method: null
        });
        
        setSetupStep('select');
        
        toast({
          title: "Two-factor authentication disabled",
          description: "2FA has been removed from your account",
        });
      } else {
        throw new Error('Failed to disable 2FA');
      }
    } catch (error: any) {
      console.error('2FA disable error:', error);
      toast({
        title: "Failed to disable 2FA",
        description: "There was an error disabling two-factor authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (settings.isEnabled) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Two-Factor Authentication
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </CardTitle>
          <CardDescription>
            Your account is protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Active Protection</span>
            </div>
            <p className="text-green-700 text-sm">
              Method: {settings.method === 'sms' ? 'SMS' : settings.method === 'email' ? 'Email' : 'Authenticator App'}
            </p>
            {settings.phoneNumber && (
              <p className="text-green-700 text-sm">Phone: {settings.phoneNumber}</p>
            )}
            {settings.lastUsed && (
              <p className="text-green-700 text-sm">
                Last used: {new Date(settings.lastUsed).toLocaleString()}
              </p>
            )}
          </div>

          {settings.backupCodes && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Backup Recovery Codes</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                >
                  {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showBackupCodes ? 'Hide' : 'Show'} Codes
                </Button>
              </div>
              
              {showBackupCodes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {settings.backupCodes.map((code, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save these codes in a secure location. Each can only be used once.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSetupStep('select')}>
              Change Method
            </Button>
            <Button 
              variant="destructive" 
              onClick={disableTwoFactor}
              disabled={isLoading}
            >
              {isLoading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-600" />
          Two-Factor Authentication
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Not Enabled
          </Badge>
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Setup 2FA</TabsTrigger>
            <TabsTrigger value="info">Security Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-4">
            {setupStep === 'select' && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <Card 
                    className={`cursor-pointer ${selectedMethod === 'sms' ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                    onClick={() => setSelectedMethod('sms')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="font-medium">SMS Text Message</h3>
                          <p className="text-sm text-muted-foreground">Receive codes via text message</p>
                        </div>
                        {selectedMethod === 'sms' && <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />}
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer ${selectedMethod === 'email' ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                    onClick={() => setSelectedMethod('email')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className="text-sm text-muted-foreground">Receive codes via email</p>
                        </div>
                        {selectedMethod === 'email' && <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />}
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer ${selectedMethod === 'authenticator' ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                    onClick={() => setSelectedMethod('authenticator')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <QrCode className="h-6 w-6 text-purple-600" />
                        <div>
                          <h3 className="font-medium">Authenticator App</h3>
                          <p className="text-sm text-muted-foreground">Use Google Authenticator or similar</p>
                        </div>
                        {selectedMethod === 'authenticator' && <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedMethod === 'sms' && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}

                <Button 
                  onClick={enableTwoFactor}
                  disabled={isLoading || (selectedMethod === 'sms' && !phoneNumber)}
                  className="w-full"
                >
                  {isLoading ? 'Setting up...' : 'Continue Setup'}
                </Button>
              </div>
            )}

            {setupStep === 'verify' && (
              <div className="space-y-4">
                {selectedMethod === 'authenticator' && qrCodeUrl && (
                  <div className="text-center space-y-4">
                    <h3 className="font-medium">Scan QR Code</h3>
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code" className="border rounded" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSetupStep('select')}>
                    Back
                  </Button>
                  <Button 
                    onClick={verifyAndComplete}
                    disabled={isLoading || !verificationCode}
                    className="flex-1"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                </div>
              </div>
            )}

            {setupStep === 'complete' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold">Setup Complete!</h3>
                <p className="text-muted-foreground">
                  Two-factor authentication is now active on your account
                </p>
                <Button onClick={() => setSetupStep('select')}>
                  Manage Settings
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Why Enable 2FA?</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Protects your account even if your password is compromised</li>
                    <li>• Required for high-value transactions and withdrawals</li>
                    <li>• Prevents unauthorized access to your betting history</li>
                    <li>• Industry standard for financial applications</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-2">Important Notes</h3>
                  <ul className="text-amber-700 text-sm space-y-1">
                    <li>• Keep backup codes in a secure location</li>
                    <li>• Update your phone number if it changes</li>
                    <li>• Don't share verification codes with anyone</li>
                    <li>• Contact support if you lose access to your 2FA device</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;