import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

export default function CryptoInformation() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback crypto data - always available
  const fallbackData: CryptoData[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 43250.00,
      change24h: 2.45,
      volume: 28500000000,
      marketCap: 847000000000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2580.50,
      change24h: -1.25,
      volume: 15200000000,
      marketCap: 310000000000
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.00,
      change24h: 0.02,
      volume: 4800000000,
      marketCap: 32000000000
    }
  ];

  useEffect(() => {
    async function fetchCryptoData() {
      try {
        setLoading(true);
        const response = await fetch('/api/crypto/prices');

        if (!response.ok) {
          throw new Error('API unavailable');
        }

        const data = await response.json();
        setCryptoData(data);
        setError(null);
      } catch (err) {
        console.warn('Crypto API failed, using fallback data:', err);
        setCryptoData(fallbackData);
        setError('Using cached data - live prices temporarily unavailable');
      } finally {
        setLoading(false);
      }
    }

    fetchCryptoData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cryptocurrency Information</h1>
        <p className="text-gray-600 mt-2">Real-time crypto prices for betting</p>
        {error && (
          <Badge variant="outline" className="mt-2 text-yellow-600">
            {error}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cryptoData.map((crypto) => (
          <Card key={crypto.symbol} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{crypto.symbol}</span>
                <div className="flex items-center">
                  {crypto.change24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-gray-600">{crypto.name}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price
                  </span>
                  <span className="font-semibold">
                    ${crypto.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>24h Change</span>
                  <Badge 
                    variant={crypto.change24h >= 0 ? "default" : "destructive"}
                    className={crypto.change24h >= 0 ? "bg-green-500" : ""}
                  >
                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Volume
                  </span>
                  <span className="text-sm">
                    ${(crypto.volume / 1000000000).toFixed(1)}B
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Market Cap</span>
                  <span className="text-sm">
                    ${(crypto.marketCap / 1000000000).toFixed(1)}B
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}