import React, { useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import Blob from './Blob';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { gameState, connected, moveTo } = useSocket();

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

    event.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Check if touches exist and has at least one touch
    if (!event.touches || event.touches.length === 0) {
      console.warn('No touch data available');
      return;
    }
    
    const touch = event.touches[0];
    
    // Additional safety check for touch properties
    if (typeof touch.clientX === 'undefined' || typeof touch.clientY === 'undefined') {
      console.warn('Touch coordinates not available');
      return;
    }
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    moveTo(x, y);
  }, [connected, moveTo]);

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onTouchStart={handleCanvasTouch}
      onTouchEnd={handleCanvasTouch}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#87CEEB',
        background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
        cursor: 'crosshair',
        overflow: 'hidden',
        touchAction: 'none'
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

      {/* Player count */}
      <div style={{
        position: 'absolute',
        top: '20px',
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

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 25px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '25px',
        fontSize: '16px',
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
        />
      ))}
    </div>
  );
};

export default GameCanvas;
