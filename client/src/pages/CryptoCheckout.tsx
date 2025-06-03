import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, ArrowRight, CheckCircle, AlertCircle, Copy, Search, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CryptoOption {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  type: string;
  minimumBet: number;
  marketCap?: number;
  volume24h?: number;
  decimals?: number;
}

export default function CryptoCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [supportedCryptos, setSupportedCryptos] = useState<CryptoOption[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [conversionRate, setConversionRate] = useState(0);

  // Get tier info from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const tierName = urlParams.get('tier') || 'Bronze';
  const tierPrice = parseFloat(urlParams.get('price') || '9.99');

  useEffect(() => {
    loadSupportedCryptocurrencies();
  }, []);

  useEffect(() => {
    if (selectedCrypto && amount) {
      calculateConversion();
    }
  }, [selectedCrypto, amount]);

  const loadSupportedCryptocurrencies = async () => {
    try {
      const response = await apiRequest('GET', '/api/crypto/supported');
      setSupportedCryptos(response.cryptocurrencies);
      
      // Auto-select Pawn Coin if available
      const pawnCoin = response.cryptocurrencies.find((c: CryptoOption) => c.symbol === '$Pc');
      if (pawnCoin) {
        setSelectedCrypto(pawnCoin);
        setAmount((tierPrice / pawnCoin.currentPrice).toFixed(2));
      }
    } catch (error) {
      console.error('Error loading cryptocurrencies:', error);
      toast({
        title: "Error",
        description: "Failed to load supported cryptocurrencies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateConversion = async () => {
    if (!selectedCrypto) return;
    
    try {
      const response = await apiRequest('POST', '/api/crypto/convert', {
        fromSymbol: 'USD',
        toSymbol: selectedCrypto.symbol,
        amount: tierPrice
      });
      setConversionRate(response.toAmount);
    } catch (error) {
      console.error('Error calculating conversion:', error);
    }
  };

  const filteredCryptos = supportedCryptos.filter(crypto => {
    const matchesSearch = crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || crypto.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleCryptoSelect = (cryptoSymbol: string) => {
    const crypto = supportedCryptos.find(c => c.symbol === cryptoSymbol);
    if (crypto) {
      setSelectedCrypto(crypto);
      if (crypto.currentPrice > 0) {
        const calculatedAmount = tierPrice / crypto.currentPrice;
        setAmount(calculatedAmount.toFixed(crypto.decimals || 8));
      }
    }
  };

  const generatePaymentAddress = () => {
    if (!selectedCrypto) return;
    
    // Generate mock address based on crypto type
    let address = '';
    switch (selectedCrypto.symbol) {
      case 'BTC':
        address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
        break;
      case '$Pc':
      case 'ETH':
        address = '0x742D35Cc9d6C5C9c90000000000000000089AB';
        break;
      case 'XRP':
        address = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH';
        break;
      case 'LTC':
        address = 'LM2WMpR1Rp6j3Sa59cMXMs1SPzj9eXpGc1';
        break;
      default:
        address = '0x742D35Cc9d6C5C9c90000000000000000089AB';
    }
    setPaymentAddress(address);
  };

  const handlePayment = async () => {
    if (!selectedCrypto || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select a cryptocurrency and enter an amount",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Generate payment address
      generatePaymentAddress();
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Store completion details
      localStorage.setItem('upgradeCompletedTier', tierName);
      localStorage.setItem('upgradePaymentMethod', 'crypto');
      
      toast({
        title: "Payment Initiated",
        description: `Please send ${amount} ${selectedCrypto.symbol} to complete your ${tierName} tier upgrade`,
      });
      
      // Redirect to success page
      setTimeout(() => {
        setLocation(`/tier-upgrade-success?tier=${tierName}&payment_method=crypto`);
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your crypto payment",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const getCryptoIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT': '₮',
      'BNB': 'BNB',
      '$Pc': '$Pc',
      'SOL': 'SOL',
      'XRP': 'XRP',
      'ADA': 'ADA',
      'DOGE': 'Ð',
      'MATIC': 'MATIC',
      'DOT': '●',
      'LINK': 'LINK',
      'UNI': '🦄',
      'LTC': 'Ł',
      'ATOM': 'ATOM'
    };
    return icons[symbol] || symbol;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'major': 'bg-blue-100 text-blue-800',
      'native': 'bg-orange-100 text-orange-800',
      'stablecoin': 'bg-green-100 text-green-800',
      'defi': 'bg-purple-100 text-purple-800',
      'layer2': 'bg-indigo-100 text-indigo-800',
      'meme': 'bg-pink-100 text-pink-800',
      'gaming': 'bg-yellow-100 text-yellow-800',
      'utility': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cryptocurrency options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crypto Payment
          </h1>
          <p className="text-xl text-gray-600">
            Complete your <span className="font-semibold text-orange-600">{tierName}</span> tier upgrade with cryptocurrency
          </p>
          <div className="mt-4">
            <Badge className="bg-orange-100 text-orange-800 text-lg px-4 py-2">
              ${tierPrice} USD
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cryptocurrency Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Select Cryptocurrency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search cryptocurrencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="native">Native ($Pc)</SelectItem>
                    <SelectItem value="stablecoin">Stablecoin</SelectItem>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="layer2">Layer 2</SelectItem>
                    <SelectItem value="meme">Meme</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Crypto List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredCryptos.map((crypto) => (
                  <div
                    key={crypto.symbol}
                    onClick={() => handleCryptoSelect(crypto.symbol)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedCrypto?.symbol === crypto.symbol
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {getCryptoIcon(crypto.symbol)}
                        </div>
                        <div>
                          <div className="font-medium">{crypto.name}</div>
                          <div className="text-sm text-gray-500">{crypto.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${crypto.currentPrice.toLocaleString()}</div>
                        <div className={`text-sm flex items-center ${
                          crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {crypto.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {crypto.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className={getTypeColor(crypto.type)}>
                        {crypto.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Min: {crypto.minimumBet} {crypto.symbol}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedCrypto ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {getCryptoIcon(selectedCrypto.symbol)}
                      </div>
                      <div>
                        <div className="font-semibold">{selectedCrypto.name}</div>
                        <div className="text-sm text-gray-600">{selectedCrypto.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Price:</span>
                        <span className="font-medium">${selectedCrypto.currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tier Price:</span>
                        <span className="font-medium">${tierPrice}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Amount to Pay:</span>
                        <span>{(tierPrice / selectedCrypto.currentPrice).toFixed(selectedCrypto.decimals || 8)} {selectedCrypto.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      value={(tierPrice / selectedCrypto.currentPrice).toFixed(selectedCrypto.decimals || 8)}
                      readOnly
                      className="text-lg font-medium"
                    />
                  </div>

                  {paymentAddress && (
                    <div className="space-y-2">
                      <Label>Payment Address</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={paymentAddress}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(paymentAddress)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Pay with {selectedCrypto.symbol}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Please select a cryptocurrency to continue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Special Pawn Coin Notice */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                $Pc
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Pawn Coin ($Pc) - Our Native Token</h3>
                <p className="text-orange-800 mb-3">
                  Pay with Pawn Coin ($Pc) and enjoy exclusive benefits including reduced fees, priority support, and bonus features.
                </p>
                <div className="text-sm text-orange-700">
                  <div>Contract: 0x2Fe269292f74F0a98C5786088317B4f86313C211</div>
                  <div>Official Site: pawncoinpc.com</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/upgrade-tier')}
          >
            ← Back to Tier Selection
          </Button>
        </div>
      </div>
    </div>
  );
}