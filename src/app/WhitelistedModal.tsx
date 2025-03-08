// WhitelistedModal.tsx

import React from 'react';

interface WhitelistedModalProps {
  message: string;
  remainingTime?: number;
  efpMessage?: string; // Add efpMessage prop
}

const WhitelistedModal: React.FC<WhitelistedModalProps> = ({ message, remainingTime, efpMessage }) => { // Destructure efpMessage
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'black',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        zIndex: 1001,
        color: 'black',
        textAlign: 'center',
        border: '1px solid green',
      }}
    >
      <p style={{ fontSize: '1.2em', color: 'white' }}>{message}</p>
      {remainingTime !== undefined && (
        <p style={{ fontSize: '1.2em',color: 'red', marginTop: '10px' }}>
          Already checked. Please come back after: {remainingTime} minutes
        </p>
      )}

      {efpMessage && ( // Move this block outside the remainingTime block
        <p style={{ fontSize: '1.2em',color: 'white', marginTop: '10px' }}>
          {efpMessage}
        </p>
      )}
    </div>
  );
};

export default WhitelistedModal;