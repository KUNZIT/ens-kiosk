// IsCheckedModal.tsx
import React from 'react';

interface IsCheckedModalProps {
  remainingTime: number;
}

const IsCheckedModal: React.FC<IsCheckedModalProps> = ({ remainingTime }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        border: '1px solid orange',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        textAlign: 'center',
      }}
    >
      <p style={{ color: 'orange', fontWeight: 'bold', fontSize: '1.2em' }}>
        ENS name already checked. Please come back after:
      </p>
      <p style={{ fontSize: '1.1em', marginTop: '10px' }}>
        {remainingTime} {remainingTime === 1 ? 'hour' : 'hours'}
      </p>
    </div>
  );
};

export default IsCheckedModal;