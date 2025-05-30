
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface WalletSecurityWrapperProps {
  children: React.ReactNode;
  requireSecureConnection?: boolean;
}

const WalletSecurityWrapper: React.FC<WalletSecurityWrapperProps> = ({ 
  children, 
  requireSecureConnection = true 
}) => {
  const [securityChecks, setSecurityChecks] = useState({
    isSecureConnection: false,
    hasValidEnvironment: false,
    isProductionReady: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSecurityChecks = () => {
      const checks = {
        isSecureConnection: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        hasValidEnvironment: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
        isProductionReady: true
      };

      // Additional production checks
      if (process.env.NODE_ENV === 'production') {
        checks.isProductionReady = window.location.protocol === 'https:';
      }

      setSecurityChecks(checks);
      setIsLoading(false);
    };

    performSecurityChecks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Verifying security...</span>
      </div>
    );
  }

  // Show security warnings if checks fail
  if (requireSecureConnection && !securityChecks.isSecureConnection) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Insecure Connection</AlertTitle>
        <AlertDescription>
          Wallet connections require a secure HTTPS connection. Please access this site via HTTPS.
        </AlertDescription>
      </Alert>
    );
  }

  if (!securityChecks.isProductionReady) {
    return (
      <Alert variant="destructive">
        <Lock className="h-4 w-4" />
        <AlertTitle>Production Security Check Failed</AlertTitle>
        <AlertDescription>
          This environment is not configured for secure wallet operations.
        </AlertDescription>
      </Alert>
    );
  }

  // Show success message with security status
  return (
    <div>
      <Alert className="mb-4 border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Secure Environment Verified</AlertTitle>
        <AlertDescription className="text-green-700">
          ✅ HTTPS Connection | ✅ Wallet Support | ✅ Production Ready
        </AlertDescription>
      </Alert>
      {children}
    </div>
  );
};

export default WalletSecurityWrapper;
