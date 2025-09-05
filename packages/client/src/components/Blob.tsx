import React, { useEffect, useRef, useCallback } from 'react';
import { Player } from '../types/game';
import { generateColorFromString, getDefaultPlayerColor } from '../utils/colorUtils';

interface BlobProps {
  player: Player;
  isCurrentPlayer?: boolean;
  onBlobClick?: (player: Player) => void;
  viewportCenter: { x: number; y: number };
}

const Blob: React.FC<BlobProps> = ({ player, isCurrentPlayer = false, onBlobClick, viewportCenter }) => {
  const blobRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const currentPosRef = useRef({ x: player.x, y: player.y });
  const isAnimatingRef = useRef(false);

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

  // Get the appropriate color for this player
  const getPlayerColor = useCallback(() => {
    if (player.arkAddress) {
      return generateColorFromString(player.arkAddress);
    }
    return player.color || getDefaultPlayerColor();
  }, [player.arkAddress, player.color]);

  useEffect(() => {
    // Initialize position when player first appears
    if (blobRef.current && !animationRef.current) {
      // Transform server coordinates to viewport coordinates
      const viewportX = player.x + viewportCenter.x;
      const viewportY = player.y + viewportCenter.y;
      currentPosRef.current = { x: viewportX, y: viewportY };
      blobRef.current.style.transform = `translate(calc(${viewportX}px - 50%), calc(${viewportY}px - 50%))`;
      blobRef.current.style.webkitTransform = `translate(calc(${viewportX}px - 50%), calc(${viewportY}px - 50%))`;
    }
  }, [player.id, viewportCenter]);

  useEffect(() => {
    // Animate to target position using direct DOM manipulation
    const animateToTarget = () => {
      if (!blobRef.current) return;
      
      // Transform server target coordinates to viewport coordinates
      const targetViewportX = player.targetX + viewportCenter.x;
      const targetViewportY = player.targetY + viewportCenter.y;
      
      const currentPos = currentPosRef.current;
      const dx = targetViewportX - currentPos.x;
      const dy = targetViewportY - currentPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        // Close enough to target
        blobRef.current.style.transform = `translate(calc(${targetViewportX}px - 50%), calc(${targetViewportY}px - 50%))`;
        blobRef.current.style.webkitTransform = `translate(calc(${targetViewportX}px - 50%), calc(${targetViewportY}px - 50%))`;
        currentPosRef.current = { x: targetViewportX, y: targetViewportY };
        isAnimatingRef.current = false;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return;
      }

      // Move towards target (dynamic movement speed based on balance)
      const moveX = (dx / distance) * movementSpeed;
      const moveY = (dy / distance) * movementSpeed;
      
      const newX = currentPos.x + moveX;
      const newY = currentPos.y + moveY;
      
      // Update DOM directly using transform for better performance
      blobRef.current.style.transform = `translate(calc(${newX}px - 50%), calc(${newY}px - 50%))`;
      blobRef.current.style.webkitTransform = `translate(calc(${newX}px - 50%), calc(${newY}px - 50%))`;
      currentPosRef.current = { x: newX, y: newY };

      animationRef.current = requestAnimationFrame(animateToTarget);
    };

    if (player.isMoving && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationRef.current = requestAnimationFrame(animateToTarget);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      isAnimatingRef.current = false;
    };
  }, [player.targetX, player.targetY, player.isMoving, movementSpeed, viewportCenter]);

  // Position is now updated directly in the animation loop to avoid flicker

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
        backgroundColor: getPlayerColor(),
        border: isCurrentPlayer ? '3px solid #fff' : '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'width 0.3s ease, height 0.3s ease',
        cursor: isCurrentPlayer ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isCurrentPlayer ? 10 : 5,
        left: 0,
        top: 0,
        // Transform will be applied dynamically in animation code
        WebkitTransform: 'translate(-50%, -50%)', // Mobile Safari compatibility
        transform: 'translate(-50%, -50%)',
        // Mobile Safari optimizations
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitPerspective: '1000px',
        perspective: '1000px',
        willChange: 'transform'
      }}
    >
      {/* Smiley face */}
      <div style={{
        width: `${blobSize * 0.5}px`, // Scale smiley face proportionally
        height: `${blobSize * 0.5}px`,
        position: 'relative',
        // Mobile Safari fixes
        WebkitTransform: 'none',
        transform: 'none',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden'
      }}>
        {/* Eyes */}
        <div style={{
          position: 'absolute',
          top: `${blobSize * 0.1}px`,
          left: `${blobSize * 0.1}px`,
          width: `${blobSize * 0.067}px`,
          height: `${blobSize * 0.067}px`,
          backgroundColor: '#333',
          borderRadius: '50%',
          // Mobile Safari fixes
          WebkitTransform: 'none',
          transform: 'none',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }} />
        <div style={{
          position: 'absolute',
          top: `${blobSize * 0.1}px`,
          right: `${blobSize * 0.1}px`,
          width: `${blobSize * 0.067}px`,
          height: `${blobSize * 0.067}px`,
          backgroundColor: '#333',
          borderRadius: '50%',
          // Mobile Safari fixes
          WebkitTransform: 'none',
          transform: 'none',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }} />
        
        {/* Smile */}
        <div style={{
          position: 'absolute',
          bottom: `${blobSize * 0.1}px`,
          left: `${blobSize * 0.1}px`, // Use left positioning instead of transform
          width: `${blobSize * 0.3}px`,
          height: `${blobSize * 0.15}px`,
          borderLeft: `${blobSize * 0.033}px solid #333`,
          borderRight: `${blobSize * 0.033}px solid #333`,
          borderBottom: `${blobSize * 0.033}px solid #333`,
          borderRadius: `0 0 ${blobSize * 0.3}px ${blobSize * 0.3}px`,
          // Mobile Safari fixes
          WebkitTransform: 'none',
          transform: 'none',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }} />
      </div>
      
      {/* Balance and speed indicators removed for cleaner look */}
    </div>
  );
};

export default Blob;
