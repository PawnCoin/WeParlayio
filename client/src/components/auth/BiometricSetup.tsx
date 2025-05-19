import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Fingerprint, Scan, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isBiometricsAvailable, getAvailableBiometricType, hasBiometricCredential, registerBiometricCredential, removeBiometricCredential } from "@/services/biometricAuth";
import { useAuth } from "@/hooks/useAuth";

export function BiometricSetup() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | 'other' | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

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

  const handleRegister = async () => {
    if (!userId) return;
    
    try {
      setIsRegistering(true);
      const credential = await registerBiometricCredential(userId);
      
      if (credential) {
        setIsEnabled(true);
        toast({
          title: "Biometric authentication enabled",
          description: `You can now sign in using ${getBiometricName(biometricType)}.`,
          // Use a valid toast variant
        });
      } else {
        toast({
          title: "Registration failed",
          description: "Unable to register your biometric data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemove = async () => {
    if (!userId) return;
    
    try {
      setIsRemoving(true);
      removeBiometricCredential(userId);
      setIsEnabled(false);
      toast({
        title: "Biometric authentication disabled",
        description: "Your biometric data has been removed from this device.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Removal error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

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

  if (!userId) {
    return (
      <Alert className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication required</AlertTitle>
        <AlertDescription>
          Please sign in to manage biometric authentication.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Quickly log in with your biometric data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not available</AlertTitle>
            <AlertDescription>
              Biometric authentication is not available on this device or browser. Please use a device with fingerprint or facial recognition capabilities.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getBiometricIcon()}
          {getBiometricName(biometricType)} Authentication
        </CardTitle>
        <CardDescription>
          Sign in quickly and securely using your {biometricType === 'face' ? 'face' : 'fingerprint'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="biometric-switch" className="text-base">Enable {getBiometricName(biometricType)}</Label>
              {isEnabled && (
                <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Enabled
                </span>
              )}
            </div>
            <Switch
              id="biometric-switch"
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleRegister();
                } else {
                  handleRemove();
                }
              }}
              disabled={isRegistering || isRemoving}
            />
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Enhanced Security</AlertTitle>
          <AlertDescription>
            Biometric authentication provides an additional layer of security for your WeParlay account. Your biometric data never leaves your device and is securely stored by your operating system.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEnabled ? (
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving || isRegistering}
          >
            {isRemoving ? "Removing..." : "Remove Biometric Data"}
          </Button>
        ) : (
          <Button
            onClick={handleRegister}
            disabled={isRegistering || isRemoving}
          >
            {isRegistering ? "Setting up..." : `Set Up ${getBiometricName(biometricType)}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}