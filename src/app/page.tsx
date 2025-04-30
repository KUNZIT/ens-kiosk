"use client";

import { useAccount, useConnect, useDisconnect, Connector } from "wagmi";
import { EnsDisplay } from "./EnsDisplay"; // Assuming this path is correct
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { isUserFollowedByGrado } from "./efpUtils"; // Assuming this path is correct
import RunningInfoLine from "./RunningInfoLine"; // Assuming this path is correct, might be '@/components/RunningInfoLine'

// Define the AnimatedRainCanvasBackground component directly inside or outside HomePage
// Keeping it inside as per your original structure is fine for this specific case.
const AnimatedRainCanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainDrops = 300;
  const rainArray: {
    x: number;
    y: number;
    length: number;
    opacity: number;
    xSpeed: number;
    ySpeed: number;
  }[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < rainDrops; i++) {
      rainArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 10 + 5,
        opacity: Math.random() * 0.5 + 0.5,
        xSpeed: Math.random() * 2 - 1,
        ySpeed: Math.random() * 7 + 5,
      });
    }

    let animationFrameId: number;
    const animateRain = () => {
      if (!ctx || !canvas) return; // Add check for canvas existence too
      // Ensure clearing happens correctly
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Adjust alpha for desired trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rainArray.forEach((drop) => {
        drop.y += drop.ySpeed;
        drop.x += drop.xSpeed;

        // Reset drop position if it goes off screen
        if (drop.y > canvas.height) {
          drop.y = -drop.length; // Start just above the screen
          drop.x = Math.random() * canvas.width;
          drop.xSpeed = Math.random() * 2 - 1; // Optional: reset speed too
          drop.ySpeed = Math.random() * 7 + 5; // Optional: reset speed too
        } else if (drop.x > canvas.width || drop.x < 0) {
           // If it drifts horizontally off-screen, reset
           drop.y = -drop.length;
           drop.x = Math.random() * canvas.width;
        }


        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(17,41,255, ${drop.opacity})`; // Use drop opacity
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animateRain);
    };

    animateRain(); // Start animation

    const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Optional: You might want to re-initialize rain positions on resize
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId); // Stop animation on component unmount
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Ensure it's behind other content
      }}
    />
  );
};


// This is your main page component
export default function HomePage() {
  // Define infoItems here so it's accessible in the return statement
  const infoItems = [
    "-Connect Wallet-",
    "-Display ENS-",
    "-Whitelisted-",
    "-grado.eth follow-",
    "-Play audio-"
  ];

  // --- Logic moved from nested App component to HomePage ---
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [remainingTime, setRemainingTime] = useState(30);
  const router = useRouter();
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectCompleteRef = useRef(false);
  const [efpMessage, setEfpMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // --- useEffects moved from nested App component ---
  useEffect(() => {
    if (account.isConnected) {
      setRemainingTime(30); // Reset timer on connect
      // Clear previous intervals/timeouts before setting new ones
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);


      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 1) { // Decrement until 1, then clear interval
            return prevTime - 1;
          } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return 0; // Set to 0
          }
        });
      }, 1000);

      timerTimeoutRef.current = setTimeout(() => {
        handleDisconnectLogic();
      }, 30000); // 30 seconds timeout

    } else {
      // Cleanup if disconnected externally or initially
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current);
        timerTimeoutRef.current = null;
      }
       setRemainingTime(30); // Reset display time
       // If a disconnect was initiated and completed, reload
       if (disconnectCompleteRef.current) {
         window.location.reload();
         disconnectCompleteRef.current = false; // Reset flag
       }
    }

    // Cleanup function for the effect
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      if (connectionTimeout) clearTimeout(connectionTimeout); // Clean up connection timeout too
    };
    // Add disconnect and router to dependencies if their identities could change,
    // though typically they are stable from wagmi/next.
  }, [account.isConnected, disconnect, router, connectionTimeout]); // Added connectionTimeout to deps

  // Effect for EFP check
  useEffect(() => {
    const checkEfpFollow = async () => {
      if (account.address) {
        setEfpMessage("Checking EFP status..."); // Indicate loading
        try {
          const isFollowed = await isUserFollowedByGrado(account.address);
          if (isFollowed) {
            setEfpMessage("grado.eth follows you!");
          } else {
            setEfpMessage("grado.eth does NOT follow you.");
          }
        } catch (error) {
          console.error("Error checking EFP follow status:", error);
          setEfpMessage("Could not check EFP status.");
        }
      } else {
          setEfpMessage(""); // Clear message if not connected
      }
    };

    checkEfpFollow();
  }, [account.address]); // Rerun when address changes

  // Effect for handling connection errors and clearing timeout on success
   useEffect(() => {
     if (error && error.message.includes("Connection request reset")) {
       console.log("Connection request reset detected, reloading.");
       window.location.reload();
     }
     // Clear the connection timeout if connection succeeds
     if (account.isConnected && connectionTimeout) {
       clearTimeout(connectionTimeout);
       setConnectionTimeout(null);
       setIsModalOpen(false); // Close modal on successful connect
     }
   }, [error, account.isConnected, connectionTimeout]);


  // --- Handler functions moved from nested App component ---
  const handleConnect = (connector: Connector) => {
    setIsModalOpen(true); // Show modal/indicator
    setIsButtonClicked(true); // For button animation
    connect({ connector });

    // Clear previous timeout just in case
    if (connectionTimeout) clearTimeout(connectionTimeout);

    // Set a timeout to potentially refresh if connection doesn't complete
    const timeoutId = setTimeout(() => {
      // Check if still trying to connect after timeout duration
      if (status === 'pending' || !account.isConnected) {
          console.log("Connection timed out after 120s, reloading.");
          window.location.reload();
      }
    }, 120000); // 120 seconds

    setConnectionTimeout(timeoutId);
  };

  const handleDisconnectLogic = () => {
    console.log("Disconnect triggered.");
    // Clear timers immediately
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    timerIntervalRef.current = null;
    timerTimeoutRef.current = null;

    disconnectCompleteRef.current = true; // Set flag *before* calling disconnect
    disconnect();
    // Reload will happen in the useEffect watching account.isConnected going to false
  };

  const handleDisconnect = () => {
    handleDisconnectLogic();
  };


  // --- JSX Return for HomePage ---
  return (
    // Use a Fragment or a single parent div
    <>
      {/* Add the RunningInfoLine component right at the top */}
      <RunningInfoLine
        infoTexts={infoItems}
        speed={60}        // Optional: Adjust speed (default 50). Higher is faster.
        fontWeight="bold" // Optional: Adjust weight (default 'normal').
      />

      {/* The rest of your page structure */}
      <div style={{ textAlign: "center", marginTop: "2rem", position: 'relative', zIndex: 1 }}> {/* Ensure content is above canvas */}
        <AnimatedRainCanvasBackground /> {/* Render the background */}

        <h2 className="ens-kiosk" style={{ zIndex: isModalOpen ? 50 : 100, color: 'white', position: 'relative' }}> {/* Ensure text visible */}
          ENS KIOSK
        </h2>

        <div style={{ display: "flex", width: "100%", marginTop: "2rem", padding: '0 2rem', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}> {/* Padding added */}
          {/* Left Panel */}
          <div
            style={{
              flex: "1",
              padding: "2rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)", // Slightly more opaque background
              border: "1px solid white",
              borderRadius: "5px",
              textAlign: "left",
              transition: "background-color 0.3s ease",
              color: 'white', // Ensure text is visible
              marginRight: '1rem', // Add margin between panels
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgb(3, 54, 126)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            }}
          >
            <p>
              Welcome to the ENS kiosk! Simply connect your wallet to check out with
              your ENS profile. Tap the connect button and scan the QR code with your
              mobile wallet. If your name is whitelisted and grado.eth follows you on
              EFP, the app will play audio, a notification
              will appear. This kiosk will automatically disconnect after 30 seconds.
            </p>
          </div>

          {/* Right Panel */}
          <div
            style={{
              flex: "1",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)", // Match other panel
              border: "1px solid white", // Add border for consistency
              borderRadius: "5px", // Add border radius
              color: 'white', // Ensure text is visible
              marginLeft: '1rem', // Add margin between panels
            }}
          >
            {account.status === "connected" ? (
              <>
                <EnsDisplay efpMessage={efpMessage} /> {/* Pass EFP message */}
                <button
                  type="button"
                  onClick={handleDisconnect}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid white",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "1rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "red";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "black";
                  }}
                >
                  Disconnect
                </button>
                <div style={{ marginTop: '0.5rem' }}>Time remaining: {remainingTime} seconds</div>
                {/* Progress Bar */}
                <div
                  style={{
                    width: "200px",
                    height: "10px",
                    backgroundColor: "#333",
                    borderRadius: "5px",
                    margin: "10px auto",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(remainingTime / 30) * 100}%`,
                      backgroundColor: "green",
                      transition: remainingTime === 30 ? 'none' : "width 1s linear", // Prevent transition on reset
                    }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                {/* Connect Buttons */}
                <div style={{ display: "flex", flexDirection: 'column', gap: "1rem", marginBottom: "2rem" }}>
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      // Disable button if connection is pending for this connector
                      disabled={status === 'pending'}
                      onClick={() => {
                        handleConnect(connector);
                        // setIsButtonClicked(true); // Moved inside handleConnect
                      }}
                      type="button"
                      style={{
                        padding: "1rem 2rem",
                        fontSize: "1rem",
                        background: isButtonClicked // Use status instead? Maybe keep isButtonClicked
                          ? "linear-gradient(to right, transparent 0px, #00BFFF 20px, rgba(0, 191, 255, 0) 40px)" // Loading animation
                          : "repeating-linear-gradient(to right, black, black 10px, rgb(3, 54, 126) 10px, rgb(3, 54, 126) 20px)", // Default stripe
                        color: "white",
                        border: "1px solid white",
                        borderRadius: "5px",
                        cursor: status === 'pending' ? 'wait' : 'pointer', // Indicate loading state
                        backgroundSize: "400px 100%", // For loading animation
                        animation: isButtonClicked ? "stripesAnimation 8s linear infinite" : "none", // CSS animation needed
                        backgroundColor: "rgba(0,0,0,0.2)",
                        opacity: status === 'success' ? 0.6 : 1, // Dim if connecting
                      }}
                      onMouseEnter={(e) => {
                         if (status !== 'pending') e.currentTarget.style.background = "rgb(3, 54, 126)"; // Hover effect only if not connecting
                      }}
                      onMouseLeave={(e) => {
                        // Reset background based on isButtonClicked state
                        e.currentTarget.style.background = isButtonClicked
                          ? "linear-gradient(to right, transparent 0px, #00BFFF 20px, rgba(0, 191, 255, 0) 40px)"
                          : "repeating-linear-gradient(to right, black, black 10px, rgb(3, 54, 126) 10px, rgb(3, 54, 126) 20px)";
                      }}
                    >
                      {status === 'pending' ? `Connecting...` : connector.name}
                    </button>
                  ))}
                </div>
                 {status === 'pending' && <p>Please approve connection in your wallet...</p>}
                 {error && <p style={{color: 'red'}}>Error: {error.message.includes("rejected") ? "Connection rejected by user." : error.message}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </> // End of Fragment
  );
}

// No need for the extra "export default App;" - HomePage is the default export.
// Make sure you have a CSS rule for stripesAnimation if you use it. Example:
/*
@keyframes stripesAnimation {
  0% { background-position: 0 0; }
  100% { background-position: 400px 0; }
}
*/
