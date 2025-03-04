import React from 'react';

const WhitelistedModal = ({ message, onClose }) => {
  return (
    <div id="modal-container" style={{ display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}>
      <div id="modal-background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, #6a11cb, #2575fc)', filter: 'blur(10px)', animation: 'gradientAnimation 10s ease infinite' }}></div>
      <div id="modal-content" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', zIndex: 1001 }}>
        <p id="modal-message">{message}</p>
        <button id="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default WhitelistedModal;