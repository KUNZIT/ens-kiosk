import React from 'react';
import styles from './RunningInfoLine.module.css'; // Import CSS Module

interface RunningInfoLineProps {
  /** Array of strings, each being an info message. Max 5 items recommended for the requested format. */
  infoTexts: string[];
  /** Controls the speed. Higher numbers mean faster speed. Default: 50 */
  speed?: number;
  /** CSS font-weight value (e.g., 'normal', 'bold', 400, 700). Default: 'normal' */
  fontWeight?: React.CSSProperties['fontWeight'];
}

const RunningInfoLine: React.FC<RunningInfoLineProps> = ({
  infoTexts = [], // Default to empty array
  speed = 50,    // Default speed
  fontWeight = 'normal', // Default font weight
}) => {
  // Basic validation to prevent errors if no text is provided
  if (!infoTexts || infoTexts.length === 0) {
    return null; // Don't render anything if there are no texts
  }

  // Calculate animation duration based on speed.
  // Lower duration = faster speed. We invert the 'speed' input.
  // Adjust the base duration (e.g., 25s) as needed to feel right with the default speed.
  const baseDuration = 50; // Base seconds for default speed (50)
  const animationDuration = `${(baseDuration * 50) / speed}s`;

  // Ensure we only take up to 5 items as per the initial request, though it can handle more
  const itemsToDisplay = infoTexts.slice(0, 5);

  return (
    <div className={styles.marqueeContainer} style={{ fontWeight }}>
      {/*
        The content is duplicated inside the marqueeContent div
        to create a seamless looping effect.
      */}
      <div
        className={styles.marqueeContent}
        style={{ animationDuration }} // Apply dynamic duration
      >

        {/* This adds a fixed-width empty space before your content */}
        <span style={{ display: 'inline-block', width: '250px' }}></span> {/* Adjust '300px' as needed */}
        


        
        {/* First instance of the content */}
        {itemsToDisplay.map((text, index) => (
          <span key={`item-1-${index}`} className={styles.infoItem}>
            <span className={styles.numberCircle}>{index + 1}</span>
            {text}
          </span>
        ))}
        {/* Duplicate instance of the content for seamless loop */}





        
        
      </div>
    </div>
  );
};

export default RunningInfoLine;
