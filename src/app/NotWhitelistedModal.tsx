// NotWhitelistedModal.tsx
import React from 'react';

interface NotWhitelistedModalProps {
  message: string;
  onClose: () => void;
}

const NotWhitelistedModal: React.FC<NotWhitelistedModalProps> = ({ message, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        border: '1px solid black',
        zIndex: 1000,
      }}
    >
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default NotWhitelistedModal;