import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown, Sparkles, Clock } from 'lucide-react';

// Mock price data for demonstration
// In a real implementation, this would be fetched from a price API or blockchain
const generateMockPriceData = (startPrice: number, days: number, volatility: number = 0.05) => {
  const data = [];
  let currentPrice = startPrice;
  
  for (let i = 0; i < days; i++) {
    // Add some random variation
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    currentPrice = Math.max(0.01, currentPrice + change);
    
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(6))
    });
  }
  
  return data;
};

interface TokenPriceChartProps {
  tokenId: string;
  tokenSymbol: string;
  currentPrice: number;
  onChange?: (price: number) => void;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({
  tokenId,
  tokenSymbol,
  currentPrice,
  onChange
}) => {
  const [priceData, setPriceData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [priceChange, setPriceChange] = useState<{
    value: number;
    percentage: number;
    isPositive: boolean;
  }>({ value: 0, percentage: 0, isPositive: true });
  
  useEffect(() => {
    // In a real implementation, fetch actual price data from an API
    // For now, generate mock data
    const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    const data = generateMockPriceData(
      currentPrice * 0.95, // Start a bit lower to show positive trend by default
      days,
      tokenId === 'weplaytoken' ? 0.03 : 0.06 // Lower volatility for WePlay Token (more stable)
    );
    
    setPriceData(data);
    
    // Calculate price change
    if (data.length > 1) {
      const startPrice = data[0].price;
      const endPrice = data[data.length - 1].price;
      const changeValue = endPrice - startPrice;
      const changePercentage = (changeValue / startPrice) * 100;
      
      setPriceChange({
        value: parseFloat(changeValue.toFixed(6)),
        percentage: parseFloat(changePercentage.toFixed(2)),
        isPositive: changeValue >= 0
      });
      
      // Notify parent of price change
      if (onChange) {
        onChange(endPrice);
      }
    }
  }, [timeframe, currentPrice, tokenId, onChange]);
  
  // Max and min values for chart scaling
  const maxPrice = priceData.length > 0 ? Math.max(...priceData.map(d => d.price)) * 1.1 : 0;
  const minPrice = priceData.length > 0 ? Math.min(...priceData.map(d => d.price)) * 0.9 : 0;
  
  // Simple chart generation
  const getChartPath = () => {
    if (priceData.length < 2) return '';
    
    const width = 300;
    const height = 100;
    const xStep = width / (priceData.length - 1);
    
    // Scale prices to fit in the view
    const scale = height / (maxPrice - minPrice);
    
    // Create SVG path
    const points = priceData.map((d, i) => {
      const x = i * xStep;
      const y = height - (d.price - minPrice) * scale;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            {tokenId === 'weplaytoken' ? (
              <Sparkles className="h-4 w-4 mr-1.5 text-yellow-500" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-1.5 text-blue-500" />
            )}
            
            {tokenSymbol} Price
            
            {tokenId === 'weplaytoken' && (
              <Badge className="ml-2 bg-green-600 text-xs">WePlay Token</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center">
            <span className="text-lg font-bold mr-2">${currentPrice.toFixed(6)}</span>
            <div className={`flex items-center text-xs ${priceChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange.isPositive ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              <span className="font-medium">{Math.abs(priceChange.percentage).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <Tabs value={timeframe} onValueChange={(value: any) => setTimeframe(value)} className="mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="day" className="text-xs">24h</TabsTrigger>
            <TabsTrigger value="week" className="text-xs">7d</TabsTrigger>
            <TabsTrigger value="month" className="text-xs">30d</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="w-full h-[120px] relative">
          <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
            {/* Chart area background */}
            <rect x="0" y="0" width="300" height="100" fill="none" />
            
            {/* Price line */}
            <path
              d={getChartPath()}
              fill="none"
              stroke={priceChange.isPositive ? '#059669' : '#dc2626'}
              strokeWidth="2"
            />
            
            {/* Area under the line */}
            <path
              d={`${getChartPath()} L300,100 L0,100 Z`}
              fill={priceChange.isPositive ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)'}
            />
          </svg>
          
          <div className="absolute bottom-0 left-0 text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {priceData.length > 0 ? priceData[0].date : ''}
          </div>
          
          <div className="absolute bottom-0 right-0 text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {priceData.length > 0 ? priceData[priceData.length - 1].date : ''}
          </div>
        </div>
        
        {tokenId === 'weplaytoken' && (
          <div className="mt-2 text-xs text-center text-gray-500">
            <p>WePlay Token offers 5% odds boost on all bets!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenPriceChart;