import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useArkWallet } from '../hooks/useArkWallet';
import Blob from './Blob';
import WalletInfo from './WalletInfo';
import { BalanceDisplay } from './BalanceDisplay';
import { Toast } from './Toast';
import { Player } from '../types/game';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { gameState, connected, moveTo, registerArkAddress, sendPaymentRequest, reportBalance } = useSocket();
  const { balance, isCheckingBalance, isBoarding, boardFunds, wallet, sendPayment } = useArkWallet();
  
  // Toast state
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
  }>({
    isVisible: false,
    message: ''
  });

  // Flag to prevent canvas movement when blob is clicked
  const [isBlobClick, setIsBlobClick] = useState(false);

  // Register Ark address when wallet is available
  useEffect(() => {
    if (wallet?.address && connected) {
      registerArkAddress(wallet.address);
    }
  }, [wallet?.address, connected, registerArkAddress]);

  // Report balance changes to server
  useEffect(() => {
    if (balance?.available !== undefined && connected) {
      console.log('📊 Reporting balance to server:', balance.available);
      reportBalance(balance.available);
    }
  }, [balance?.available, connected, reportBalance]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    console.log('🖱️ Canvas click handler called, isBlobClick:', isBlobClick);
    
    // If this was a blob click, ignore canvas movement
    if (isBlobClick) {
      console.log('🛑 Ignoring canvas click - blob was clicked');
      setIsBlobClick(false); // Reset flag
      return;
    }
    
    if (!canvasRef.current || !connected) {
      console.log('❌ Canvas click ignored - no ref or not connected');
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log('🚀 Moving to:', x, y);
    moveTo(x, y);
  }, [connected, moveTo, isBlobClick]);

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

  const handleBlobClick = useCallback(async (player: Player) => {
    console.log('🎯 Blob clicked:', player);
    
    // Set flag to prevent canvas movement
    setIsBlobClick(true);
    
    if (!player.arkAddress) {
      console.log('❌ Target player has no Ark address');
      return;
    }

    try {
      console.log('🚀 Sending one-click payment to:', player.arkAddress);
      
      // Send 1000 sats payment
      const paymentResult = await sendPayment(
        player.arkAddress,
        1000,
        'One-click payment from Artmak game'
      );

      console.log('✅ Payment successful:', paymentResult);
      
      // Show success toast
      setToast({
        isVisible: true,
        message: 'You shrunk! Go faster!'
      });

      // Also send payment notification through socket (for game coordination)
      sendPaymentRequest(player.id, 1000, 'One-click payment');

    } catch (error) {
      console.error('❌ Payment failed:', error);
      // Could show error toast here if desired
    }
  }, [sendPayment, sendPaymentRequest]);

  const handleCloseToast = useCallback(() => {
    setToast({
      isVisible: false,
      message: ''
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

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
        duration={3000}
      />
    </div>
  );
};

export default GameCanvas;
