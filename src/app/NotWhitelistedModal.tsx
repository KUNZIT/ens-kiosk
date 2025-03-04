// NotWhitelistedModal.tsx
import React from 'react';

interface NotWhitelistedModalProps {
  message: string;
}

const NotWhitelistedModal: React.FC<NotWhitelistedModalProps> = ({ message }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'black',
        padding: '20px',
        border: '1px solid red', // Red border for emphasis
        zIndex: 1000,
        borderRadius: '8px', // Rounded corners
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Add a subtle shadow
      }}
    >
      <p style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2em' }}>{message}</p>
    </div>
  );
};

export default NotWhitelistedModal;