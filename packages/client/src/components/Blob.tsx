import React, { useEffect, useRef, useState, useCallback } from 'react';
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

  // Calculate dynamic size based on balance
  const calculateSize = useCallback(() => {
    const baseSize = 60; // Default size in pixels
    const balance = player.availableBalance || 0;
    const sizeMultiplier = 1 + (balance / 1000) * 0.005; // 0.5% increase per 1000 sats
    return Math.max(baseSize, baseSize * sizeMultiplier);
  }, [player.availableBalance]);

  const blobSize = calculateSize();

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
    event.stopPropagation(); // Prevent canvas click
    event.preventDefault(); // Prevent default behavior
    if (onBlobClick && !isCurrentPlayer) {
      onBlobClick(player);
    }
  };

  const handleBlobTouch = (event: React.TouchEvent) => {
    event.stopPropagation(); // Prevent canvas touch
    event.preventDefault(); // Prevent default behavior
    if (onBlobClick && !isCurrentPlayer) {
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
        width: `${blobSize}px`,
        height: `${blobSize}px`,
        borderRadius: '50%',
        backgroundColor: player.color,
        border: isCurrentPlayer ? '3px solid #fff' : '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'width 0.3s ease, height 0.3s ease',
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
        width: `${blobSize * 0.5}px`, // Scale smiley face proportionally
        height: `${blobSize * 0.5}px`,
        position: 'relative'
      }}>
        {/* Eyes */}
        <div style={{
          position: 'absolute',
          top: `${blobSize * 0.1}px`,
          left: `${blobSize * 0.1}px`,
          width: `${blobSize * 0.067}px`,
          height: `${blobSize * 0.067}px`,
          backgroundColor: '#333',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          top: `${blobSize * 0.1}px`,
          right: `${blobSize * 0.1}px`,
          width: `${blobSize * 0.067}px`,
          height: `${blobSize * 0.067}px`,
          backgroundColor: '#333',
          borderRadius: '50%'
        }} />
        
        {/* Smile */}
        <div style={{
          position: 'absolute',
          bottom: `${blobSize * 0.1}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${blobSize * 0.3}px`,
          height: `${blobSize * 0.15}px`,
          border: `${blobSize * 0.033}px solid #333`,
          borderTop: 'none',
          borderRadius: `0 0 ${blobSize * 0.3}px ${blobSize * 0.3}px`
        }} />
      </div>
      
      {/* Balance indicator */}
      {player.availableBalance !== undefined && player.availableBalance > 0 && (
        <div style={{
          position: 'absolute',
          top: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '2px 6px',
          borderRadius: '10px',
          whiteSpace: 'nowrap',
          zIndex: 20
        }}>
          {player.availableBalance.toLocaleString()} sats
        </div>
      )}
    </div>
  );
};

export default Blob;
