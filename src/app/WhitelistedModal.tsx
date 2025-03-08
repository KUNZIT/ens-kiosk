// WhitelistedModal.tsx

import React from 'react';

interface WhitelistedModalProps {
  message: string;
  remainingTime?: number;
  efpMessage?: string;
}

const WhitelistedModal: React.FC<WhitelistedModalProps> = ({ message, remainingTime, efpMessage }) => {
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
        <p style={{ fontSize: '1.2em', color: 'red', marginTop: '10px' }}>
          Already checked. Please come back after: {remainingTime} minutes
        </p>
      )}

      {!efpMessage && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
          <div
            style={{
              border: '4px solid #f3f3f3',
              borderRadius: '50%',
              borderTop: '4px solid #3498db',
              width: '20px',
              height: '20px',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <p style={{ fontSize: '1.2em', color: 'white', marginLeft: '10px' }}>Checking EFP status...</p>
        </div>
      )}

      {efpMessage && (
        <p style={{ fontSize: '1.2em', color: 'white', marginTop: '10px' }}>
          {efpMessage}
        </p>
      )}
    </div>
  );
};

export default WhitelistedModal;