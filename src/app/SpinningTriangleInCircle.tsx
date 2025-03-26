import React, { CSSProperties } from 'react'; // Import CSSProperties

const SpinningTriangleInCircle = () => {
  const triangleSize = 15;

  const circleStyle: CSSProperties = { // Type it as CSSProperties
    width: `${triangleSize * 2}px`,
    height: `${triangleSize * 2}px`,
    borderRadius: '50%',
    backgroundColor: 'white',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const triangleStyle: CSSProperties = { // Type it as CSSProperties
    width: 0,
    height: 0,
    borderLeft: `${triangleSize * 0.66}px solid transparent`,
    borderRight: `${triangleSize * 0.66}px solid transparent`,
    borderBottom: `${triangleSize}px solid green`,
    animation: 'spin 1s linear infinite',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div style={circleStyle}>
      <div style={triangleStyle}></div>
    </div>
  );
};

export default SpinningTriangleInCircle;
