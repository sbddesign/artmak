import { useEffect, useState, useCallback } from 'react';

interface WalletData {
  address: string;
  boardingAddress: string;
  publicKey: string;
  privateKey: string;
  mnemonic?: string;
}

interface ArkWalletState {
  wallet: WalletData | null;
  isLoaded: boolean;
  isCreating: boolean;
  error: string | null;
}

const WALLET_STORAGE_KEY = 'artmak-ark-wallet';

// Simple address generation for demo purposes
const generateRandomAddress = (): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = 'ark1';
  for (let i = 0; i < 50; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomKey = (): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useArkWallet = () => {
  const [state, setState] = useState<ArkWalletState>({
    wallet: null,
    isLoaded: false,
    isCreating: false,
    error: null
  });

  // Generate a new wallet
  const generateWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));

    try {
      // Generate a new wallet (simplified for demo)
      // In a real implementation, you would use the Arkade SDK properly
      const address = generateRandomAddress();
      const boardingAddress = generateRandomAddress();
      const publicKey = generateRandomKey();
      const privateKey = generateRandomKey();
      const mnemonic = 'demo mnemonic phrase for ark wallet integration';
      
      const walletData: WalletData = {
        address: address,
        boardingAddress: boardingAddress,
        publicKey: publicKey,
        privateKey: privateKey,
        mnemonic: mnemonic
      };

      // Save to localStorage
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      
      setState(prev => ({
        ...prev,
        wallet: walletData,
        isCreating: false,
        isLoaded: true
      }));

      console.log('🟢 Wallet created:', {
        address: walletData.address,
        boardingAddress: walletData.boardingAddress
      });

      return walletData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: errorMessage
      }));
      
      console.error('❌ Wallet creation failed:', error);
      throw error;
    }
  }, []);

  // Load wallet from localStorage
  const loadWallet = useCallback(() => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const walletData: WalletData = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          wallet: walletData,
          isLoaded: true
        }));

        console.log('🟡 Wallet detected:', {
          address: walletData.address,
          boardingAddress: walletData.boardingAddress
        });

        return walletData;
      }
    } catch (error) {
      console.error('❌ Failed to load wallet from storage:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load wallet from storage'
      }));
    }
    return null;
  }, []);

  // Clear wallet from localStorage
  const clearWallet = useCallback(() => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setState(prev => ({
      ...prev,
      wallet: null,
      isLoaded: true
    }));
    console.log('🗑️ Wallet cleared');
  }, []);

  // Initialize wallet on mount
  useEffect(() => {
    const existingWallet = loadWallet();
    if (!existingWallet) {
      // No existing wallet found, create a new one
      generateWallet().catch(console.error);
    }
  }, [loadWallet, generateWallet]);

  return {
    ...state,
    generateWallet,
    loadWallet,
    clearWallet
  };
};
