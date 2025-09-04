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

interface BalanceData {
  available: number;
  pending: number;
  total: number;
  currency: string;
}

interface ArkWalletState {
  wallet: WalletData | null;
  balance: BalanceData | null;
  isLoaded: boolean;
  isCreating: boolean;
  isCheckingBalance: boolean;
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
    balance: null,
    isLoaded: false,
    isCreating: false,
    isCheckingBalance: false,
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

  // Check wallet balance
  const checkBalance = useCallback(async () => {
    if (!state.wallet?.walletInstance) {
      console.log('⚠️ No wallet instance available for balance check');
      return null;
    }

    setState(prev => ({ ...prev, isCheckingBalance: true }));

    try {
      // Get balance from the wallet instance
      const balanceResponse = await state.wallet.walletInstance.getBalance();
      
      // Log the entire balance response
      console.log('💰 Balance Response:', balanceResponse);
      
      // Parse the balance data (adjust based on actual SDK response structure)
      const balanceData: BalanceData = {
        available: balanceResponse.available || balanceResponse.balance || 0,
        pending: balanceResponse.pending || 0,
        total: balanceResponse.total || balanceResponse.balance || 0,
        currency: balanceResponse.currency || 'sats'
      };

      setState(prev => ({
        ...prev,
        balance: balanceData,
        isCheckingBalance: false
      }));

      console.log('✅ Balance updated:', balanceData);
      return balanceData;
    } catch (error) {
      console.error('❌ Balance check failed:', error);
      setState(prev => ({
        ...prev,
        isCheckingBalance: false,
        error: 'Failed to check balance'
      }));
      return null;
    }
  }, [state.wallet]);

  // Clear wallet from localStorage
  const clearWallet = useCallback(() => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setState(prev => ({
      ...prev,
      wallet: null,
      balance: null,
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

  // Set up automatic balance checking when wallet is available
  useEffect(() => {
    if (!state.wallet?.walletInstance) return;

    // Check balance immediately
    checkBalance();

    // Set up polling for balance updates every 10 seconds
    const balanceInterval = setInterval(() => {
      checkBalance();
    }, 10000);

    return () => {
      clearInterval(balanceInterval);
    };
  }, [state.wallet, checkBalance]);

  return {
    ...state,
    generateWallet,
    loadWallet,
    clearWallet,
    checkBalance
  };
};
