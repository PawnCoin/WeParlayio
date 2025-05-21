import React from "react";
import { Loader2, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface WalletLoadingProps {
  state: "connecting" | "connected" | "error" | "processing" | "success" | "confirming";
  walletType?: string;
  message?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const WalletLoadingState: React.FC<WalletLoadingProps> = ({
  state,
  walletType = "wallet",
  message,
  onRetry,
  onCancel,
}) => {
  const getIcon = () => {
    switch (state) {
      case "connecting":
        return <Wifi className="h-6 w-6 text-primary animate-pulse" />;
      case "connected":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      case "processing":
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "confirming":
        return <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />;
      default:
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (state) {
      case "connecting":
        return `Connecting to ${walletType}`;
      case "connected":
        return `Connected to ${walletType}`;
      case "error":
        return "Connection Error";
      case "processing":
        return "Processing Transaction";
      case "success":
        return "Transaction Successful";
      case "confirming":
        return "Awaiting Confirmation";
      default:
        return "Loading...";
    }
  };

  const getDefaultMessage = () => {
    switch (state) {
      case "connecting":
        return `Please approve the connection request in your ${walletType} wallet.`;
      case "connected":
        return `Your ${walletType} wallet is now connected to WeParlay.`;
      case "error":
        return `Failed to connect to ${walletType}. Please make sure your wallet is unlocked and try again.`;
      case "processing":
        return "Your transaction is being processed on the blockchain.";
      case "success":
        return "Your transaction has been successfully confirmed!";
      case "confirming":
        return `Please confirm the transaction in your ${walletType} wallet.`;
      default:
        return "Please wait...";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            {getIcon()}
          </div>

          <h3 className="text-lg font-medium mb-2">{getTitle()}</h3>
          <p className="text-muted-foreground mb-6">
            {message || getDefaultMessage()}
          </p>

          {state === "error" && onRetry && (
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onCancel} className="w-full">
                Cancel
              </Button>
              <Button onClick={onRetry} className="w-full">
                Retry
              </Button>
            </div>
          )}

          {state === "connecting" && onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}

          {state === "confirming" && onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const TransactionLoadingOverlay: React.FC<{
  isOpen: boolean;
  state: WalletLoadingProps["state"];
  walletType?: string;
  message?: string;
  onCancel?: () => void;
}> = ({ isOpen, state, walletType, message, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <WalletLoadingState
        state={state}
        walletType={walletType}
        message={message}
        onCancel={onCancel}
      />
    </div>
  );
};

// Mini version of the loading state for use in buttons or compact UI elements
export const WalletLoadingIndicator: React.FC<{
  state: WalletLoadingProps["state"];
  showText?: boolean;
}> = ({ state, showText = false }) => {
  const getIcon = () => {
    switch (state) {
      case "connecting":
        return <Wifi className="h-4 w-4 animate-pulse" />;
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "confirming":
        return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getText = () => {
    switch (state) {
      case "connecting":
        return "Connecting";
      case "connected":
        return "Connected";
      case "error":
        return "Error";
      case "processing":
        return "Processing";
      case "success":
        return "Successful";
      case "confirming":
        return "Confirm in Wallet";
      default:
        return "Loading";
    }
  };

  return (
    <div className="flex items-center">
      {getIcon()}
      {showText && <span className="ml-2 text-sm">{getText()}</span>}
    </div>
  );
};