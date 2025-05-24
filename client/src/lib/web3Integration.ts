import { ethers } from 'ethers';

// Supported networks (all free to connect to)
export const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com'], // Free public RPC
    blockExplorerUrls: ['https://etherscan.io']
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'], // Free public RPC
    blockExplorerUrls: ['https://polygonscan.com']
  },
  bsc: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org'], // Free public RPC
    blockExplorerUrls: ['https://bscscan.com']
  }
};

// Token contracts (popular stablecoins and tokens)
export const TOKEN_CONTRACTS = {
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86a33E6441c22ac8F0dd9ED8AB7a4E6e53f3f',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
  }
};

export class Web3WalletManager {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(): Promise<{ address: string; network: string; balance: string }> {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Get wallet info
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);
      
      return {
        address,
        network: network.name,
        balance: ethers.formatEther(balance)
      };
    } catch (error: any) {
      throw new Error(`Wallet connection failed: ${error.message}`);
    }
  }

  async getBalance(address: string, tokenContract?: string): Promise<string> {
    if (!this.provider) throw new Error('Wallet not connected');

    try {
      if (tokenContract) {
        // ERC-20 token balance
        const contract = new ethers.Contract(
          tokenContract,
          ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
          this.provider
        );
        
        const balance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        return ethers.formatUnits(balance, decimals);
      } else {
        // Native token balance
        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
      }
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async sendTransaction(to: string, amount: string, tokenContract?: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');

    try {
      let tx;
      
      if (tokenContract) {
        // ERC-20 token transfer
        const contract = new ethers.Contract(
          tokenContract,
          [
            'function transfer(address to, uint256 amount) returns (bool)',
            'function decimals() view returns (uint8)'
          ],
          this.signer
        );
        
        const decimals = await contract.decimals();
        const amountInWei = ethers.parseUnits(amount, decimals);
        tx = await contract.transfer(to, amountInWei);
      } else {
        // Native token transfer
        const amountInWei = ethers.parseEther(amount);
        tx = await this.signer.sendTransaction({
          to,
          value: amountInWei
        });
      }

      return tx.hash;
    } catch (error: any) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  async waitForTransaction(txHash: string): Promise<boolean> {
    if (!this.provider) throw new Error('Provider not available');

    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      return receipt?.status === 1;
    } catch (error: any) {
      throw new Error(`Transaction confirmation failed: ${error.message}`);
    }
  }

  async switchNetwork(networkKey: keyof typeof SUPPORTED_NETWORKS): Promise<void> {
    if (!window.ethereum) throw new Error('Wallet not available');

    const network = SUPPORTED_NETWORKS[networkKey];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }]
      });
    } catch (error: any) {
      // Network not added to wallet, try to add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network]
        });
      } else {
        throw error;
      }
    }
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }
}

// Global Web3 manager instance
export const web3Manager = new Web3WalletManager();

// Helper functions for common operations
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const validateAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const formatTokenAmount = (amount: string, decimals: number = 18): string => {
  const num = parseFloat(amount);
  if (num === 0) return '0';
  if (num < 0.001) return '< 0.001';
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
  return `${(num / 1000000).toFixed(2)}M`;
};

// Declare global ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}