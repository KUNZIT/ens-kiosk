import { useEffect, useRef } from 'react';

const RainSound = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 5; // Adjust volume as needed
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
        // Handle potential autoplay errors (browsers may block it)
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <audio ref={audioRef} src="/assets/rain.mp3" preload="auto" />
  );
};

export default RainSound;
