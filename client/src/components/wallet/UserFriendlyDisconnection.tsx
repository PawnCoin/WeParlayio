import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface UserFriendlyDisconnectionProps {
  walletAddress: string;
  walletType: string;
  onDisconnect: () => void;
}

const UserFriendlyDisconnection: React.FC<UserFriendlyDisconnectionProps> = ({
  walletAddress,
  walletType,
  onDisconnect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    
    try {
      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear any stored wallet data
      localStorage.removeItem('walletConnection');
      sessionStorage.removeItem('walletSession');
      
      setIsOpen(false);
      onDisconnect();
      
      toast({
        title: "Wallet Disconnected Safely",
        description: "Your wallet has been disconnected and all session data cleared.",
      });
      
    } catch (error) {
      toast({
        title: "Disconnection Error",
        description: "There was an issue disconnecting your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Disconnect Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to disconnect your {walletType} wallet?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens when you disconnect:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Your wallet session will be cleared</li>
                <li>• You'll need to reconnect to place bets</li>
                <li>• Your betting history will remain safe</li>
                <li>• No funds will be affected</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Current Wallet:</p>
            <p className="text-sm text-muted-foreground">
              {walletType} - {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You can safely reconnect anytime using the same wallet address.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDisconnecting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect Wallet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFriendlyDisconnection;