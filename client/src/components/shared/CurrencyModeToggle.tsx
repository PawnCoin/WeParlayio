import React from 'react';
import { Switch } from "@/components/ui/switch";
import { useCurrencyMode } from '@/contexts/CurrencyModeContext';
import { Coins, Wallet } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CurrencyModeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

const CurrencyModeToggle: React.FC<CurrencyModeToggleProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { isVirtual, toggleMode } = useCurrencyMode();

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={toggleMode}
            className={`p-2 rounded-md ${isVirtual ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} ${className}`}
          >
            {isVirtual ? <Coins className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Currently using: {isVirtual ? 'WeParlay Cash' : 'Real Money'}</p>
          <p className="text-xs">Click to switch</p>
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
          onCheckedChange={toggleMode}
        />
        <span className="text-xs font-medium">
          {isVirtual ? 'WeParlay Cash' : 'Real Money'}
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Wallet className={`h-4 w-4 ${!isVirtual ? 'text-red-500' : 'text-muted-foreground'}`} />
      <span className="text-sm font-medium">Real</span>
      <Switch 
        checked={isVirtual}
        onCheckedChange={toggleMode}
      />
      <span className="text-sm font-medium">Virtual</span>
      <Coins className={`h-4 w-4 ${isVirtual ? 'text-green-500' : 'text-muted-foreground'}`} />
    </div>
  );
};

export default CurrencyModeToggle;