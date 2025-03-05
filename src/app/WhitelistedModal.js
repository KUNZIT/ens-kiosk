import React from 'react';

const WhitelistedModal = ({ message }) => {
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
        color: 'black', // Changed to black for better contrast
        textAlign: 'center',
        border: '1px solid white', // Added green border
      }}
    >
      <p style={{ fontSize: '1.2em', color: 'white' }}>{message}</p>
    </div>
  );
};

export default WhitelistedModal;