import React, { useEffect, useState } from 'react';

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
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

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
        animation: isVisible ? 'toastFadeIn 0.3s ease-out' : 'toastFadeOut 0.3s ease-in',
        backdropFilter: 'blur(10px)',
        minWidth: '250px'
      }}
    >
      {message}
      <style>
        {`
          @keyframes toastFadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          @keyframes toastFadeOut {
            from {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            to {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
          }
        `}
      </style>
    </div>
  );
};
