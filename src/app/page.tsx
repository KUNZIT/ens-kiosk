"use client";

import { useAccount, useConnect, useDisconnect, Connector } from "wagmi";
import { EnsDisplay } from "./EnsDisplay";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isUserFollowedByGrado } from "./efpUtils";
import RunningInfoLine from "./RunningInfoLine";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";
import type { SerialPort } from "serialport";

// Define the AnimatedRainCanvasBackground component
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
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rainArray.forEach((drop) => {
        drop.y += drop.ySpeed;
        drop.x += drop.xSpeed;

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
          drop.xSpeed = Math.random() * 2 - 1;
          drop.ySpeed = Math.random() * 7 + 5;
        } else if (drop.x > canvas.width || drop.x < 0) {
           drop.y = -drop.length;
           drop.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = `rgba(17,41,255, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animateRain);
    };

    animateRain();
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
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

export default function HomePage() {
  const infoItems = [
    "Connect Wallet",
    "Display ENS",
    "Whitelisted",
    "grado.eth follow",
    "Play audio",
  ];

  // WAGMI/ENS Kiosk States
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

  // ARDUINO Control States
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [relayState, setRelayState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serialError, setSerialError] = useState<string | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const [writer, setWriter] = useState<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);

  const ARDUINO_LEONARDO_FILTERS = [
    { usbVendorId: 0x2341, usbProductId: 0x8036 },
    { usbVendorId: 0x2341, usbProductId: 0x0036 },
  ];

  // ARDUINO Control Functions
  const connectToArduino = useCallback(async (autoConnect = false) => {
    try {
      setIsLoading(true);
      setSerialError(null);
      setNeedsPermission(false);

      if (!navigator.serial) {
        throw new Error("Web Serial API is not supported in this browser.");
      }

      let selectedPort: SerialPort;

      if (autoConnect) {
        const ports = await navigator.serial.getPorts();
        const arduinoPort = ports.find((port) => {
          const info = port.getInfo();
          return ARDUINO_LEONARDO_FILTERS.some(
            (filter) => info.usbVendorId === filter.usbVendorId && info.usbProductId === filter.usbProductId,
          );
        });
        if (!arduinoPort) {
          setNeedsPermission(true);
          return;
        }
        selectedPort = arduinoPort;
      } else {
        selectedPort = await navigator.serial.requestPort({
          filters: ARDUINO_LEONARDO_FILTERS,
        });
      }

      await selectedPort.open({ baudRate: 9600 });
      const portReader = selectedPort.readable?.getReader();
      const portWriter = selectedPort.writable?.getWriter();

      if (!portReader || !portWriter) {
        throw new Error("Failed to get serial port reader/writer");
      }

      setPort(selectedPort);
      setReader(portReader);
      setWriter(portWriter);
      setIsConnected(true);

      setTimeout(async () => {
        try {
          await sendCommand("STATUS");
        } catch (testError) {
          console.log("Initial status check failed:", testError);
        }
      }, 1000);
    } catch (err) {
      if (!autoConnect) {
        setSerialError(err instanceof Error ? err.message : "Failed to connect to Arduino");
      }
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [setSerialError, setIsLoading, setNeedsPermission, setPort, setReader, setWriter, setIsConnected]);

  const disconnectFromArduino = useCallback(async () => {
    if (port) {
      try {
        if (reader) {
          await reader.cancel();
          await reader.releaseLock();
          setReader(null);
        }
        if (writer) {
          await writer.close();
          setWriter(null);
        }
        await port.close();
      } catch (err) {
        console.error("Error disconnecting from Arduino:", err);
      }
      setPort(null);
      setIsConnected(false);
      setRelayState(false);
      setAutoConnectAttempted(false);
    }
  }, [port, reader, writer]);

  const sendCommand = useCallback(
    async (command: string) => {
      if (!port || !writer || !isConnected) {
        setSerialError("Arduino not connected");
        return;
      }
      try {
        setIsLoading(true);
        setSerialError(null);
        const encoder = new TextEncoder();
        const data = encoder.encode(command + "\n");
        await writer.write(data);
      } catch (err) {
        setIsConnected(false);
        setSerialError(err instanceof Error ? err.message : "Failed to send command");
        console.error("Send command error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [port, writer, isConnected, setSerialError, setIsLoading, setIsConnected],
  );

  const operateRelay = useCallback(async () => {
    await sendCommand("RELAY_ON");
  }, [sendCommand]);

  // Combined useEffects for both apps
  useEffect(() => {
    // Wagmi/ENS kiosk timer logic
    if (account.isConnected) {
      setRemainingTime(30);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);

      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);

      timerTimeoutRef.current = setTimeout(() => {
        handleDisconnectLogic();
      }, 30000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      setRemainingTime(30);
      if (disconnectCompleteRef.current) {
        window.location.reload();
        disconnectCompleteRef.current = false;
      }
    }

    // Cleanup for this effect
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      if (connectionTimeout) clearTimeout(connectionTimeout);
    };
  }, [account.isConnected, disconnect, router, connectionTimeout]);

  useEffect(() => {
    // EFP check logic
    const checkEfpFollow = async () => {
      if (account.address) {
        setEfpMessage("Checking EFP status...");
        try {
          const isFollowed = await isUserFollowedByGrado(account.address);
          setEfpMessage(isFollowed ? "grado.eth follows you!" : "grado.eth does NOT follow you.");
        } catch (error) {
          console.error("Error checking EFP follow status:", error);
          setEfpMessage("Could not check EFP status.");
        }
      } else {
          setEfpMessage("");
      }
    };
    checkEfpFollow();
  }, [account.address]);

  useEffect(() => {
    // Wagmi connection error/success logic
    if (error && error.message.includes("Connection request reset")) {
      window.location.reload();
    }
    if (account.isConnected && connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
      setIsModalOpen(false);
    }
  }, [error, account.isConnected, connectionTimeout]);

  useEffect(() => {
    // Arduino auto-connect logic
    const attemptAutoConnect = async () => {
      if (!autoConnectAttempted && navigator.serial) {
        setAutoConnectAttempted(true);
        await connectToArduino(true);
      }
    };
    attemptAutoConnect();
  }, [connectToArduino, autoConnectAttempted]);

  useEffect(() => {
    // Arduino disconnect event listener
    const handleDisconnect = () => {
      console.log("Serial port disconnected");
      setPort(null);
      setIsConnected(false);
      setRelayState(false);
      setReader(null);
      setWriter(null);
      setAutoConnectAttempted(false);
      setTimeout(() => {
        connectToArduino(true);
      }, 1000);
    };
    if (navigator.serial) {
      navigator.serial.addEventListener("disconnect", handleDisconnect);
      return () => {
        navigator.serial.removeEventListener("disconnect", handleDisconnect);
      };
    }
  }, [connectToArduino]);

  // Wagmi/ENS Kiosk Handlers
  const handleConnect = (connector: Connector) => {
    setIsModalOpen(true);
    setIsButtonClicked(true);
    connect({ connector });
    if (connectionTimeout) clearTimeout(connectionTimeout);
    const timeoutId = setTimeout(() => {
      if (status === 'pending' || !account.isConnected) {
        window.location.reload();
      }
    }, 120000);
    setConnectionTimeout(timeoutId);
  };

  const handleDisconnectLogic = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    timerIntervalRef.current = null;
    timerTimeoutRef.current = null;
    disconnectCompleteRef.current = true;
    disconnect();
  };

  const handleDisconnect = () => {
    handleDisconnectLogic();
  };

  const isWebSerialSupported = typeof navigator !== "undefined" && "serial" in navigator;

  if (!isWebSerialSupported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-card rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">Web Serial Not Supported</h2>
          </div>
          <p className="text-muted-foreground">
            Your browser doesn't support Web Serial API. Please use Chrome 89+, Edge 89+, or another Chromium-based browser.
          </p>
        </div>
      </div>
    );
  }


  return (
    <>
      <RunningInfoLine
        infoTexts={infoItems}
        speed={60}
        fontWeight="bold"
      />

      <div style={{ textAlign: "center", marginTop: "2rem", position: 'relative', zIndex: 1 }}>
        <AnimatedRainCanvasBackground />

        <h2 className="ens-kiosk" style={{ zIndex: isModalOpen ? "50" : "100" }}>
        ENS KIOSK
      </h2>

        <div style={{ display: "flex", width: "100%", marginTop: "2rem", padding: '0 2rem', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
          {/* Left Panel */}
          <div
            style={{
              flex: "1",
              padding: "2rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: "5px",
              textAlign: "left",
              transition: "background-color 0.3s ease",
              color: 'white',
              marginRight: '1rem',
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
              backgroundColor: "transparent",
              borderRadius: "5px",
              color: 'white',
              marginLeft: '1rem',
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
                    backgroundColor: "transparent",
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
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Disconnect
                </button>
                <div style={{ marginTop: '0.5rem' }}>Time remaining: {remainingTime} seconds</div>
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
                      transition: remainingTime === 30 ? 'none' : "width 1s linear",
                    }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: 'column', gap: "1rem", marginBottom: "2rem" }}>
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      disabled={status === 'pending'}
                      onClick={() => handleConnect(connector)}
                      type="button"
                      style={{
                        padding: "1rem 2rem",
                        fontSize: "1rem",
                        background: isButtonClicked
                          ? "linear-gradient(to right, transparent 0px, #00BFFF 20px, rgba(0, 191, 255, 0) 40px)"
                          : "repeating-linear-gradient(to right, transparent, transparent 10px, rgb(3, 54, 126) 10px, rgb(3, 54, 126) 20px)",
                        color: "white",
                        border: "1px solid white",
                        borderRadius: "5px",
                        cursor: status === 'pending' ? 'wait' : 'pointer',
                        backgroundSize: "400px 100%",
                        animation: isButtonClicked ? "stripesAnimation 8s linear infinite" : "none",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        opacity: status === 'success' ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (status !== 'pending') e.currentTarget.style.background = "rgb(3, 54, 126)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isButtonClicked
                          ? "linear-gradient(to right, transparent 0px, #00BFFF 20px, rgba(0, 191, 255, 0) 40px)"
                          : "repeating-linear-gradient(to right, transparent, transparent 10px, rgb(3, 54, 126) 10px, rgb(3, 54, 126) 20px)";
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
            {/* Arduino buttons and status */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              {serialError && <div style={{color: 'red', marginBottom: '1rem'}}>{serialError}</div>}
              {needsPermission && !isConnected ? (
                <Button
                  onClick={() => connectToArduino(false)}
                  disabled={isLoading}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-2"
                >
                  {isLoading ? "Connecting..." : "Grant Connection"}
                </Button>
              ) : (
                <Button disabled className="bg-green-500 hover:bg-green-500 text-white cursor-default px-8 py-2">
                  Ready
                </Button>
              )}

              <Button
                onClick={operateRelay}
                disabled={!isConnected || isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
                size="lg"
              >
                {isLoading ? "Operating..." : "Operate Relay"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
