import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Coins, Wallet } from "lucide-react";
import { useCurrencyMode } from "@/contexts/CurrencyModeContext";
import { useToast } from "@/hooks/use-toast";

interface CurrencyModeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export default function CurrencyModeToggle({ 
  variant = 'default', 
  className = '' 
}: CurrencyModeToggleProps) {
  const { isVirtual, toggleMode } = useCurrencyMode();
  const { toast } = useToast();

  const handleToggle = () => {
    toggleMode();
    toast({
      title: `Switched to ${!isVirtual ? 'WeParlay Cash' : 'Real Money'}`,
      description: `You're now using ${!isVirtual ? 'virtual currency' : 'real money'} for betting.`,
      duration: 2000,
    });
  };

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={handleToggle}
            className={`p-2 rounded-md ${isVirtual ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} ${className}`}
          >
            {isVirtual ? <Coins className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p>Currently using: {isVirtual ? 'WeParlay Cash' : 'Real Money'}</p>
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
          checked={isVirtual}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-blue-600"
        />
        <span className={`text-sm font-medium ${isVirtual ? 'text-blue-700' : 'text-green-700'}`}>
          {isVirtual ? 'WeParlay Cash' : 'Real Money'}
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        {isVirtual ? (
          <Coins className="h-6 w-6 text-blue-600" />
        ) : (
          <Wallet className="h-6 w-6 text-green-600" />
        )}
        <div>
          <p className="font-medium">
            {isVirtual ? 'WeParlay Cash' : 'Real Money'}
          </p>
          <p className="text-sm text-gray-500">
            {isVirtual ? 'Practice with virtual currency' : 'Real money betting'}
          </p>
        </div>
      </div>
      
      <Button
        onClick={handleToggle}
        variant="outline"
        size="sm"
        className={`${isVirtual ? 'border-blue-200 text-blue-700 hover:bg-blue-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
      >
        Switch to {isVirtual ? 'Real Money' : 'WeParlay Cash'}
      </Button>
    </div>
  );
}