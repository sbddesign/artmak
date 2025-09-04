import React, { useState } from 'react';
import { useArkWallet } from '../hooks/useArkWallet';

const WalletInfo: React.FC = () => {
  const { wallet, isLoaded, isCreating, error, clearWallet } = useArkWallet();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isLoaded) {
    return (
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
        {isCreating ? '🔄 Creating wallet...' : '⏳ Loading...'}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '10px 15px',
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
        color: 'white',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}>
        ❌ Wallet Error
      </div>
    );
  }

  if (!wallet) {
    return null;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 100,
      maxWidth: '300px'
    }}>
      {/* Wallet Status Button */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '10px 15px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        <span>₿</span>
        <span>Ark Wallet (Mutinynet)</span>
        <span style={{ fontSize: '12px' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded Wallet Details */}
      {isExpanded && (
        <div style={{
          marginTop: '8px',
          padding: '15px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          borderRadius: '15px',
          fontSize: '12px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: '5px' }}>
              🟢 Wallet Connected (Mutinynet)
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ color: '#FFC107', marginBottom: '2px' }}>Address:</div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '11px',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 6px',
              borderRadius: '4px'
            }}>
              {formatAddress(wallet.address)}
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ color: '#FFC107', marginBottom: '2px' }}>Boarding Address:</div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '11px',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 6px',
              borderRadius: '4px'
            }}>
              {formatAddress(wallet.boardingAddress)}
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ color: '#FFC107', marginBottom: '2px' }}>Public Key:</div>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '10px',
              wordBreak: 'break-all',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 6px',
              borderRadius: '4px'
            }}>
              {formatAddress(wallet.publicKey)}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              clearWallet();
            }}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(244, 67, 54, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.8)';
            }}
          >
            🗑️ Clear Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletInfo;
