import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Fingerprint, Scan, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isBiometricsAvailable, getAvailableBiometricType, hasBiometricCredential, authenticateWithBiometrics } from "@/services/biometricAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface BiometricLoginProps {
  userId: string;
  onSuccess?: () => void;
}

export function BiometricLogin({ userId, onSuccess }: BiometricLoginProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | 'other' | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  useEffect(() => {
    async function checkAvailability() {
      if (!userId) return;
      
      const available = await isBiometricsAvailable();
      setIsAvailable(available);
      
      if (available) {
        const type = await getAvailableBiometricType();
        setBiometricType(type);
        setIsEnabled(hasBiometricCredential(userId));
      }
    }
    
    checkAvailability();
  }, [userId]);

  const getBiometricName = (type: 'face' | 'fingerprint' | 'other' | null): string => {
    switch (type) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'other':
      default:
        return 'Biometric authentication';
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'face':
        return <Scan className="h-6 w-6" />;
      case 'fingerprint':
        return <Fingerprint className="h-6 w-6" />;
      case 'other':
      default:
        return <Shield className="h-6 w-6" />;
    }
  };

  const handleBiometricLogin = async () => {
    if (!userId) return;
    
    try {
      setIsAuthenticating(true);
      const authenticated = await authenticateWithBiometrics(userId);
      
      if (authenticated) {
        // Send a request to the server to actually log in the user
        const response = await apiRequest("POST", "/api/auth/biometric-login", { userId });
        
        if (response.ok) {
          toast({
            title: "Authentication successful",
            description: "Welcome back to WeParlay!",
            variant: "success",
          });
          
          // Invalidate user query to refresh user data
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          
          // Call success callback or redirect
          if (onSuccess) {
            onSuccess();
          } else {
            setLocation("/");
          }
        } else {
          toast({
            title: "Authentication failed",
            description: "Server could not authenticate your session. Please try again or use password login.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Authentication failed",
          description: "Biometric verification failed. Please try again or use password login.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isAvailable || !isEnabled) {
    return null;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getBiometricIcon()}
          Sign in with {getBiometricName(biometricType)}
        </CardTitle>
        <CardDescription>
          Use your {biometricType === 'face' ? 'face' : 'fingerprint'} to quickly sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        {biometricType === 'face' ? (
          <div className="flex justify-center mb-4">
            <Scan className="h-24 w-24 text-primary opacity-80" />
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <Fingerprint className="h-24 w-24 text-primary opacity-80" />
          </div>
        )}
        
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertTitle>Secure Authentication</AlertTitle>
          <AlertDescription>
            Your biometric data never leaves your device and is securely processed by your operating system.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          size="lg"
          onClick={handleBiometricLogin}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? "Authenticating..." : `Sign in with ${getBiometricName(biometricType)}`}
        </Button>
      </CardFooter>
    </Card>
  );
}