import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Check, Info, AlertCircle, Wallet, Shield, Zap, RefreshCcw, ArrowRight } from "lucide-react";
import CryptoWalletConnect from "@/components/auth/CryptoWalletConnect";

interface CryptoTutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

const CryptoWalletOnboarding: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{type: string, address: string} | null>(null);

  // Handler for wallet connection success
  const handleWalletConnect = (walletAddress: string, walletType: string) => {
    setWalletConnected(true);
    setWalletDetails({ type: walletType, address: walletAddress });
    
    toast({
      title: "Wallet Connected Successfully",
      description: `${walletType} wallet connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
    });
    
    // Automatically proceed to next step after successful connection
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  // Tutorial steps
  const steps: CryptoTutorialStep[] = [
    {
      title: "Welcome to Crypto Betting",
      description: "WeParlay now supports cryptocurrency betting. This quick guide will help you get started with connecting your wallet and placing crypto bets.",
      icon: <Zap className="h-12 w-12 text-primary" />,
    },
    {
      title: "Connect Your Wallet",
      description: "First, you'll need to connect a cryptocurrency wallet to WeParlay. We support MetaMask, Phantom, Coinbase Wallet, and Trust Wallet.",
      icon: <Wallet className="h-12 w-12 text-primary" />,
      action: (
        <div className="mt-4 p-4 border rounded-lg bg-card">
          <CryptoWalletConnect onConnect={handleWalletConnect} />
          {walletConnected && (
            <div className="mt-3 p-2 bg-primary/10 rounded-md flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm">
                Connected: {walletDetails?.type} ({walletDetails?.address.substring(0, 6)}...{walletDetails?.address.substring(walletDetails.address.length - 4)})
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Network Selection & Gas Fees",
      description: "Ethereum transactions require gas fees. WeParlay supports multiple networks including Ethereum mainnet and Layer 2 solutions to help reduce costs.",
      icon: <RefreshCcw className="h-12 w-12 text-primary" />,
      action: (
        <div className="mt-4 p-4 border rounded-lg bg-card">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ethereum Mainnet:</span>
              <span className="font-medium">High fees (~$5-20)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Polygon Network:</span>
              <span className="font-medium text-green-500">Low fees (&lt;$0.01)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Optimism:</span>
              <span className="font-medium text-green-500">Medium fees (~$0.25)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Arbitrum:</span>
              <span className="font-medium text-green-500">Medium fees (~$0.25)</span>
            </div>
          </div>
          <div className="mt-4 flex items-center p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md text-xs">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Gas fees vary based on network congestion. WeParlay automatically suggests the most cost-effective network.</span>
          </div>
        </div>
      ),
    },
    {
      title: "Security & Permissions",
      description: "WeParlay only requests the minimum permissions needed to place bets and verify your identity. We never have access to your private keys.",
      icon: <Shield className="h-12 w-12 text-primary" />,
      action: (
        <div className="mt-4 space-y-3">
          <div className="p-3 border rounded-lg flex items-start bg-card">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Read-Only Access</h4>
              <p className="text-xs text-muted-foreground">We only read your public address to identify your account</p>
            </div>
          </div>
          
          <div className="p-3 border rounded-lg flex items-start bg-card">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Transaction Approval</h4>
              <p className="text-xs text-muted-foreground">You must manually approve each betting transaction through your wallet</p>
            </div>
          </div>
          
          <div className="p-3 border rounded-lg flex items-start bg-card">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium">No Private Key Access</h4>
              <p className="text-xs text-muted-foreground">We never have access to your private keys or seed phrase</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Placing Your First Crypto Bet",
      description: "Now you're ready to place your first cryptocurrency bet on WeParlay!",
      icon: <ArrowRight className="h-12 w-12 text-primary" />,
      action: (
        <div className="mt-4 space-y-4">
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Select an event you want to bet on</li>
            <li>Choose your preferred cryptocurrency from the betting slip</li>
            <li>Enter your wager amount</li>
            <li>Review the potential payout</li>
            <li>Click "Place Bet" and confirm the transaction in your wallet</li>
          </ol>
          
          <div className="p-3 bg-primary/10 rounded-md flex items-center text-sm">
            <Info className="h-4 w-4 mr-2 text-primary" />
            When using cryptocurrencies, you'll need to confirm all transactions in your wallet
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => {
              setOpen(false);
              navigate("/live-betting");
              toast({
                title: "Tutorial Completed",
                description: "You're all set to start crypto betting on WeParlay!",
              });
            }}
          >
            Start Betting with Crypto
          </Button>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setOpen(false);
    toast({
      title: "Tutorial Closed",
      description: "You can always restart the crypto tutorial from the wallet menu",
    });
  };

  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center">
          <div className="mb-6">
            {steps[currentStep].icon}
          </div>
          
          {steps[currentStep].action}
          
          <div className="w-full mt-6">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={handleClose}
            >
              Skip Tutorial
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1 || (currentStep === 1 && !walletConnected)}
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
              {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoWalletOnboarding;