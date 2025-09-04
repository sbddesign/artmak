import React, { useEffect, useRef, useState } from 'react';
import { Player } from '../types/game';

interface BlobProps {
  player: Player;
  isCurrentPlayer?: boolean;
  onBlobClick?: (player: Player) => void;
}

const Blob: React.FC<BlobProps> = ({ player, isCurrentPlayer = false, onBlobClick }) => {
  const blobRef = useRef<HTMLDivElement>(null);
  const [currentX, setCurrentX] = useState(player.x);
  const [currentY, setCurrentY] = useState(player.y);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initialize position when player first appears
    if (blobRef.current && !animationRef.current) {
      setCurrentX(player.x);
      setCurrentY(player.y);
    }
  }, [player.id]);

  useEffect(() => {
    // Animate to target position
    const animateToTarget = () => {
      const dx = player.targetX - currentX;
      const dy = player.targetY - currentY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        // Close enough to target
        setCurrentX(player.targetX);
        setCurrentY(player.targetY);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return;
      }

      // Move towards target (smooth movement speed)
      const speed = 2; // pixels per frame
      const moveX = (dx / distance) * speed;
      const moveY = (dy / distance) * speed;

      setCurrentX(prev => prev + moveX);
      setCurrentY(prev => prev + moveY);

      animationRef.current = requestAnimationFrame(animateToTarget);
    };

    if (player.isMoving) {
      animationRef.current = requestAnimationFrame(animateToTarget);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [player.targetX, player.targetY, player.isMoving, currentX, currentY]);

  useEffect(() => {
    if (blobRef.current) {
      blobRef.current.style.left = `${currentX}px`;
      blobRef.current.style.top = `${currentY}px`;
    }
  }, [currentX, currentY]);

  const handleBlobClick = (event: React.MouseEvent) => {
    console.log('🎯 Blob click handler called for player:', player.id);
    event.stopPropagation(); // Prevent canvas click
    event.preventDefault(); // Prevent default behavior
    console.log('🛑 Event propagation stopped');
    if (onBlobClick && !isCurrentPlayer) {
      console.log('💰 Calling onBlobClick for payment');
      onBlobClick(player);
    } else {
      console.log('❌ Not calling onBlobClick - isCurrentPlayer:', isCurrentPlayer, 'onBlobClick exists:', !!onBlobClick);
    }
  };

  const handleBlobTouch = (event: React.TouchEvent) => {
    console.log('📱 Blob touch handler called for player:', player.id);
    event.stopPropagation(); // Prevent canvas touch
    event.preventDefault(); // Prevent default behavior
    console.log('🛑 Touch event propagation stopped');
    if (onBlobClick && !isCurrentPlayer) {
      console.log('💰 Calling onBlobClick for payment (touch)');
      onBlobClick(player);
    }
  };

  return (
    <div
      ref={blobRef}
      className={`blob ${isCurrentPlayer ? 'current-player' : ''}`}
      onMouseDown={handleBlobClick}
      onTouchStart={handleBlobTouch}
      style={{
        position: 'absolute',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: player.color,
        border: isCurrentPlayer ? '3px solid #fff' : '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'none',
        cursor: isCurrentPlayer ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isCurrentPlayer ? 10 : 5,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Smiley face */}
      <div style={{
        width: '30px',
        height: '30px',
        position: 'relative'
      }}>
        {/* Eyes */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          width: '4px',
          height: '4px',
          backgroundColor: '#333',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '4px',
          height: '4px',
          backgroundColor: '#333',
          borderRadius: '50%'
        }} />
        
        {/* Smile */}
        <div style={{
          position: 'absolute',
          bottom: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '18px',
          height: '9px',
          border: '2px solid #333',
          borderTop: 'none',
          borderRadius: '0 0 18px 18px'
        }} />
      </div>
    </div>
  );
};

export default Blob;
