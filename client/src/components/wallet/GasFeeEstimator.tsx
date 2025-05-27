import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  DollarSign,
  Timer,
  Gauge
} from "lucide-react";

interface GasPrice {
  slow: number;
  average: number;
  fast: number;
  baseFee: number;
  timestamp: number;
}

interface NetworkGasInfo {
  network: string;
  chainId: number;
  gasInfo: GasPrice | null;
  isLoading: boolean;
  error: string | null;
}

interface Transaction {
  type: string;
  estimatedGas: number;
}

const GasFeeEstimator: React.FC = () => {
  const [networksData, setNetworksData] = useState<NetworkGasInfo[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum");
  const [transactionSize, setTransactionSize] = useState<string>("standard");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const { toast } = useToast();

  const networks = [
    { network: "ethereum", chainId: 1, name: "Ethereum", color: "bg-blue-500" },
    { network: "polygon", chainId: 137, name: "Polygon", color: "bg-purple-500" },
    { network: "optimism", chainId: 10, name: "Optimism", color: "bg-red-500" },
    { network: "arbitrum", chainId: 42161, name: "Arbitrum", color: "bg-blue-400" },
    { network: "base", chainId: 8453, name: "Base", color: "bg-blue-600" }
  ];

  const transactionTypes = [
    { type: "simple", estimatedGas: 21000, label: "Simple Transfer" },
    { type: "standard", estimatedGas: 65000, label: "Standard Transaction" },
    { type: "complex", estimatedGas: 150000, label: "Complex Contract" },
    { type: "nft", estimatedGas: 85000, label: "NFT Transaction" }
  ];

  const fetchEthPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 2000; // Fallback price
    }
  };

  const fetchGasPrices = async () => {
    setNetworksData(prev => prev.map(network => ({
      ...network,
      isLoading: true,
      error: null
    })));

    try {
      const ethPrice = await fetchEthPrice();
      
      for (const network of networks) {
        try {
          const response = await fetch(`/api/gas-prices/${network.network}`);
          const realGasData = await response.json();
          
          const gasInfo: GasPrice = {
            slow: realGasData.slow || 0,
            average: realGasData.average || 0,
            fast: realGasData.fast || 0,
            baseFee: realGasData.baseFee || 0,
            timestamp: Date.now()
          };

          setNetworksData(prev => prev.map(net => 
            net.network === network.network 
              ? { ...net, gasInfo, isLoading: false, error: null }
              : net
          ));
        } catch (error) {
          console.error(`Error fetching gas prices for ${network.network}:`, error);
          setNetworksData(prev => prev.map(net => 
            net.network === network.network 
              ? { ...net, gasInfo: null, isLoading: false, error: 'Failed to fetch' }
              : net
          ));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch gas prices. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateTransactionCost = (gasPrice: number, network: string) => {
    const transaction = transactionTypes.find(t => t.type === transactionSize);
    if (!transaction) return 0;
    
    const gasCost = (gasPrice * transaction.estimatedGas) / 1e9; // Convert to ETH/MATIC etc
    return gasCost;
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchGasPrices();
  };

  useEffect(() => {
    // Initialize network data
    setNetworksData(networks.map(network => ({
      ...network,
      gasInfo: null,
      isLoading: true,
      error: null
    })));

    fetchGasPrices();
  }, [refreshKey]);

  const selectedNetworkData = networksData.find(n => n.network === selectedNetwork);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-600" />
              Real-Time Gas Fee Tracker
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Live API Data
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={networksData.some(n => n.isLoading)}
            >
              <RefreshCw className={`h-4 w-4 ${networksData.some(n => n.isLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Network Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Select Network</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {networks.map((network) => (
                <Button
                  key={network.network}
                  variant={selectedNetwork === network.network ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedNetwork(network.network)}
                  className="flex items-center gap-2"
                >
                  <div className={`w-2 h-2 rounded-full ${network.color}`} />
                  {network.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Transaction Size Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Transaction Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {transactionTypes.map((tx) => (
                <Button
                  key={tx.type}
                  variant={transactionSize === tx.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTransactionSize(tx.type)}
                >
                  {tx.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Gas Price Display */}
          {selectedNetworkData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {networks.find(n => n.network === selectedNetwork)?.name} Gas Prices
              </h3>
              
              {selectedNetworkData.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2">Loading real gas data...</span>
                </div>
              ) : selectedNetworkData.error ? (
                <div className="text-center py-8 text-red-600">
                  Error: {selectedNetworkData.error}
                </div>
              ) : selectedNetworkData.gasInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Slow</p>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedNetworkData.gasInfo.slow}
                          </p>
                          <p className="text-xs text-muted-foreground">gwei</p>
                        </div>
                        <Timer className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm mt-2">
                        Cost: ${calculateTransactionCost(selectedNetworkData.gasInfo.slow, selectedNetwork).toFixed(4)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Standard</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {selectedNetworkData.gasInfo.average}
                          </p>
                          <p className="text-xs text-muted-foreground">gwei</p>
                        </div>
                        <Activity className="h-8 w-8 text-yellow-600" />
                      </div>
                      <p className="text-sm mt-2">
                        Cost: ${calculateTransactionCost(selectedNetworkData.gasInfo.average, selectedNetwork).toFixed(4)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Fast</p>
                          <p className="text-2xl font-bold text-red-600">
                            {selectedNetworkData.gasInfo.fast}
                          </p>
                          <p className="text-xs text-muted-foreground">gwei</p>
                        </div>
                        <Zap className="h-8 w-8 text-red-600" />
                      </div>
                      <p className="text-sm mt-2">
                        Cost: ${calculateTransactionCost(selectedNetworkData.gasInfo.fast, selectedNetwork).toFixed(4)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No gas data available
                </div>
              )}
            </div>
          )}

          {/* All Networks Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Networks Overview</h3>
            <div className="space-y-2">
              {networksData.map((network) => (
                <div
                  key={network.network}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${networks.find(n => n.network === network.network)?.color}`} />
                    <span className="font-medium">
                      {networks.find(n => n.network === network.network)?.name}
                    </span>
                  </div>
                  
                  {network.isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : network.error ? (
                    <span className="text-red-600 text-sm">Error</span>
                  ) : network.gasInfo ? (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">{network.gasInfo.slow} gwei</span>
                      <span className="text-yellow-600">{network.gasInfo.average} gwei</span>
                      <span className="text-red-600">{network.gasInfo.fast} gwei</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No data</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GasFeeEstimator;