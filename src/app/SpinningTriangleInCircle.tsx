import React from 'react';

const SpinningTriangleInCircle = () => {
  const triangleSize = 15; // The height of your triangle (borderBottom)

  const circleStyle = {
    width: `${triangleSize * 2}px`, // Diameter of the circle
    height: `${triangleSize * 2}px`,
    borderRadius: '50%', // Make it a circle
    backgroundColor: 'white',
    position: 'relative', // Needed for absolute positioning of triangle
    display: 'flex', // center the triangle
    justifyContent: 'center',
    alignItems: 'center',
  };

  const triangleStyle = {
    width: 0,
    height: 0,
    borderLeft: `${triangleSize * 0.66}px solid transparent`, // Adjust for aspect ratio
    borderRight: `${triangleSize * 0.66}px solid transparent`,
    borderBottom: `${triangleSize}px solid green`,
    animation: 'spin 1s linear infinite',
    position: 'absolute', // Position inside the circle
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // center the triangle
  };

  return (
    <div style={circleStyle}>
      <div style={triangleStyle}></div>
    </div>
  );
};

export default SpinningTriangleInCircle;
