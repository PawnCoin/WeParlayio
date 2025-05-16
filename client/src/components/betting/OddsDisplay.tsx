import React from "react";
import { 
  formatOdds, 
  americanToDecimal, 
  americanToFractional 
} from "@/lib/sportsDataUtils";

interface OddsDisplayProps {
  americanOdds: number;
  format: 'american' | 'decimal' | 'fractional';
  className?: string;
}

/**
 * Component to display odds in various formats
 */
const OddsDisplay: React.FC<OddsDisplayProps> = ({ 
  americanOdds, 
  format = 'american',
  className = ''
}) => {
  const displayValue = () => {
    switch (format) {
      case 'decimal':
        return americanToDecimal(americanOdds).toFixed(2);
      case 'fractional':
        return americanToFractional(americanOdds);
      case 'american':
      default:
        return formatOdds(americanOdds);
    }
  };

  return (
    <span className={className}>
      {displayValue()}
    </span>
  );
};

export default OddsDisplay;