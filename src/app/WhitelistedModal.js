import React from 'react';

const WhitelistedModal = ({ message, onClose }) => {
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
          backgroundSize: 'cover', // Ensures the image covers the entire background
          backgroundRepeat: 'repeat', // Repeats the image to fill the space
          animation: 'waveAnimation 10s linear infinite', // Add wave animation
        }}
      ></div>
      <div
        id="modal-content"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'black', // Black background for the message
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Darker shadow for black background
          zIndex: 1001,
          color: 'white', // White text
          textAlign: 'center', // Center text
        }}
      >
        <p id="modal-message">{message}</p>
        <button
          id="modal-close"
          onClick={onClose}
          style={{
            background: '#2575fc', // Blue button
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WhitelistedModal;