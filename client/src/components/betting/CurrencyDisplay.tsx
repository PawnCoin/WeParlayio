import React from 'react';
import { useCurrencyMode } from '@/contexts/CurrencyModeContext';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, DollarSign } from 'lucide-react';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string; // For crypto options
  showIcon?: boolean;
  className?: string;
  variant?: 'default' | 'secondary' | 'win' | 'loss';
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'usd',
  showIcon = true,
  className = '',
  variant = 'default'
}) => {
  const { isVirtual } = useCurrencyMode();
  
  // Format amount based on currency type
  const formatAmount = () => {
    // If using virtual currency, always display as WeParlay Cash
    if (isVirtual) {
      return amount.toLocaleString(undefined, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    
    // Otherwise, format based on the selected currency
    switch (currency.toLowerCase()) {
      case 'usd':
        return amount.toLocaleString(undefined, { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      case 'btc':
        return amount.toLocaleString(undefined, { 
          minimumFractionDigits: 8,
          maximumFractionDigits: 8
        });
      case 'eth':
      case 'sol':
        return amount.toLocaleString(undefined, { 
          minimumFractionDigits: 6,
          maximumFractionDigits: 6
        });
      case 'wept':
        return amount.toLocaleString(undefined, { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      default:
        return amount.toLocaleString();
    }
  };
  
  // Get the appropriate currency symbol
  const getCurrencySymbol = () => {
    if (isVirtual) {
      return <Coins className="h-3 w-3" />;
    }
    
    switch (currency.toLowerCase()) {
      case 'usd':
        return <DollarSign className="h-3 w-3" />;
      case 'btc':
        return '₿';
      case 'eth':
        return 'Ξ';
      case 'sol':
        return '◎';
      case 'wept':
        return '🎯';
      default:
        return <DollarSign className="h-3 w-3" />;
    }
  };
  
  // Get appropriate CSS classes based on variant
  const getVariantClass = () => {
    switch (variant) {
      case 'win':
        return 'text-green-600 font-medium';
      case 'loss':
        return 'text-red-600 font-medium';
      case 'secondary':
        return 'text-muted-foreground';
      default:
        return '';
    }
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`flex items-center ${getVariantClass()} ${className}`}>
          {showIcon && <span className="mr-1">{getCurrencySymbol()}</span>}
          <span>{formatAmount()}</span>
          {isVirtual && (
            <Badge variant="outline" className="ml-1 text-xs py-0 px-1">
              Virtual
            </Badge>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {isVirtual ? (
          <p>WeParlay Virtual Cash (Practice Mode)</p>
        ) : (
          <p>Real {currency.toUpperCase()}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default CurrencyDisplay;