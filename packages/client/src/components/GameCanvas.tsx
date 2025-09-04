import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useArkWallet } from '../hooks/useArkWallet';
import Blob from './Blob';
import WalletInfo from './WalletInfo';
import { BalanceDisplay } from './BalanceDisplay';
import { PaymentModal } from './PaymentModal';
import { Player } from '../types/game';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { gameState, connected, moveTo, registerArkAddress, sendPaymentRequest } = useSocket();
  const { balance, isCheckingBalance, isBoarding, boardFunds, wallet, sendPayment } = useArkWallet();
  
  // Payment modal state
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    targetPlayer: Player | null;
    isSending: boolean;
  }>({
    isOpen: false,
    targetPlayer: null,
    isSending: false
  });

  // Register Ark address when wallet is available
  useEffect(() => {
    if (wallet?.address && connected) {
      registerArkAddress(wallet.address);
    }
  }, [wallet?.address, connected, registerArkAddress]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !connected) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    moveTo(x, y);
  }, [connected, moveTo]);

  // Fallback for when touch events don't work properly (like in browser emulation)
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !connected) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    moveTo(x, y);
  }, [connected, moveTo]);

  const handleCanvasTouch = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !connected) return;

    const rect = canvasRef.current.getBoundingClientRect();
    
    // Check if touches exist and has at least one touch
    if (!event.touches || event.touches.length === 0) {
      return; // Silently return instead of logging warning
    }
    
    const touch = event.touches[0];
    
    // Additional safety check for touch properties
    if (typeof touch.clientX === 'undefined' || typeof touch.clientY === 'undefined') {
      return; // Silently return instead of logging warning
    }
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    moveTo(x, y);
  }, [connected, moveTo]);

  const handleBlobClick = useCallback((player: Player) => {
    console.log('🎯 Blob clicked:', player);
    setPaymentModal({
      isOpen: true,
      targetPlayer: player,
      isSending: false
    });
  }, []);

  const handleSendPayment = useCallback(async (amount: number, message?: string) => {
    if (!paymentModal.targetPlayer || !paymentModal.targetPlayer.arkAddress) {
      console.error('❌ No target player or Ark address available');
      return;
    }

    setPaymentModal(prev => ({ ...prev, isSending: true }));

    try {
      console.log('🚀 Executing Ark payment:', {
        to: paymentModal.targetPlayer.arkAddress,
        amount,
        message
      });

      // Execute the actual Ark payment
      const paymentResult = await sendPayment(
        paymentModal.targetPlayer.arkAddress,
        amount,
        message
      );

      console.log('✅ Ark payment completed:', paymentResult);

      // Also send payment notification through socket (for game coordination)
      sendPaymentRequest(paymentModal.targetPlayer.id, amount, message);
      
      // Close modal after successful payment
      setTimeout(() => {
        setPaymentModal({
          isOpen: false,
          targetPlayer: null,
          isSending: false
        });
      }, 2000);

    } catch (error) {
      console.error('❌ Ark payment failed:', error);
      setPaymentModal(prev => ({ ...prev, isSending: false }));
      
      // Show error to user (you could add a toast notification here)
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [paymentModal.targetPlayer, sendPayment, sendPaymentRequest]);

  const handleClosePaymentModal = useCallback(() => {
    setPaymentModal({
      isOpen: false,
      targetPlayer: null,
      isSending: false
    });
  }, []);

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onTouchEnd={handleCanvasTouch}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#87CEEB',
        background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
        cursor: 'crosshair',
        overflow: 'hidden',
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* Connection status */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '10px 15px',
        backgroundColor: connected ? '#4CAF50' : '#f44336',
        color: 'white',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Wallet Info */}
      <WalletInfo />

      {/* Player count */}
      <div style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        padding: '10px 15px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}>
        Players: {gameState.players.length}
      </div>

      {/* Balance Display */}
      <BalanceDisplay 
        balance={balance} 
        isCheckingBalance={isCheckingBalance} 
        isBoarding={isBoarding}
        onBoardFunds={boardFunds}
      />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        textAlign: 'center'
      }}>
        {connected ? 'Click or tap anywhere to move your blob!' : 'Connecting to server...'}
      </div>

      {/* Render all players */}
      {gameState.players.map((player) => (
        <Blob
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === gameState.currentPlayer?.id}
          onBlobClick={handleBlobClick}
        />
      ))}

      {/* Payment Modal */}
      <PaymentModal
        targetPlayer={paymentModal.targetPlayer}
        isOpen={paymentModal.isOpen}
        onClose={handleClosePaymentModal}
        onSendPayment={handleSendPayment}
        isSending={paymentModal.isSending}
      />
    </div>
  );
};

export default GameCanvas;
