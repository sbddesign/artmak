import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '15px',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 3000,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '2px solid #4CAF50',
        transition: 'opacity 0.3s ease-in-out',
        backdropFilter: 'blur(10px)',
        minWidth: '250px'
      }}
    >
      {message}
    </div>
  );
};
