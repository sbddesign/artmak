import React from 'react';

interface BalanceDisplayProps {
  balance: {
    available: number;
    pending: number;
    total: number;
    currency: string;
  } | null;
  isCheckingBalance: boolean;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance, isCheckingBalance }) => {
  if (!balance) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '15px',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 1000,
        border: '2px solid #4CAF50',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        minWidth: '300px'
      }}>
        {isCheckingBalance ? 'Checking balance...' : 'No balance data'}
      </div>
    );
  }

  const formatBalance = (amount: number) => {
    if (amount === 0) return '0';
    if (amount < 1000) return amount.toString();
    if (amount < 1000000) return `${(amount / 1000).toFixed(1)}K`;
    return `${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '25px 35px',
      borderRadius: '20px',
      fontSize: '28px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 1000,
      border: '3px solid #4CAF50',
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
      minWidth: '350px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '16px', opacity: 0.8 }}>
        {isCheckingBalance ? '🔄 Updating...' : '💰 Available Balance'}
      </div>
      <div style={{ 
        fontSize: '36px', 
        color: '#4CAF50',
        textShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
        marginBottom: '8px'
      }}>
        {formatBalance(balance.available)} {balance.currency.toUpperCase()}
      </div>
      {balance.pending > 0 && (
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          Pending: {formatBalance(balance.pending)} {balance.currency.toUpperCase()}
        </div>
      )}
    </div>
  );
};
