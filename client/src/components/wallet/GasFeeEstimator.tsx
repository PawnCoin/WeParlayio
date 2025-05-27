import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Info, AlertTriangle } from "lucide-react";

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

const GasFeeEstimator: React.FC = () => {
  const { toast } = useToast();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum");
  const [transactionSize, setTransactionSize] = useState<number>(21000); // Standard ETH transfer
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Networks and their gas pricing
  const [networksData, setNetworksData] = useState<NetworkGasInfo[]>([
    { network: "ethereum", chainId: 1, gasInfo: null, isLoading: true, error: null },
    { network: "polygon", chainId: 137, gasInfo: null, isLoading: true, error: null },
    { network: "optimism", chainId: 10, gasInfo: null, isLoading: true, error: null },
    { network: "arbitrum", chainId: 42161, gasInfo: null, isLoading: true, error: null },
    { network: "base", chainId: 8453, gasInfo: null, isLoading: true, error: null }
  ]);

  // Function to get ETH price in USD
  const fetchEthPrice = async (): Promise<number> => {
    try {
      // In a real implementation, this would fetch from a price API
      // For demo purposes, using a static value
      return 4250.00; // ETH price in USD
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      return 4250.00; // Fallback value
    }
  };

  // Fetch gas prices from network
  const fetchGasPrices = async () => {
    // Set all networks to loading state
    setNetworksData(prev => prev.map(network => ({
      ...network,
      isLoading: true,
      error: null
    })));

    try {
      // Fetch real gas prices from live blockchain APIs
      const ethPrice = await fetchEthPrice();
      
      // Fetch real gas prices from each network
      setNetworksData(prev => prev.map(async network => {
        let gasInfo: GasPrice;
        
        try {
          const response = await fetch(`/api/gas-prices/${network.network}`);
          const realGasData = await response.json();
          
          gasInfo = {
            slow: realGasData.slow || 0,
            average: realGasData.average || 0,
            fast: realGasData.fast || 0,
            baseFee: realGasData.baseFee || 0,
            timestamp: Date.now()
          };
        } catch (error) {
          console.error(`Error fetching gas prices for ${network.network}:`, error);
          gasInfo = {
            slow: 0,
            average: 0,
            fast: 0,
            baseFee: 0,
            timestamp: Date.now()
          };
        }
        
        return {
                slow: 0.4,
                average: 0.6,
                fast: 0.9,
                baseFee: 0.3,
                timestamp: Date.now()
              };
              break;
            default:
              gasInfo = {
                slow: 45,
                average: 55,
                fast: 70,
                baseFee: 40,
                timestamp: Date.now()
              };
          }
          
          return {
            ...network,
            gasInfo,
            isLoading: false,
            error: null
          };
        }));
      }, 1000);
    } catch (error) {
      console.error("Error fetching gas prices:", error);
      
      // Update state with error
      setNetworksData(prev => prev.map(network => ({
        ...network,
        isLoading: false,
        error: "Failed to fetch gas prices. Please try again."
      })));
      
      toast({
        title: "Gas Price Error",
        description: "Failed to fetch current gas prices. Using estimates instead.",
        variant: "destructive"
      });
    }
  };

  // Calculate transaction cost in USD
  const calculateTransactionCost = (gasPrice: number, ethPrice: number): string => {
    // Gas units × Gas price × ETH price
    const ethCost = (transactionSize * gasPrice * 1e-9); // Convert gwei to ETH
    const usdCost = ethCost * ethPrice;
    return usdCost.toFixed(2);
  };

  // Refresh gas prices
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Fetch gas prices on mount and when refresh is triggered
  useEffect(() => {
    fetchGasPrices();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchGasPrices();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshKey]);

  // Get current network data
  const currentNetwork = networksData.find(network => network.network === selectedNetwork);

  // Handle transaction type change
  const handleTransactionTypeChange = (value: string) => {
    switch(value) {
      case "transfer":
        setTransactionSize(21000);
        break;
      case "swap":
        setTransactionSize(120000);
        break;
      case "mint":
        setTransactionSize(150000);
        break;
      case "bet":
        setTransactionSize(80000);
        break;
      default:
        setTransactionSize(21000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Gas Fee Estimator</span>
          <button 
            onClick={handleRefresh} 
            className="p-1 rounded-full hover:bg-muted"
            aria-label="Refresh gas prices"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardTitle>
        <CardDescription>
          Estimate transaction costs across different networks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Network</label>
              <Select
                value={selectedNetwork}
                onValueChange={setSelectedNetwork}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Transaction Type</label>
              <Select
                defaultValue="bet"
                onValueChange={handleTransactionTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Token Transfer</SelectItem>
                  <SelectItem value="swap">Token Swap</SelectItem>
                  <SelectItem value="bet">Place Bet</SelectItem>
                  <SelectItem value="mint">NFT Mint</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Gas Price Display */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-2 text-xs font-medium grid grid-cols-4">
              <div>Speed</div>
              <div>Gas Price</div>
              <div>Time Estimate</div>
              <div>Cost (USD)</div>
            </div>
            
            {currentNetwork?.isLoading ? (
              // Loading state
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-2 border-t grid grid-cols-4 items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </>
            ) : currentNetwork?.error ? (
              // Error state
              <div className="p-4 text-center text-destructive flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="text-sm">{currentNetwork.error}</p>
              </div>
            ) : (
              // Gas prices
              <>
                <div className="p-2 border-t grid grid-cols-4 items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Fast</span>
                  </div>
                  <div className="text-sm">
                    {currentNetwork?.gasInfo?.fast} Gwei
                  </div>
                  <div className="text-sm">~30 seconds</div>
                  <div className="text-sm font-medium">
                    ${calculateTransactionCost(currentNetwork?.gasInfo?.fast || 0, 4250)}
                  </div>
                </div>
                
                <div className="p-2 border-t grid grid-cols-4 items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">Average</span>
                  </div>
                  <div className="text-sm">
                    {currentNetwork?.gasInfo?.average} Gwei
                  </div>
                  <div className="text-sm">~1 minute</div>
                  <div className="text-sm font-medium">
                    ${calculateTransactionCost(currentNetwork?.gasInfo?.average || 0, 4250)}
                  </div>
                </div>
                
                <div className="p-2 border-t grid grid-cols-4 items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Slow</span>
                  </div>
                  <div className="text-sm">
                    {currentNetwork?.gasInfo?.slow} Gwei
                  </div>
                  <div className="text-sm">~3 minutes</div>
                  <div className="text-sm font-medium">
                    ${calculateTransactionCost(currentNetwork?.gasInfo?.slow || 0, 4250)}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Network Comparison */}
          <div className="text-sm text-muted-foreground pt-2">
            <div className="flex items-center mb-2">
              <Info className="h-4 w-4 mr-1" />
              <span className="font-medium">Network Comparison</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {networksData.map((network) => (
                <TooltipProvider key={network.network}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`p-2 rounded-md border ${
                          selectedNetwork === network.network 
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-card'
                        } cursor-pointer hover:bg-muted`}
                        onClick={() => setSelectedNetwork(network.network)}
                      >
                        <p className="font-medium capitalize">{network.network}</p>
                        {network.isLoading ? (
                          <Skeleton className="h-3 w-16 mt-1" />
                        ) : network.error ? (
                          <span className="text-red-500">Error</span>
                        ) : (
                          <p className="text-muted-foreground">
                            Avg: ${calculateTransactionCost(network.gasInfo?.average || 0, 4250)}
                          </p>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to select {network.network}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          
          <div className="flex items-start mt-2 text-xs bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-amber-800 dark:text-amber-300">
              <p>Gas prices are estimates and may change rapidly. WeParlay automatically selects the most cost-effective network when you place a bet.</p>
              <p className="mt-1">Last updated: {new Date(currentNetwork?.gasInfo?.timestamp || Date.now()).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasFeeEstimator;