import { useEffect, useState, useCallback } from 'react';
import { SingleKey, Wallet, Ramps } from '@arkade-os/sdk';

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
  boarding: number;
  confirmed: number;
  total: number;
  unconfirmed: number;
  preconfirmed: number;
  recoverable: number;
  settled: number;
  currency: string;
}

interface ArkWalletState {
  wallet: WalletData | null;
  balance: BalanceData | null;
  isLoaded: boolean;
  isCreating: boolean;
  isCheckingBalance: boolean;
  isBoarding: boolean;
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
    isBoarding: false,
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
      
      // Log the entire balance response (only on first load or significant changes)
      if (!state.balance || state.balance.available !== (balanceResponse.available || 0)) {
        console.log('💰 Balance Response:', balanceResponse);
      }
      
      // Parse the balance data (adjust based on actual SDK response structure)
      const balanceData: BalanceData = {
        available: balanceResponse.available || 0,
        boarding: balanceResponse.boarding?.confirmed || 0,
        confirmed: balanceResponse.boarding?.confirmed || 0,
        total: balanceResponse.total || 0,
        unconfirmed: balanceResponse.boarding?.unconfirmed || 0,
        preconfirmed: balanceResponse.preconfirmed || 0,
        recoverable: balanceResponse.recoverable || 0,
        settled: balanceResponse.settled || 0,
        currency: balanceResponse.currency || 'sats'
      };

      setState(prev => ({
        ...prev,
        balance: balanceData,
        isCheckingBalance: false
      }));

      // Only log balance updates when there are significant changes
      if (!state.balance || state.balance.available !== balanceData.available) {
        console.log('✅ Balance updated:', balanceData);
      }
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

  // Send payment to another Ark address
  const sendPayment = useCallback(async (toAddress: string, amount: number, message?: string) => {
    if (!state.wallet?.walletInstance) {
      console.log('⚠️ No wallet instance available for payment');
      return null;
    }

    try {
      console.log('💸 Sending payment:', { toAddress, amount, message });
      
      // Send payment using the Arkade SDK
      const paymentResult = await state.wallet.walletInstance.sendBitcoin({
        address: toAddress,
        amount: amount,
        memo: message || 'Payment from Artmak game'
      });
      
      console.log('✅ Payment sent successfully:', paymentResult);
      
      // Immediately update local balance (optimistic update)
      setState(prev => {
        if (prev.balance?.available !== undefined) {
          return {
            ...prev,
            balance: {
              ...prev.balance,
              available: Math.max(0, prev.balance.available - amount)
            }
          };
        }
        return prev;
      });
      
      // Also refresh balance from network after a short delay (in case of discrepancies)
      setTimeout(async () => {
        await checkBalance();
      }, 2000);
      
      return paymentResult;
    } catch (error) {
      console.error('❌ Payment failed:', error);
      throw error;
    }
  }, [state.wallet, checkBalance]);

  // Board funds to make them available
  const boardFunds = useCallback(async () => {
    if (!state.wallet?.walletInstance) {
      console.log('⚠️ No wallet instance available for boarding');
      return null;
    }

    setState(prev => ({ ...prev, isBoarding: true, error: null }));

    try {
      // First, check for boarding UTXOs
      console.log('🔍 Checking for boarding UTXOs...');
      const boardingUtxos = await state.wallet.walletInstance.getBoardingUtxos();
      console.log('🚢 Boarding UTXOs:', boardingUtxos);
      
      if (!boardingUtxos || boardingUtxos.length === 0) {
        console.log('⚠️ No UTXOs available for boarding');
        setState(prev => ({
          ...prev,
          isBoarding: false,
          error: 'No UTXOs available for boarding'
        }));
        return null;
      }

      // Create Ramps instance and onboard funds
      console.log('🚢 Creating Ramps instance...');
      const ramps = new Ramps(state.wallet.walletInstance);
      
      console.log('🚢 Initiating onboard process...');
      const onboardTxid = await ramps.onboard();
      
      // Log the entire boarding response
      console.log('🚢 Onboard Transaction ID:', onboardTxid);
      
      // Refresh balance after boarding
      console.log('🔄 Refreshing balance after boarding...');
      await checkBalance();
      
      setState(prev => ({
        ...prev,
        isBoarding: false
      }));

      console.log('✅ Funds boarded successfully! Transaction ID:', onboardTxid);
      return onboardTxid;
    } catch (error) {
      console.error('❌ Boarding failed:', error);
      setState(prev => ({
        ...prev,
        isBoarding: false,
        error: `Failed to board funds: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      return null;
    }
  }, [state.wallet, checkBalance]);

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
    checkBalance,
    boardFunds,
    sendPayment
  };
};
