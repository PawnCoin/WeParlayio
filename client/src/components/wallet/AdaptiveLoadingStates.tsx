import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Wallet, AlertCircle } from "lucide-react";

interface AdaptiveLoadingStatesProps {
  loadingState: 'connecting' | 'verifying' | 'success' | 'error' | 'idle';
  walletType?: string;
  error?: string;
}

const AdaptiveLoadingStates: React.FC<AdaptiveLoadingStatesProps> = ({
  loadingState,
  walletType,
  error
}) => {
  if (loadingState === 'idle') return null;

  const getLoadingMessage = () => {
    switch (loadingState) {
      case 'connecting':
        return `Connecting to ${walletType || 'wallet'}...`;
      case 'verifying':
        return 'Verifying wallet connection...';
      case 'success':
        return 'Successfully connected!';
      case 'error':
        return error || 'Connection failed';
      default:
        return 'Processing...';
    }
  };

  const getIcon = () => {
    switch (loadingState) {
      case 'connecting':
      case 'verifying':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <Wallet className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div className="flex-1">
            <p className="font-medium">{getLoadingMessage()}</p>
            {loadingState === 'connecting' && (
              <div className="mt-2 space-y-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/4" />
              </div>
            )}
          </div>
        </div>
        
        {loadingState === 'verifying' && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Please approve the connection in your wallet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveLoadingStates;