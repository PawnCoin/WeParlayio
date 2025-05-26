import React from 'react';
import { Switch } from "@/components/ui/switch";
import { useBetting } from '@/contexts/BettingContext';
import { Coins, Wallet } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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
  const { selectedCurrency, setSelectedCurrency } = useBetting();

  const isVirtual = selectedCurrency === 'WEPARLAY';

  const toggleMode = () => {
    const newMode = selectedCurrency === 'WEPARLAY' ? 'USD' : 'WEPARLAY';
    setSelectedCurrency(newMode);
  };
  const { toast } = useToast();

  

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      
        
          <button 
            onClick={toggleMode}
            className={`p-2 rounded-md ${isVirtual ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} ${className}`}
          >
            {isVirtual ? <Coins className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
          </button>
        
        
          <p>Currently using: {isVirtual ? 'WeParlay Cash' : 'Real Money'}</p>
          <p className="text-xs">Click to switch</p>
        
      
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
        <span className={`text-xs font-medium ${isVirtual ? 'text-blue-700' : 'text-green-700'}`}>
          {isVirtual ? 'WeParlay Cash' : 'Real Money'}
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Wallet className={`h-4 w-4 ${!isVirtual ? 'text-green-500' : 'text-muted-foreground'}`} />
      <span className="text-sm font-medium">Real</span>
      <Switch 
        checked={isVirtual}
        onCheckedChange={toggleMode}
      />
      <span className="text-sm font-medium">Virtual</span>
      <Coins className={`h-4 w-4 ${isVirtual ? 'text-blue-500' : 'text-muted-foreground'}`} />
    </div>
  );
};

export default CurrencyModeToggle;