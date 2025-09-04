import React from 'react';

interface BalanceDisplayProps {
  balance: {
    available: number;
    boarding: number;
    confirmed: number;
    total: number;
    unconfirmed: number;
    preconfirmed: number;
    recoverable: number;
    settled: number;
    currency: string;
  } | null;
  isCheckingBalance: boolean;
  isBoarding: boolean;
  onBoardFunds: () => void;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance, isCheckingBalance, isBoarding, onBoardFunds }) => {
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

  const hasUnboardedFunds = balance.confirmed > 0 || balance.boarding > 0;

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
      border: hasUnboardedFunds ? '3px solid #FF9800' : '3px solid #4CAF50',
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
      minWidth: '350px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '16px', opacity: 0.8 }}>
        {isCheckingBalance ? '🔄 Updating...' : isBoarding ? '🚢 Boarding...' : '💰 Available Balance'}
      </div>
      <div style={{ 
        fontSize: '36px', 
        color: hasUnboardedFunds ? '#FF9800' : '#4CAF50',
        textShadow: hasUnboardedFunds ? '0 0 10px rgba(255, 152, 0, 0.5)' : '0 0 10px rgba(76, 175, 80, 0.5)',
        marginBottom: '8px'
      }}>
        {formatBalance(balance.available)} {balance.currency.toUpperCase()}
      </div>
      
      {/* Show unboarded funds */}
      {hasUnboardedFunds && (
        <div style={{ 
          fontSize: '14px', 
          color: '#FF9800',
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 152, 0, 0.3)'
        }}>
          🚢 {formatBalance(balance.confirmed)} {balance.currency.toUpperCase()} ready to board
        </div>
      )}

      {/* Boarding button */}
      {hasUnboardedFunds && (
        <button
          onClick={onBoardFunds}
          disabled={isBoarding}
          style={{
            backgroundColor: isBoarding ? '#666' : '#FF9800',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isBoarding ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            marginTop: '8px'
          }}
          onMouseOver={(e) => {
            if (!isBoarding) {
              e.currentTarget.style.backgroundColor = '#F57C00';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!isBoarding) {
              e.currentTarget.style.backgroundColor = '#FF9800';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isBoarding ? '🚢 Boarding...' : '🚢 Board Funds'}
        </button>
      )}
    </div>
  );
};
