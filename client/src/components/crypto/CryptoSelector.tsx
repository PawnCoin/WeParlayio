import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Star } from 'lucide-react';

// Top 50 cryptocurrencies including your custom token
const cryptoCurrencies = [
  // Major cryptocurrencies
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', isFavorite: true },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', isFavorite: true },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB', isFavorite: true },
  { id: 'solana', name: 'Solana', symbol: 'SOL', isFavorite: true },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', isFavorite: true },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', isFavorite: true },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', isFavorite: true },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', isFavorite: false },
  { id: 'tron', name: 'TRON', symbol: 'TRX', isFavorite: false },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', isFavorite: false },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', isFavorite: false },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', isFavorite: false },
  { id: 'bitcoincash', name: 'Bitcoin Cash', symbol: 'BCH', isFavorite: false },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', isFavorite: false },
  { id: 'monero', name: 'Monero', symbol: 'XMR', isFavorite: false },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', isFavorite: false },
  { id: 'ethereum-classic', name: 'Ethereum Classic', symbol: 'ETC', isFavorite: false },
  { id: 'filecoin', name: 'Filecoin', symbol: 'FIL', isFavorite: false },
  { id: 'aave', name: 'Aave', symbol: 'AAVE', isFavorite: false },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', isFavorite: false },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', isFavorite: false },
  { id: 'eos', name: 'EOS', symbol: 'EOS', isFavorite: false },
  { id: 'the-graph', name: 'The Graph', symbol: 'GRT', isFavorite: false },
  { id: 'flow', name: 'Flow', symbol: 'FLOW', isFavorite: false },
  { id: 'maker', name: 'Maker', symbol: 'MKR', isFavorite: false },
  { id: 'chiliz', name: 'Chiliz', symbol: 'CHZ', isFavorite: false },
  { id: 'decentraland', name: 'Decentraland', symbol: 'MANA', isFavorite: false },
  { id: 'the-sandbox', name: 'The Sandbox', symbol: 'SAND', isFavorite: false },
  { id: 'axie-infinity', name: 'Axie Infinity', symbol: 'AXS', isFavorite: false },
  { id: 'theta-token', name: 'Theta Network', symbol: 'THETA', isFavorite: false },
  { id: 'fantom', name: 'Fantom', symbol: 'FTM', isFavorite: false },
  { id: 'compound', name: 'Compound', symbol: 'COMP', isFavorite: false },
  { id: 'quant-network', name: 'Quant', symbol: 'QNT', isFavorite: false },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', isFavorite: false },
  { id: 'elrond-erd-2', name: 'MultiversX', symbol: 'EGLD', isFavorite: false },
  { id: 'waves', name: 'Waves', symbol: 'WAVES', isFavorite: false },
  { id: 'kusama', name: 'Kusama', symbol: 'KSM', isFavorite: false },
  { id: 'dash', name: 'Dash', symbol: 'DASH', isFavorite: false },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', isFavorite: false },
  { id: 'neo', name: 'NEO', symbol: 'NEO', isFavorite: false },
  { id: 'iota', name: 'IOTA', symbol: 'MIOTA', isFavorite: false },
  { id: 'synthetix-network-token', name: 'Synthetix', symbol: 'SNX', isFavorite: false },
  { id: 'huobi-token', name: 'Huobi Token', symbol: 'HT', isFavorite: false },
  { id: 'basic-attention-token', name: 'Basic Attention Token', symbol: 'BAT', isFavorite: false },
  { id: 'zilliqa', name: 'Zilliqa', symbol: 'ZIL', isFavorite: false },
  { id: 'bitcoin-gold', name: 'Bitcoin Gold', symbol: 'BTG', isFavorite: false },
  { id: 'harmony', name: 'Harmony', symbol: 'ONE', isFavorite: false },
  { id: 'kava', name: 'Kava', symbol: 'KAVA', isFavorite: false },
  { id: 'ravencoin', name: 'Ravencoin', symbol: 'RVN', isFavorite: false },
  
  // Your custom token - added as a favorite by default
  { 
    id: 'weplaytoken', 
    name: 'WePlay Token', 
    symbol: 'WEPT', 
    isFavorite: true,
    contract: '0x2Fe269292f74F0a98C5786088317B4f86313C211',
    chain: 'ethereum'
  },
];

interface CryptoSelectorProps {
  onSelect: (crypto: typeof cryptoCurrencies[0]) => void;
  selectedCrypto?: typeof cryptoCurrencies[0];
}

const CryptoSelector: React.FC<CryptoSelectorProps> = ({ onSelect, selectedCrypto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCryptos, setShowAllCryptos] = useState(false);
  
  // Filter cryptocurrencies based on search term
  const filteredCryptos = cryptoCurrencies.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Split into favorites and others
  const favoriteCryptos = filteredCryptos.filter(crypto => crypto.isFavorite);
  const otherCryptos = filteredCryptos.filter(crypto => !crypto.isFavorite);
  
  // Display logic
  const displayedCryptos = showAllCryptos ? filteredCryptos : favoriteCryptos;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="crypto-selector">Select Cryptocurrency</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowAllCryptos(!showAllCryptos)}
          className="text-xs h-7 px-2"
        >
          {showAllCryptos ? 'Show Favorites Only' : 'Show All Cryptos'}
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search crypto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select 
        onValueChange={(value) => {
          const selected = cryptoCurrencies.find(crypto => crypto.id === value);
          if (selected) onSelect(selected);
        }}
        defaultValue={selectedCrypto?.id}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a cryptocurrency" />
        </SelectTrigger>
        <SelectContent>
          {displayedCryptos.length > 0 ? (
            <>
              {favoriteCryptos.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Favorites</SelectLabel>
                  {favoriteCryptos.map(crypto => (
                    <SelectItem key={crypto.id} value={crypto.id} className="flex items-center">
                      <div className="flex items-center">
                        {crypto.isFavorite && <Star className="h-3 w-3 mr-2 text-yellow-500" />}
                        <span className="font-medium">{crypto.symbol}</span>
                        <span className="ml-2 text-gray-500">{crypto.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              
              {showAllCryptos && otherCryptos.length > 0 && (
                <SelectGroup>
                  <SelectLabel>All Cryptocurrencies</SelectLabel>
                  {otherCryptos.map(crypto => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      <span className="font-medium">{crypto.symbol}</span>
                      <span className="ml-2 text-gray-500">{crypto.name}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </>
          ) : (
            <div className="p-2 text-center text-sm text-gray-500">
              No cryptocurrencies found
            </div>
          )}
        </SelectContent>
      </Select>
      
      {selectedCrypto && selectedCrypto.contract && (
        <div className="mt-2 rounded-md bg-gray-50 dark:bg-gray-800 p-2 text-xs">
          <p className="text-gray-500 font-medium">Contract Address:</p>
          <p className="font-mono break-all">{selectedCrypto.contract}</p>
          <p className="text-gray-500 mt-1">Chain: {selectedCrypto.chain}</p>
        </div>
      )}
    </div>
  );
};

export default CryptoSelector;