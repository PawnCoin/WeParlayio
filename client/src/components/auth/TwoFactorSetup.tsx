import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, EyeOff, Shield, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (step === 'setup') {
      generateTwoFactorSetup();
    }
  }, [step]);

  const generateTwoFactorSetup = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
      } else {
        setError(data.message || 'Failed to generate 2FA setup');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!user?.id || !verificationCode) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token: verificationCode,
          secret: secret,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep('backup');
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled",
        });
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const content = `WeParlay.io Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleDateString()}
User: ${user?.email}

IMPORTANT: Store these codes securely. Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Keep these codes in a safe place. You can use them to access your account if you lose your phone.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weparlay-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Backup codes saved to your device",
    });
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Set Up Two-Factor Authentication</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Scan the QR code with your authenticator app or enter the key manually
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {qrCode && (
            <div className="flex justify-center">
              <img src={qrCode} alt="2FA QR Code" className="border rounded-lg" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="manual-key">Manual Entry Key</Label>
            <div className="flex space-x-2">
              <Input
                id="manual-key"
                value={secret}
                readOnly
                type={showSecret ? 'text' : 'password'}
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(secret)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Popular authenticator apps: Google Authenticator, Authy, Microsoft Authenticator, 1Password
            </AlertDescription>
          </Alert>
        </>
      )}

      <div className="flex space-x-2">
        <Button 
          onClick={() => setStep('verify')} 
          disabled={loading || !secret}
          className="flex-1"
        >
          Next: Verify Setup
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Verify Your Setup</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={() => setStep('setup')} 
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={verifySetup}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1"
        >
          {loading ? 'Verifying...' : 'Verify & Enable'}
        </Button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Save Your Backup Codes</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          These codes can be used if you lose access to your authenticator app
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Important:</strong> Store these codes securely. Each code can only be used once.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-2">
        {backupCodes.map((code, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <Badge variant="outline" className="text-xs">
              {index + 1}
            </Badge>
            <code className="flex-1 font-mono text-sm">{code}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(code)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={downloadBackupCodes}
          variant="outline"
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Codes
        </Button>
        <Button 
          onClick={onComplete}
          className="flex-1"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Two-Factor Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'setup' && renderSetupStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'backup' && renderBackupStep()}
      </CardContent>
    </Card>
  );
}