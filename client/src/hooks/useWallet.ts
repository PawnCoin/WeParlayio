import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
  chainId?: number;
  walletType?: string;
}

interface UseWalletReturn {
  isConnected: boolean;
  address?: string;
  balance?: string;
  chainId?: number;
  walletType?: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  addToken: (tokenAddress: string, symbol: string, decimals: number) => Promise<void>;
}

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export function useWallet(): UseWalletReturn {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
  });

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "Wallet Not Found",
          description: "Please install MetaMask or another Web3 wallet",
          variant: "destructive",
        });
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        });

        setWalletState({
          isConnected: true,
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          balance: (parseInt(balance, 16) / 1e18).toFixed(4),
          walletType: 'MetaMask',
        });

        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      if (!window.ethereum) return;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      setWalletState(prev => ({
        ...prev,
        chainId,
      }));

      toast({
        title: "Network Switched",
        description: `Switched to chain ID ${chainId}`,
      });
    } catch (error: any) {
      console.error('Network switch error:', error);
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addToken = useCallback(async (tokenAddress: string, symbol: string, decimals: number) => {
    try {
      if (!window.ethereum) return;

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: symbol,
            decimals: decimals,
            image: 'https://weparlay.io/assets/pawn-coin-logo.png',
          },
        },
      });

      if (wasAdded) {
        toast({
          title: "Token Added",
          description: `${symbol} has been added to your wallet`,
        });
      }
    } catch (error: any) {
      console.error('Add token error:', error);
      toast({
        title: "Add Token Failed",
        description: error.message || "Failed to add token",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Listen for account and network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWalletState(prev => ({
          ...prev,
          address: accounts[0],
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  // Check if already connected on mount
  // Removed automatic connection check - only connect when user explicitly requests

  return {
    isConnected: walletState.isConnected,
    address: walletState.address,
    balance: walletState.balance,
    chainId: walletState.chainId,
    walletType: walletState.walletType,
    connect,
    disconnect,
    switchNetwork,
    addToken,
  };
}