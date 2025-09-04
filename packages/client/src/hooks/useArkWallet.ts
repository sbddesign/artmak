import { useEffect, useState, useCallback } from 'react';
import { SingleKey, Wallet } from '@arkade-os/sdk';

interface WalletData {
  address: string;
  boardingAddress: string;
  publicKey: string;
  privateKey: string;
  mnemonic?: string;
  walletInstance?: any; // Store the actual wallet instance
}

interface ArkWalletState {
  wallet: WalletData | null;
  isLoaded: boolean;
  isCreating: boolean;
  error: string | null;
}

const WALLET_STORAGE_KEY = 'artmak-ark-wallet';

// Generate a random private key for testing
const generateRandomPrivateKey = (): string => {
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
      // Generate a random private key for testing
      const privateKeyHex = generateRandomPrivateKey();
      
      // Create identity from private key
      const identity = SingleKey.fromHex(privateKeyHex);
      
      // Create wallet instance using Mutinynet
      const walletInstance = await Wallet.create({
        identity,
        arkServerUrl: 'https://mutinynet.arkade.sh',
      });
      
      // Get addresses from the wallet
      const address = await walletInstance.getAddress();
      const boardingAddress = await walletInstance.getBoardingAddress();
      
      const walletData: WalletData = {
        address: address,
        boardingAddress: boardingAddress,
        publicKey: identity.xOnlyPublicKey().toString(),
        privateKey: privateKeyHex,
        mnemonic: 'Generated for Mutinynet testing',
        walletInstance: walletInstance
      };

      // Save to localStorage (excluding walletInstance which contains BigInt values)
      const serializableData = {
        address: walletData.address,
        boardingAddress: walletData.boardingAddress,
        publicKey: walletData.publicKey,
        privateKey: walletData.privateKey,
        mnemonic: walletData.mnemonic
      };
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(serializableData));
      
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
  const loadWallet = useCallback(async () => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const storedData = JSON.parse(stored);
        
        // Recreate the wallet instance from stored private key
        if (storedData.privateKey) {
          const identity = SingleKey.fromHex(storedData.privateKey);
          const walletInstance = await Wallet.create({
            identity,
            arkServerUrl: 'https://mutinynet.arkade.sh',
          });
          
          // Create complete wallet data with fresh instance
          const walletData: WalletData = {
            address: storedData.address,
            boardingAddress: storedData.boardingAddress,
            publicKey: storedData.publicKey,
            privateKey: storedData.privateKey,
            mnemonic: storedData.mnemonic,
            walletInstance: walletInstance
          };
          
          setState(prev => ({
            ...prev,
            wallet: walletData,
            isLoaded: true
          }));

          console.log('🟡 Wallet detected:', {
            address: walletData.address,
            boardingAddress: walletData.boardingAddress,
            network: 'Mutinynet'
          });

          return walletData;
        }
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
    const initializeWallet = async () => {
      const existingWallet = await loadWallet();
      if (!existingWallet) {
        // No existing wallet found, create a new one
        generateWallet().catch(console.error);
      }
    };
    
    initializeWallet();
  }, [loadWallet, generateWallet]);

  return {
    ...state,
    generateWallet,
    loadWallet,
    clearWallet
  };
};
