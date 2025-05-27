import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Coins, Wallet } from "lucide-react";
import { useBetting } from "@/contexts/BettingContext";
import { useToast } from "@/hooks/use-toast";

interface CurrencyModeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
  onCurrencyChange?: () => void;
}

export default function CurrencyModeToggle({ 
  variant = 'default', 
  className = '',
  onCurrencyChange
}: CurrencyModeToggleProps) {
  const { selectedCurrency, setSelectedCurrency } = useBetting();
  const { toast } = useToast();

  const handleToggle = () => {
    // Use the same logic as your blue WPC button and dropdown
    const newMode = selectedCurrency === 'WEPARLAY' ? 'USD' : 'WEPARLAY';
    setSelectedCurrency(newMode);
    
    toast({
      title: `Switched to ${newMode === 'WEPARLAY' ? 'WeParlay Cash' : 'Real Money'} Mode`,
      description: `You're now betting with ${newMode === 'WEPARLAY' ? 'virtual currency' : 'real money'}`,
      duration: 3000,
    });
    
    if (onCurrencyChange) {
      onCurrencyChange();
    }
  };

  const isWeparlayCash = selectedCurrency === 'WEPARLAY';

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={handleToggle}
            className={`p-2 rounded-md ${isWeparlayCash ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} ${className}`}
          >
            {isWeparlayCash ? <Coins className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p>Currently using: {isWeparlayCash ? 'WeParlay Cash' : 'Real Money'}</p>
            <p className="text-xs">Click to switch</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Switch
          checked={isWeparlayCash}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-blue-600"
        />
        <span className={`text-sm font-medium ${isWeparlayCash ? 'text-blue-700' : 'text-green-700'}`}>
          {isWeparlayCash ? 'WeParlay Cash' : 'Real Money'}
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        {isWeparlayCash ? (
          <Coins className="h-6 w-6 text-blue-600" />
        ) : (
          <Wallet className="h-6 w-6 text-green-600" />
        )}
        <div>
          <p className="font-medium">
            {isWeparlayCash ? 'WeParlay Cash' : 'Real Money'}
          </p>
          <p className="text-sm text-gray-500">
            {isWeparlayCash ? 'Practice with virtual currency' : 'Real money betting'}
          </p>
        </div>
      </div>
      
      <Button
        onClick={handleToggle}
        variant="outline"
        size="sm"
        className={`${isWeparlayCash ? 'border-blue-200 text-blue-700 hover:bg-blue-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
      >
        Switch to {isWeparlayCash ? 'Real Money' : 'WeParlay Cash'}
      </Button>
    </div>
  );
}