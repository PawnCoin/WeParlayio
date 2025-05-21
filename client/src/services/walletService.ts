import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { InjectedConnector } from '@web3-react/injected-connector';

// Define supported chain IDs for Ethereum networks
const ETHEREUM_CHAIN_IDS = [1, 3, 4, 5, 42]; // Mainnet, Ropsten, Rinkeby, Goerli, Kovan

// Create Ethereum injected connector (MetaMask, etc.)
export const injectedConnector = new InjectedConnector({
  supportedChainIds: ETHEREUM_CHAIN_IDS,
});

// Wallet types
export enum WalletType {
  METAMASK = 'metamask',
  PHANTOM = 'phantom',
  COINBASE = 'coinbase',
  TRUST = 'trust',
}

// Connection status
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

// Wallet connection result
export interface WalletConnectionResult {
  status: ConnectionStatus;
  address?: string;
  error?: string;
  network?: string;
  balance?: string;
  chainId?: number;
}

// Check if MetaMask is available
export const isMetaMaskAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Check if Phantom is available
export const isPhantomAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
    window.solana !== undefined && 
    window.solana.isPhantom === true;
};

// Check if Coinbase Wallet is available
export const isCoinbaseWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
    (window.ethereum?.isCoinbaseWallet === true || window.coinbaseWalletExtension !== undefined);
};

// Check if Trust Wallet is available
export const isTrustWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
    window.ethereum?.isTrust === true;
};

// Connect to MetaMask or other Ethereum wallets
export const connectEthereumWallet = async (walletType: WalletType): Promise<WalletConnectionResult> => {
  try {
    // Check if wallet is available
    if (!isMetaMaskAvailable() && walletType === WalletType.METAMASK) {
      return {
        status: ConnectionStatus.ERROR,
        error: 'MetaMask is not installed. Please install MetaMask extension and try again.'
      };
    }
    
    if (!isCoinbaseWalletAvailable() && walletType === WalletType.COINBASE) {
      return {
        status: ConnectionStatus.ERROR,
        error: 'Coinbase Wallet is not installed. Please install Coinbase Wallet extension and try again.'
      };
    }
    
    if (!isTrustWalletAvailable() && walletType === WalletType.TRUST) {
      return {
        status: ConnectionStatus.ERROR,
        error: 'Trust Wallet is not installed. Please install Trust Wallet extension and try again.'
      };
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      return {
        status: ConnectionStatus.ERROR,
        error: 'No accounts found. Please check your wallet and try again.'
      };
    }
    
    // Get the first account
    const address = accounts[0];
    
    // Get the chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Set up provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get account balance
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    // Get network information
    const network = await provider.getNetwork();
    
    return {
      status: ConnectionStatus.CONNECTED,
      address,
      network: network.name,
      balance: formattedBalance,
      chainId: parseInt(chainId, 16)
    };
  } catch (error) {
    console.error('Error connecting to Ethereum wallet:', error);
    return {
      status: ConnectionStatus.ERROR,
      error: error.message || 'Failed to connect to wallet. Please try again.'
    };
  }
};

// Connect to Phantom (Solana wallet)
export const connectPhantomWallet = async (): Promise<WalletConnectionResult> => {
  try {
    // Check if Phantom is installed
    if (!isPhantomAvailable()) {
      return {
        status: ConnectionStatus.ERROR,
        error: 'Phantom wallet is not installed. Please install Phantom extension and try again.'
      };
    }
    
    // Connect to Phantom
    const response = await window.solana.connect();
    
    // Get the public key
    const publicKey = response.publicKey.toString();
    
    // Set up Solana connection (using mainnet-beta)
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    
    // Get account balance
    const balance = await connection.getBalance(new PublicKey(publicKey));
    const formattedBalance = (balance / 1000000000).toString(); // Convert lamports to SOL
    
    return {
      status: ConnectionStatus.CONNECTED,
      address: publicKey,
      network: 'mainnet-beta',
      balance: formattedBalance
    };
  } catch (error) {
    console.error('Error connecting to Phantom wallet:', error);
    return {
      status: ConnectionStatus.ERROR,
      error: error.message || 'Failed to connect to Phantom wallet. Please try again.'
    };
  }
};

// Connect to wallet based on type
export const connectWallet = async (walletType: WalletType): Promise<WalletConnectionResult> => {
  if (walletType === WalletType.PHANTOM) {
    return connectPhantomWallet();
  } else {
    // For all Ethereum-based wallets (MetaMask, Coinbase, Trust)
    return connectEthereumWallet(walletType);
  }
};

// Disconnect from wallet
export const disconnectWallet = async (walletType: WalletType): Promise<void> => {
  if (walletType === WalletType.PHANTOM && window.solana) {
    await window.solana.disconnect();
  }
  // For Ethereum wallets, disconnection is handled by the wallet itself
  // We don't need to do anything here
};

// Add window type extensions for TypeScript
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    coinbaseWalletExtension?: any;
  }
}