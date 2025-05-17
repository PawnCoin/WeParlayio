import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Copy, Key, LockKeyhole, RefreshCw, Smartphone } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const TwoFactorAuth: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<'generate' | 'verify' | 'complete'>('generate');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryKeys, setRecoveryKeys] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('HRHDU7XYVM3WDBNZKWSM4A6YJP');
  const { toast } = useToast();

  const handleToggle2FA = (enabled: boolean) => {
    if (enabled) {
      setShowSetup(true);
      setIs2FAEnabled(false); // Will be enabled after setup is complete
    } else {
      // Confirm before disabling
      if (window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        setIs2FAEnabled(false);
        setShowSetup(false);
        toast({
          title: "Two-factor authentication disabled",
          description: "Your account is now protected by password only.",
          variant: "destructive"
        });
      }
    }
  };

  const generateSetup = () => {
    // In a real app, this would make an API call to generate a new secret and QR code URL
    // For demo purposes, we're using a static secret key and simulating the process
    
    // Generate some fake recovery keys
    const keys = [];
    for (let i = 0; i < 8; i++) {
      keys.push(`${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase());
    }
    setRecoveryKeys(keys);
    
    setSetupStep('verify');
  };

  const verifySetup = () => {
    // In a real app, this would verify the OTP code against the generated secret
    if (verificationCode.length === 6) {
      setSetupStep('complete');
    } else {
      toast({
        title: "Invalid verification code",
        description: "Please enter a valid 6-digit code from your authenticator app.",
        variant: "destructive"
      });
    }
  };

  const completeSetup = () => {
    setIs2FAEnabled(true);
    setShowSetup(false);
    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now protected with an additional layer of security.",
      variant: "default"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this into your authenticator app.",
    });
  };

  if (!showSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LockKeyhole className="mr-2 h-5 w-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a code from your mobile device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa-toggle">
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {is2FAEnabled 
                  ? 'Your account is protected by 2FA' 
                  : 'We strongly recommend enabling 2FA for account security'}
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={is2FAEnabled}
              onCheckedChange={handleToggle2FA}
            />
          </div>
        </CardContent>
        {is2FAEnabled && (
          <CardFooter className="border-t bg-muted/50 px-6 py-3">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
                Last verified: Today at 5:30 PM
              </div>
              <Button variant="outline" size="sm" className="h-8">
                Manage 2FA
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Follow these steps to add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {setupStep === 'generate' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed p-6 text-center bg-muted/30">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="mb-2 font-medium">Download an authenticator app</p>
              <p className="text-sm text-muted-foreground mb-4">
                Before you continue, download and install one of these authenticator apps:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm">Google Authenticator</Button>
                <Button variant="outline" size="sm">Authy</Button>
                <Button variant="outline" size="sm">Microsoft Authenticator</Button>
              </div>
            </div>
            <Button onClick={generateSetup} className="w-full">
              Continue to Next Step
            </Button>
          </div>
        )}

        {setupStep === 'verify' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base">Step 1: Scan this QR code with your app</Label>
              <div className="border rounded-lg p-4 flex items-center justify-center bg-white">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <Key className="h-16 w-16 text-gray-400" />
                  <p className="text-xs text-gray-500 absolute mt-24">QR Code Placeholder</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base">Step 2: Or enter this setup key manually</Label>
              <div className="relative">
                <Input 
                  value={secretKey} 
                  readOnly 
                  className="pr-10 font-mono bg-muted"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full aspect-square"
                  onClick={() => copyToClipboard(secretKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If you can't scan the QR code, you can manually enter this code into your app.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base">Step 3: Enter the 6-digit verification code</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSetup(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={verifySetup}>
                Verify & Continue
              </Button>
            </div>
          </div>
        )}

        {setupStep === 'complete' && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mr-2" />
                <p className="font-medium text-green-900 dark:text-green-300">Verification successful!</p>
              </div>
              <p className="text-sm text-green-800 dark:text-green-400 mt-1">
                Your authenticator app has been set up correctly.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-base">Recovery Keys (Important)</Label>
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Save these recovery keys in a safe place. If you lose your device, you can use any of these one-time use keys to regain access to your account.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {recoveryKeys.map((key, index) => (
                    <div key={index} className="relative">
                      <Input 
                        value={key} 
                        readOnly 
                        className="text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => copyToClipboard(recoveryKeys.join('\n'))}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy All Keys
                </Button>
              </div>
            </div>
            
            <Button onClick={completeSetup} className="w-full">
              Complete Setup
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;