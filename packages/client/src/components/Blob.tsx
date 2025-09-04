import React, { useEffect, useRef } from 'react';
import { Player } from '../types/game';

interface BlobProps {
  player: Player;
  isCurrentPlayer?: boolean;
}

const Blob: React.FC<BlobProps> = ({ player, isCurrentPlayer = false }) => {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blobRef.current) {
      blobRef.current.style.left = `${player.x}px`;
      blobRef.current.style.top = `${player.y}px`;
    }
  }, [player.x, player.y]);

  return (
    <div
      ref={blobRef}
      className={`blob ${isCurrentPlayer ? 'current-player' : ''}`}
      style={{
        position: 'absolute',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: player.color,
        border: isCurrentPlayer ? '3px solid #fff' : '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease-out',
        cursor: 'pointer',
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
