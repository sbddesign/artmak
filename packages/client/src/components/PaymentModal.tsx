import React, { useState } from 'react';
import { Player } from '../types/game';

interface PaymentModalProps {
  targetPlayer: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSendPayment: (amount: number, message?: string) => void;
  isSending: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  targetPlayer,
  isOpen,
  onClose,
  onSendPayment,
  isSending
}) => {
  const [amount, setAmount] = useState('1000');
  const [message, setMessage] = useState('');

  if (!isOpen || !targetPlayer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (numAmount > 0) {
      onSendPayment(numAmount, message || undefined);
    }
  };

  const handleClose = () => {
    setAmount('1000');
    setMessage('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          color: '#333',
          textAlign: 'center',
          fontSize: '24px'
        }}>
          💰 Send Payment
        </h2>

        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', color: '#666', marginBottom: '5px' }}>
            To Player:
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: targetPlayer.color
          }}>
            {targetPlayer.arkAddress ? '✅ Has Ark Address' : '❌ No Ark Address'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Amount (sats):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="1000000"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Message (optional):
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's this payment for?"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSending}
              style={{
                padding: '12px 24px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#666',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !targetPlayer.arkAddress}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: targetPlayer.arkAddress ? '#4CAF50' : '#ccc',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (isSending || !targetPlayer.arkAddress) ? 'not-allowed' : 'pointer',
                opacity: (isSending || !targetPlayer.arkAddress) ? 0.6 : 1
              }}
            >
              {isSending ? '🚀 Sending...' : '💰 Send Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
