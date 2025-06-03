// Wallet connectors for blockchain integration
// Note: Using simplified approach to avoid compatibility issues

// Ethereum chain IDs
const ETHEREUM_CHAIN_IDS = [1, 3, 4, 5, 42, 56, 137, 43114]; // Mainnet, testnets, BSC, Polygon, Avalanche

// Create injected connector for MetaMask and other Ethereum wallets
export const injectedConnector = new InjectedConnector({
  supportedChainIds: ETHEREUM_CHAIN_IDS,
});

// Wallet connection interfaces
export interface WalletInfo {
  address: string;
  chainId?: number;
  balance: string;
  networkName: string;
}

// Networks mapped by chain ID
export const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  3: 'Ropsten Testnet',
  4: 'Rinkeby Testnet',
  5: 'Goerli Testnet',
  42: 'Kovan Testnet',
  56: 'Binance Smart Chain',
  137: 'Polygon Mainnet',
  43114: 'Avalanche C-Chain',
  250: 'Fantom Opera',
  42161: 'Arbitrum One',
  10: 'Optimism',
  100: 'xDai Chain',
};

// Connect to MetaMask or other injected providers
export async function connectEthereumWallet(): Promise<WalletInfo> {
  try {
    // Request accounts access
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet detected. Please install MetaMask or another wallet extension.');
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please check your wallet and try again.');
    }
    
    // Get account details
    const address = accounts[0];
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16);
    
    // Get balance
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
    
    return {
      address,
      chainId,
      balance: balanceEth,
      networkName: NETWORK_NAMES[chainId] || `Chain ID: ${chainId}`
    };
  } catch (error) {
    console.error('Error connecting Ethereum wallet:', error);
    throw error;
  }
}

// Connect to Phantom wallet for Solana
export async function connectPhantomWallet(): Promise<WalletInfo> {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not detected. Please install Phantom extension.');
    }
    
    // Connect to wallet
    const { publicKey } = await window.solana.connect();
    
    if (!publicKey) {
      throw new Error('Failed to retrieve public key from Phantom wallet.');
    }
    
    const address = publicKey.toString();
    
    // Create connection to Solana network
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    
    // Get balance
    const balance = await connection.getBalance(new PublicKey(address));
    const solBalance = (balance / 1e9).toFixed(4);
    
    return {
      address,
      balance: solBalance,
      networkName: 'Solana Mainnet'
    };
  } catch (error) {
    console.error('Error connecting Phantom wallet:', error);
    throw error;
  }
}

// Add type definitions for window objects
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
      request: (args: any) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
    };
  }
}