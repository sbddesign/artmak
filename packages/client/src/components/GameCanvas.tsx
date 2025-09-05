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
  
  // Viewport center coordinates for coordinate transformation
  const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 });
  
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

  // Background music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Calculate viewport center for coordinate transformation
  useEffect(() => {
    const updateViewportCenter = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setViewportCenter({
          x: rect.width / 2,
          y: rect.height / 2
        });
      }
    };

    // Initial calculation
    updateViewportCenter();

    // Update on window resize
    window.addEventListener('resize', updateViewportCenter);
    
    return () => {
      window.removeEventListener('resize', updateViewportCenter);
    };
  }, []);

  // Register Ark address when wallet is available
  useEffect(() => {
    if (wallet?.address && connected) {
      registerArkAddress(wallet.address);
    }
  }, [wallet?.address, connected, registerArkAddress]);

  // Report balance changes to server
  useEffect(() => {
    if (balance?.available !== undefined && connected) {
      reportBalance(balance.available);
    }
  }, [balance?.available, connected, reportBalance]);

  // Initialize and play background music
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/artmak-song.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Set volume to 30% so it's not too loud
      
      // Play music when user first interacts with the page
      const playMusic = async () => {
        try {
          await audioRef.current?.play();
          setIsMusicPlaying(true);
        } catch (error) {
          // Music will play when user interacts with the page
        }
      };

      // Try to play immediately
      playMusic();

      // Also try to play on first user interaction
      const handleFirstInteraction = () => {
        playMusic();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };
    }
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // If this was a blob click, ignore canvas movement
    if (isBlobClick) {
      setIsBlobClick(false); // Reset flag
      return;
    }
    
    if (!canvasRef.current || !connected) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const viewportX = event.clientX - rect.left;
    const viewportY = event.clientY - rect.top;
    
    // Transform viewport coordinates to server coordinates
    const serverX = viewportX - viewportCenter.x;
    const serverY = viewportY - viewportCenter.y;

    moveTo(serverX, serverY);
  }, [connected, moveTo, isBlobClick, viewportCenter]);

  // Fallback for when touch events don't work properly (like in browser emulation)
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !connected) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const viewportX = event.clientX - rect.left;
    const viewportY = event.clientY - rect.top;
    
    // Transform viewport coordinates to server coordinates
    const serverX = viewportX - viewportCenter.x;
    const serverY = viewportY - viewportCenter.y;

    moveTo(serverX, serverY);
  }, [connected, moveTo, viewportCenter]);

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
    
    const viewportX = touch.clientX - rect.left;
    const viewportY = touch.clientY - rect.top;
    
    // Transform viewport coordinates to server coordinates
    const serverX = viewportX - viewportCenter.x;
    const serverY = viewportY - viewportCenter.y;

    moveTo(serverX, serverY);
  }, [connected, moveTo, viewportCenter]);

  const handleBlobClick = useCallback(async (player: Player) => {
    // Set flag to prevent canvas movement
    setIsBlobClick(true);
    
    if (!player.arkAddress) {
      return;
    }

    try {
      // Send 1000 sats payment
      await sendPayment(
        player.arkAddress,
        1000,
        'One-click payment from Artmak game'
      );
      
      // Show success toast
      setToast({
        isVisible: true,
        message: 'You shrunk! Go faster!'
      });

      // Also send payment notification through socket (for game coordination)
      sendPaymentRequest(player.id, 1000, 'One-click payment');

    } catch (error) {
      console.error('Payment failed:', error);
      // Could show error toast here if desired
    }
  }, [sendPayment, sendPaymentRequest]);

  const handleCloseToast = useCallback(() => {
    setToast({
      isVisible: false,
      message: ''
    });
  }, []);

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  }, [isMusicPlaying]);

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
          viewportCenter={viewportCenter}
        />
      ))}

      {/* Music control button */}
      <button
        onClick={toggleMusic}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={isMusicPlaying ? 'Mute music' : 'Play music'}
      >
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>

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
