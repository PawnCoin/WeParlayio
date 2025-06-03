import fetch from 'node-fetch';

// Top 50 cryptocurrencies for betting
export const SUPPORTED_CRYPTOCURRENCIES = [
  // Major cryptocurrencies
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8, type: 'major' },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18, type: 'major' },
  { symbol: 'USDT', name: 'Tether', decimals: 6, type: 'stablecoin' },
  { symbol: 'BNB', name: 'BNB', decimals: 18, type: 'major' },
  { symbol: 'SOL', name: 'Solana', decimals: 9, type: 'major' },
  { symbol: 'XRP', name: 'XRP', decimals: 6, type: 'major' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, type: 'stablecoin' },
  { symbol: 'ADA', name: 'Cardano', decimals: 6, type: 'major' },
  { symbol: 'AVAX', name: 'Avalanche', decimals: 18, type: 'major' },
  { symbol: 'DOGE', name: 'Dogecoin', decimals: 8, type: 'meme' },
  
  // DeFi and Layer 2
  { symbol: 'MATIC', name: 'Polygon', decimals: 18, type: 'layer2' },
  { symbol: 'DOT', name: 'Polkadot', decimals: 10, type: 'major' },
  { symbol: 'TRX', name: 'TRON', decimals: 6, type: 'major' },
  { symbol: 'LINK', name: 'Chainlink', decimals: 18, type: 'defi' },
  { symbol: 'UNI', name: 'Uniswap', decimals: 18, type: 'defi' },
  { symbol: 'LTC', name: 'Litecoin', decimals: 8, type: 'major' },
  { symbol: 'ATOM', name: 'Cosmos', decimals: 6, type: 'major' },
  { symbol: 'XLM', name: 'Stellar', decimals: 7, type: 'major' },
  { symbol: 'BCH', name: 'Bitcoin Cash', decimals: 8, type: 'major' },
  { symbol: 'VET', name: 'VeChain', decimals: 18, type: 'utility' },
  
  // Popular altcoins
  { symbol: 'ALGO', name: 'Algorand', decimals: 6, type: 'major' },
  { symbol: 'ICP', name: 'Internet Computer', decimals: 8, type: 'major' },
  { symbol: 'FIL', name: 'Filecoin', decimals: 18, type: 'utility' },
  { symbol: 'HBAR', name: 'Hedera', decimals: 8, type: 'utility' },
  { symbol: 'APT', name: 'Aptos', decimals: 8, type: 'layer1' },
  { symbol: 'NEAR', name: 'NEAR Protocol', decimals: 24, type: 'layer1' },
  { symbol: 'QNT', name: 'Quant', decimals: 18, type: 'utility' },
  { symbol: 'GRT', name: 'The Graph', decimals: 18, type: 'defi' },
  { symbol: 'AAVE', name: 'Aave', decimals: 18, type: 'defi' },
  { symbol: 'CRV', name: 'Curve DAO Token', decimals: 18, type: 'defi' },
  
  // Layer 2 and scaling
  { symbol: 'OP', name: 'Optimism', decimals: 18, type: 'layer2' },
  { symbol: 'ARB', name: 'Arbitrum', decimals: 18, type: 'layer2' },
  { symbol: 'IMX', name: 'Immutable X', decimals: 18, type: 'gaming' },
  { symbol: 'LDO', name: 'Lido DAO', decimals: 18, type: 'defi' },
  { symbol: 'MKR', name: 'Maker', decimals: 18, type: 'defi' },
  { symbol: 'COMP', name: 'Compound', decimals: 18, type: 'defi' },
  { symbol: 'SUSHI', name: 'SushiSwap', decimals: 18, type: 'defi' },
  { symbol: 'YFI', name: 'yearn.finance', decimals: 18, type: 'defi' },
  { symbol: 'SNX', name: 'Synthetix', decimals: 18, type: 'defi' },
  { symbol: 'BAL', name: 'Balancer', decimals: 18, type: 'defi' },
  
  // Gaming and NFT
  { symbol: 'SAND', name: 'The Sandbox', decimals: 18, type: 'gaming' },
  { symbol: 'MANA', name: 'Decentraland', decimals: 18, type: 'gaming' },
  { symbol: 'AXS', name: 'Axie Infinity', decimals: 18, type: 'gaming' },
  { symbol: 'ENJ', name: 'Enjin Coin', decimals: 18, type: 'gaming' },
  { symbol: 'GALA', name: 'Gala', decimals: 8, type: 'gaming' },
  
  // Meme and community
  { symbol: 'SHIB', name: 'Shiba Inu', decimals: 18, type: 'meme' },
  { symbol: 'PEPE', name: 'Pepe', decimals: 18, type: 'meme' },
  { symbol: 'FLOKI', name: 'FLOKI', decimals: 9, type: 'meme' },
  
  // Utility and enterprise
  { symbol: 'XTZ', name: 'Tezos', decimals: 6, type: 'major' },
  { symbol: 'EOS', name: 'EOS', decimals: 4, type: 'major' },
  
  // WeParlay native token (official)
  { symbol: '$Pc', name: 'Pawn Coin', decimals: 18, type: 'native', contract: '0x2Fe269292f74F0a98C5786088317B4f86313C211', official: true }
];

interface CryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: string;
}

interface PawnCoinData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: number;
  circulatingSupply: number;
}

class CryptoService {
  private priceCache: Map<string, CryptoPriceData> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  /**
   * Get Pawn Coin data from official sources
   */
  async getPawnCoinData(): Promise<PawnCoinData | null> {
    try {
      // Try official pawncoinpc.com API first
      const officialResponse = await fetch('https://api.pawncoinpc.com/v1/stats', {
        headers: {
          'User-Agent': 'WeParlay-Platform/1.0',
          'Accept': 'application/json'
        }
      });

      if (officialResponse.ok) {
        const data = await officialResponse.json();
        return {
          price: data.price || 0,
          change24h: data.change24h || 0,
          marketCap: data.marketCap || 0,
          volume24h: data.volume24h || 0,
          totalSupply: data.totalSupply || 0,
          circulatingSupply: data.circulatingSupply || 0
        };
      }

      // Fallback to Etherscan API for contract data
      const etherscanResponse = await fetch(
        `https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=0x2Fe269292f74F0a98C5786088317B4f86313C211&apikey=${process.env.ETHERSCAN_API_KEY}`
      );

      if (etherscanResponse.ok) {
        const ethData = await etherscanResponse.json();
        if (ethData.status === '1' && ethData.result) {
          return {
            price: 0.001, // Default price if not available
            change24h: 0,
            marketCap: 0,
            volume24h: 0,
            totalSupply: parseInt(ethData.result.totalSupply) / Math.pow(10, 18),
            circulatingSupply: parseInt(ethData.result.totalSupply) / Math.pow(10, 18)
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching Pawn Coin data:', error);
      return null;
    }
  }

  /**
   * Get cryptocurrency prices from multiple sources
   */
  async getCryptoPrices(symbols: string[] = []): Promise<CryptoPriceData[]> {
    const targetSymbols = symbols.length > 0 ? symbols : SUPPORTED_CRYPTOCURRENCIES.map(c => c.symbol);
    const results: CryptoPriceData[] = [];

    // Handle Pawn Coin separately
    if (targetSymbols.includes('$Pc')) {
      const pawnCoinData = await this.getPawnCoinData();
      if (pawnCoinData) {
        results.push({
          symbol: '$Pc',
          name: 'Pawn Coin',
          price: pawnCoinData.price,
          change24h: pawnCoinData.change24h,
          marketCap: pawnCoinData.marketCap,
          volume24h: pawnCoinData.volume24h,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    // Get other cryptocurrency prices
    const otherSymbols = targetSymbols.filter(s => s !== '$Pc');
    if (otherSymbols.length > 0) {
      try {
        // Use CoinGecko API for price data
        const symbolsString = otherSymbols.map(s => s.toLowerCase()).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        );

        if (response.ok) {
          const data = await response.json();
          
          Object.entries(data).forEach(([coinId, priceData]: [string, any]) => {
            const crypto = SUPPORTED_CRYPTOCURRENCIES.find(c => 
              c.symbol.toLowerCase() === coinId || c.name.toLowerCase() === coinId
            );
            
            if (crypto) {
              results.push({
                symbol: crypto.symbol,
                name: crypto.name,
                price: priceData.usd || 0,
                change24h: priceData.usd_24h_change || 0,
                marketCap: priceData.usd_market_cap || 0,
                volume24h: priceData.usd_24h_vol || 0,
                lastUpdated: new Date().toISOString()
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    }

    // Cache results
    results.forEach(crypto => {
      this.priceCache.set(crypto.symbol, crypto);
      this.cacheExpiry.set(crypto.symbol, Date.now() + this.CACHE_DURATION);
    });

    return results;
  }

  /**
   * Get cached price or fetch new data
   */
  async getCryptoPrice(symbol: string): Promise<CryptoPriceData | null> {
    // Check cache first
    const cached = this.priceCache.get(symbol);
    const expiry = this.cacheExpiry.get(symbol);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    // Fetch new data
    const prices = await this.getCryptoPrices([symbol]);
    return prices.find(p => p.symbol === symbol) || null;
  }

  /**
   * Convert amount between cryptocurrencies
   */
  async convertCrypto(fromSymbol: string, toSymbol: string, amount: number): Promise<number> {
    if (fromSymbol === toSymbol) return amount;

    const fromPrice = await this.getCryptoPrice(fromSymbol);
    const toPrice = await this.getCryptoPrice(toSymbol);

    if (!fromPrice || !toPrice || toPrice.price === 0) {
      throw new Error(`Unable to convert ${fromSymbol} to ${toSymbol}`);
    }

    const usdValue = amount * fromPrice.price;
    return usdValue / toPrice.price;
  }

  /**
   * Get supported cryptocurrencies with current prices
   */
  async getSupportedCryptocurrencies(): Promise<any[]> {
    const prices = await this.getCryptoPrices();
    
    return SUPPORTED_CRYPTOCURRENCIES.map(crypto => {
      const priceData = prices.find(p => p.symbol === crypto.symbol);
      return {
        ...crypto,
        currentPrice: priceData?.price || 0,
        change24h: priceData?.change24h || 0,
        marketCap: priceData?.marketCap || 0,
        volume24h: priceData?.volume24h || 0,
        lastUpdated: priceData?.lastUpdated || new Date().toISOString()
      };
    });
  }

  /**
   * Validate cryptocurrency address format
   */
  isValidCryptoAddress(address: string, symbol: string): boolean {
    switch (symbol.toUpperCase()) {
      case 'BTC':
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
      case 'ETH':
      case '$PC':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'XRP':
        return /^r[0-9a-zA-Z]{24,34}$/.test(address);
      case 'LTC':
        return /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$|^ltc1[a-z0-9]{39,59}$/.test(address);
      case 'ADA':
        return /^addr1[a-z0-9]{98}$/.test(address);
      case 'SOL':
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      default:
        // For ERC-20 tokens, use Ethereum address format
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
  }

  /**
   * Get minimum bet amounts for each cryptocurrency
   */
  getMinimumBetAmount(symbol: string): number {
    const crypto = SUPPORTED_CRYPTOCURRENCIES.find(c => c.symbol === symbol);
    if (!crypto) return 0;

    // Set minimum bet amounts based on typical values
    switch (crypto.type) {
      case 'major':
        return symbol === 'BTC' ? 0.0001 : symbol === 'ETH' ? 0.001 : 1;
      case 'stablecoin':
        return 1;
      case 'native':
        return 10; // 10 $Pc minimum
      case 'meme':
        return 1000;
      case 'defi':
        return 0.1;
      default:
        return 1;
    }
  }
}

export const cryptoService = new CryptoService();
export default cryptoService;