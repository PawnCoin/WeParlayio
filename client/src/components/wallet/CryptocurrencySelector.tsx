import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown, RefreshCw, Info, Star, TrendingUp, TrendingDown } from "lucide-react";

interface CryptocurrencyOption {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  market_cap: number;
  isFavorite?: boolean;
  network?: string[];
}

interface CryptocurrencySelectorProps {
  onSelect: (currency: string) => void;
  selectedCurrency: string;
  showFullList?: boolean;
  variant?: "minimal" | "full";
  showFavorites?: boolean;
}

const CryptocurrencySelector: React.FC<CryptocurrencySelectorProps> = ({
  onSelect,
  selectedCurrency,
  showFullList = false,
  variant = "minimal",
  showFavorites = true,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cryptocurrencies, setCryptocurrencies] = useState<CryptocurrencyOption[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [favoriteCurrencies, setFavoriteCurrencies] = useState<string[]>([]);
  const [showPopover, setShowPopover] = useState<boolean>(false);

  // Popular currencies to show in minimal view
  const popularCurrencies = ["BTC", "ETH", "SOL", "USDT", "USDC", "MATIC", "BNB", "DOT"];
  
  // Prepare mock data for cryptocurrencies
  useEffect(() => {
    const loadCryptocurrencies = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would fetch from a cryptocurrency API
        // For this demo, we're using static mock data
        const mockData: CryptocurrencyOption[] = [
          {
            id: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
            image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
            current_price: 68521,
            price_change_percentage_24h: 2.3,
            circulating_supply: 19000000,
            market_cap: 1302000000000,
            network: ["Bitcoin"]
          },
          {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
            image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
            current_price: 3952,
            price_change_percentage_24h: 1.8,
            circulating_supply: 120000000,
            market_cap: 474000000000,
            network: ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon"]
          },
          {
            id: "tether",
            symbol: "USDT",
            name: "Tether",
            image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
            current_price: 1.00,
            price_change_percentage_24h: 0.01,
            circulating_supply: 83000000000,
            market_cap: 83000000000,
            network: ["Ethereum", "Tron", "Solana", "Polygon"]
          },
          {
            id: "usd-coin",
            symbol: "USDC",
            name: "USD Coin",
            image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
            current_price: 1.00,
            price_change_percentage_24h: -0.02,
            circulating_supply: 45000000000,
            market_cap: 45000000000,
            network: ["Ethereum", "Solana", "Algorand", "Polygon"]
          },
          {
            id: "solana",
            symbol: "SOL",
            name: "Solana",
            image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
            current_price: 146.52,
            price_change_percentage_24h: 4.2,
            circulating_supply: 430000000,
            market_cap: 63000000000,
            network: ["Solana"]
          },
          {
            id: "binancecoin",
            symbol: "BNB",
            name: "Binance Coin",
            image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
            current_price: 592.48,
            price_change_percentage_24h: 0.8,
            circulating_supply: 153000000,
            market_cap: 91000000000,
            network: ["BNB Chain"]
          },
          {
            id: "cardano",
            symbol: "ADA",
            name: "Cardano",
            image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
            current_price: 0.51,
            price_change_percentage_24h: 1.3,
            circulating_supply: 35400000000,
            market_cap: 18000000000,
            network: ["Cardano"]
          },
          {
            id: "polkadot",
            symbol: "DOT",
            name: "Polkadot",
            image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
            current_price: 7.48,
            price_change_percentage_24h: 2.5,
            circulating_supply: 1300000000,
            market_cap: 9700000000,
            network: ["Polkadot"]
          },
          {
            id: "matic-network",
            symbol: "MATIC",
            name: "Polygon",
            image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
            current_price: 0.75,
            price_change_percentage_24h: 1.1,
            circulating_supply: 9200000000,
            market_cap: 6900000000,
            network: ["Polygon"]
          },
          {
            id: "weplay-token",
            symbol: "WEP",
            name: "WePlay Token",
            image: "https://example.com/weplay-token.png", // Placeholder, replace with actual image
            current_price: 0.12,
            price_change_percentage_24h: 5.5,
            circulating_supply: 1000000000,
            market_cap: 120000000,
            network: ["Ethereum"]
          }
        ];
        
        // Load favorites from local storage
        const storedFavorites = localStorage.getItem('favoriteCryptocurrencies');
        const favorites = storedFavorites ? JSON.parse(storedFavorites) : ["BTC", "ETH", "SOL"];
        
        setFavoriteCurrencies(favorites);
        
        // Mark favorites in the cryptocurrency list
        const cryptosWithFavorites = mockData.map(crypto => ({
          ...crypto,
          isFavorite: favorites.includes(crypto.symbol)
        }));
        
        setCryptocurrencies(cryptosWithFavorites);
      } catch (error) {
        console.error("Error loading cryptocurrencies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCryptocurrencies();
  }, []);
  
  // Toggle favorite status
  const toggleFavorite = (symbol: string) => {
    let newFavorites: string[];
    
    if (favoriteCurrencies.includes(symbol)) {
      newFavorites = favoriteCurrencies.filter(curr => curr !== symbol);
    } else {
      newFavorites = [...favoriteCurrencies, symbol];
    }
    
    setFavoriteCurrencies(newFavorites);
    localStorage.setItem('favoriteCryptocurrencies', JSON.stringify(newFavorites));
    
    // Update cryptocurrencies list
    setCryptocurrencies(prevState => 
      prevState.map(crypto => 
        crypto.symbol === symbol 
          ? { ...crypto, isFavorite: !crypto.isFavorite } 
          : crypto
      )
    );
  };
  
  // Filter cryptocurrencies based on search term
  const filteredCurrencies = cryptocurrencies.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Display currencies based on view mode
  const displayCurrencies = showFullList 
    ? filteredCurrencies
    : cryptocurrencies.filter(crypto => popularCurrencies.includes(crypto.symbol));
  
  // Get favorite cryptocurrencies
  const favorites = cryptocurrencies.filter(crypto => favoriteCurrencies.includes(crypto.symbol));

  // Format price changes
  const formatPriceChange = (change: number) => {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  };
  
  // Get currency details
  const getSelectedCurrencyDetails = () => {
    return cryptocurrencies.find(crypto => crypto.symbol === selectedCurrency);
  };
  
  // Minimal selector with just a dropdown
  if (variant === "minimal") {
    return (
      <div className="flex items-center">
        <Select value={selectedCurrency} onValueChange={onSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {showFavorites && favorites.length > 0 && (
              <>
                <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                  Favorites
                </div>
                {favorites.map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.symbol}>
                    <div className="flex items-center">
                      <img 
                        src={crypto.image} 
                        alt={crypto.name} 
                        className="h-5 w-5 mr-2 rounded-full"
                      />
                      <span>{crypto.symbol}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ${crypto.current_price.toLocaleString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <div className="h-px bg-border my-1" />
              </>
            )}
            
            <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              All Currencies
            </div>
            {displayCurrencies.map((crypto) => (
              <SelectItem key={crypto.id} value={crypto.symbol}>
                <div className="flex items-center">
                  <img 
                    src={crypto.image} 
                    alt={crypto.name} 
                    className="h-5 w-5 mr-2 rounded-full"
                  />
                  <span>{crypto.symbol}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ${crypto.current_price.toLocaleString()}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  // Full selector with rich details and search
  return (
    <div>
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={showPopover}
            className="w-full justify-between"
          >
            {selectedCurrency ? (
              <div className="flex items-center">
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full bg-muted animate-pulse mr-2" />
                ) : (
                  <img
                    src={getSelectedCurrencyDetails()?.image}
                    alt={selectedCurrency}
                    className="h-5 w-5 mr-2 rounded-full"
                  />
                )}
                <span>{selectedCurrency}</span>
                {getSelectedCurrencyDetails() && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ${getSelectedCurrencyDetails()?.current_price.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              "Select cryptocurrency"
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select Cryptocurrency</CardTitle>
              <CardDescription>
                Choose a cryptocurrency to use for your transaction
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardHeader>
            <CardContent className="grid gap-1 max-h-[300px] overflow-y-auto">
              {showFavorites && (
                <div className="mb-2">
                  <div className="flex items-center mb-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">Favorites</span>
                  </div>
                  {favorites.length > 0 ? (
                    favorites.map((crypto) => (
                      <div
                        key={crypto.id}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedCurrency === crypto.symbol ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          onSelect(crypto.symbol);
                          setShowPopover(false);
                        }}
                      >
                        <div className="flex items-center">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="h-6 w-6 mr-2 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{crypto.symbol}</div>
                            <div className="text-xs text-muted-foreground">{crypto.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-sm mr-3">${crypto.current_price.toLocaleString()}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(crypto.symbol);
                            }}
                          >
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground py-1 px-2">
                      No favorite cryptocurrencies. Click the star icon to add favorites.
                    </div>
                  )}
                  <div className="h-px bg-border my-2" />
                </div>
              )}

              <div className="mb-1">
                <div className="flex items-center mb-1">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">All Cryptocurrencies</span>
                </div>
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map((crypto) => (
                    <div
                      key={crypto.id}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent ${
                        selectedCurrency === crypto.symbol ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        onSelect(crypto.symbol);
                        setShowPopover(false);
                      }}
                    >
                      <div className="flex items-center">
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="h-6 w-6 mr-2 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{crypto.symbol}</div>
                          <div className="text-xs text-muted-foreground">{crypto.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right">
                          <div className="text-sm">${crypto.current_price.toLocaleString()}</div>
                          <div className={`text-xs ${crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {crypto.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="h-3 w-3 inline mr-0.5" />
                            ) : (
                              <TrendingDown className="h-3 w-3 inline mr-0.5" />
                            )}
                            {formatPriceChange(crypto.price_change_percentage_24h)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(crypto.symbol);
                          }}
                        >
                          <Star className={`h-4 w-4 ${crypto.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3">
                    <div className="text-sm text-muted-foreground">No cryptocurrencies found matching "{searchTerm}"</div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Price data info
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cryptocurrency prices are updated every 60 seconds</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CryptocurrencySelector;