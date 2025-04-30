"use client";

import { useAccount, useConnect, useDisconnect, Connector } from "wagmi";
import { EnsDisplay } from "./EnsDisplay";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { isUserFollowedByGrado } from "./efpUtils";
import { RunningInfoLine } from "./RunningInfoLine";

export default function HomePage() {
  const infoItems = [
    "Special offer this week only!",
    "New product launch announced for next month.",
    "Server maintenance scheduled for Sunday 2 AM.",
    "Follow us on social media for updates.",
    "Customer support hours extended."
  ];

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

    const animateRain = () => {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rainArray.forEach((drop) => {
        drop.y += drop.ySpeed;
        drop.x += drop.xSpeed;

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
          drop.xSpeed = Math.random() * 2 - 1;
        }

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(17,41,255,1)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      requestAnimationFrame(animateRain);
    };

    animateRain();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
      }}
    />
  );
};


function App() {
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

  useEffect(() => {
    if (account.isConnected) {
      setRemainingTime(30);
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timerIntervalRef.current!);
            return 0;
          }
        });
      }, 1000);

      timerTimeoutRef.current = setTimeout(() => {
        handleDisconnectLogic();
      }, 30000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current);
        timerTimeoutRef.current = null;
      }
      setRemainingTime(30);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (connectionTimeout !== null) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [account.isConnected, disconnect, router]);

  useEffect(() => {
    if (!account.isConnected && disconnectCompleteRef.current) {
      window.location.reload();
      disconnectCompleteRef.current = false;
    }
  }, [account.isConnected]);

  useEffect(() => {
    const checkEfpFollow = async () => {
      if (account.address) {
        try {
          const isFollowed = await isUserFollowedByGrado(account.address);
          if (isFollowed) {
            setEfpMessage("grado.eth follows you!");
          } else {
            setEfpMessage("grado.eth does NOT follow you.");
          }
        } catch (error) { }
      }
    };

    checkEfpFollow();
  }, [account.address]);

  const handleConnect = (connector: Connector) => {
    setIsModalOpen(true);
    connect({ connector });

    // Set a timeout to refresh the app if no connection within 120 seconds
    const timeoutId = setTimeout(() => {
      if (!account.isConnected) {
        window.location.reload();
      }
    }, 120000);

    setConnectionTimeout(timeoutId);
  };

  useEffect(() => {
    if (error && error.message.includes("Connection request reset")) {
      window.location.reload();
    }
    if (account.isConnected && connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
  }, [error, account.isConnected, connectionTimeout]);

  const handleDisconnectLogic = () => {
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current);
      timerTimeoutRef.current = null;
    }
    disconnect();
    disconnectCompleteRef.current = true; // Set the flag *before* reload
  };

  const handleDisconnect = () => {
    handleDisconnectLogic();
  };

  useEffect(() => {
    if (!account.isConnected && disconnectCompleteRef.current) {
      window.location.reload();
    }
  }, [account.isConnected]);

  return (

<div>
      {/* Add the RunningInfoLine component at the top */}
      <RunningInfoLine
        infoTexts={infoItems}
        speed={60}        // Optional: Adjust speed (default 50). Higher is faster.
        fontWeight="bold" // Optional: Adjust weight (default 'normal').
      />
  </div>

    
    <div  style={{ textAlign: "center", marginTop: "2rem" }}>
      <AnimatedRainCanvasBackground />
      <h2 className="ens-kiosk" style={{ zIndex: isModalOpen ? "50" : "100" }}>
        ENS KIOSK
      </h2>

      <div style={{ display: "flex", width: "100%", marginTop: "2rem" }}>
        <div
          style={{
            flex: "1",
            padding: "2rem",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "1px solid white",
            borderRadius: "5px",
            textAlign: "left",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgb(3, 54, 126)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
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

        <div
          style={{
            flex: "1",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {account.status === "connected" ? (
            <>
              <EnsDisplay efpMessage={efpMessage} />
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
              <div>Time remaining: {remainingTime} seconds</div>
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
                    transition: "width 1s linear",
                  }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      handleConnect(connector);
                      setIsButtonClicked(true);
                    }}
                    type="button"
                    style={{
                      padding: "1rem 2rem",
                      fontSize: "1rem",
                      background: isButtonClicked
                        ? "linear-gradient(to right, transparent 0px, #00BFFF 20px, rgba(0, 191, 255, 0) 40px)"
                        : "repeating-linear-gradient(to right, black, black 10px, rgb(3, 54, 126) 10px, rgb(3, 54, 126) 20px)",
                      color: "white",
                      border: "1px solid white",
                      borderRadius: "5px",
                      cursor: "pointer",
                      backgroundSize: "400px 100%",
                      animation: isButtonClicked ? "stripesAnimation 8s linear infinite" : "none",
                      backgroundColor: "rgba(0,0,0,0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgb(3, 54, 126)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isButtonClicked
                        ? "linear-gradient(to right, transparent 0px, #00BFFF 20px, rgba(0, 191, 255, 0) 40px)"
                        : "repeating-linear-gradient(to right, black, black 10px, rgb(3, 54, 126) 10px, rgb(3, 54, 126) 20px)";
                    }}
                  >
                    {connector.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
