import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Player } from '../types/game';

interface BlobProps {
  player: Player;
  isCurrentPlayer?: boolean;
  onBlobClick?: (player: Player) => void;
  viewportCenter: { x: number; y: number };
}

const Blob: React.FC<BlobProps> = ({ player, isCurrentPlayer = false, onBlobClick, viewportCenter }) => {
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

  // Calculate dynamic movement speed based on balance
  const calculateSpeed = useCallback(() => {
    const baseSpeed = 4; // Increased default speed in pixels per frame
    const balance = player.availableBalance || 0;
    const speedReduction = (balance / 1000) * 0.05; // 5% reduction per 1000 sats
    const speedMultiplier = Math.max(0.1, 1 - speedReduction); // Minimum 10% of original speed
    return baseSpeed * speedMultiplier;
  }, [player.availableBalance]);

  const blobSize = calculateSize();
  const movementSpeed = calculateSpeed();

  useEffect(() => {
    // Initialize position when player first appears
    if (blobRef.current && !animationRef.current) {
      // Transform server coordinates to viewport coordinates
      setCurrentX(player.x + viewportCenter.x);
      setCurrentY(player.y + viewportCenter.y);
    }
  }, [player.id, viewportCenter]);

  useEffect(() => {
    // Animate to target position
    const animateToTarget = () => {
      // Transform server target coordinates to viewport coordinates
      const targetViewportX = player.targetX + viewportCenter.x;
      const targetViewportY = player.targetY + viewportCenter.y;
      
      const dx = targetViewportX - currentX;
      const dy = targetViewportY - currentY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        // Close enough to target
        setCurrentX(targetViewportX);
        setCurrentY(targetViewportY);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return;
      }

      // Move towards target (dynamic movement speed based on balance)
      const moveX = (dx / distance) * movementSpeed;
      const moveY = (dy / distance) * movementSpeed;

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
  }, [player.targetX, player.targetY, player.isMoving, currentX, currentY, movementSpeed, viewportCenter]);

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
      
      {/* Balance and speed indicator */}
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
          <div style={{ fontSize: '8px', opacity: 0.8 }}>
            Speed: {((movementSpeed / 4) * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default Blob;
