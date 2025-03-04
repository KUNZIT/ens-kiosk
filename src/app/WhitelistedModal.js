import React from 'react';

const WhitelistedModal = ({ message }) => { // Removed onClose prop
  return (
    <div
      id="modal-container"
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
      }}
    >
      <div
        id="modal-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'blue',
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
          
        }}
      ></div>
      <div
        id="modal-content"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'black',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          zIndex: 1001,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <p id="modal-message" style={{ fontSize: '1.2em' }}>{message}</p>
      </div>
    </div>
  );
};

export default WhitelistedModal;