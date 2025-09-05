"use client"

import { useAccount, useConnect, useDisconnect, type Connector } from "wagmi"
import { EnsDisplay } from "./EnsDisplay" // Assuming this path is correct
import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { isUserFollowedByGrado } from "./efpUtils" // Assuming this path is correct
import RunningInfoLine from "./RunningInfoLine" // Assuming this path is correct, might be '@/components/RunningInfoLine'
import { Button } from "@/components/ui/button"
import type { SerialPort } from "serialport"

const AnimatedRainCanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rainDrops = 300
  const rainArray: {
    x: number
    y: number
    length: number
    opacity: number
    xSpeed: number
    ySpeed: number
  }[] = []

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    for (let i = 0; i < rainDrops; i++) {
      rainArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 10 + 5,
        opacity: Math.random() * 0.5 + 0.5,
        xSpeed: Math.random() * 2 - 1,
        ySpeed: Math.random() * 7 + 5,
      })
    }

    let animationFrameId: number
    const animateRain = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      rainArray.forEach((drop) => {
        drop.y += drop.ySpeed
        drop.x += drop.xSpeed

        if (drop.y > canvas.height) {
          drop.y = -drop.length
          drop.x = Math.random() * canvas.width
          drop.xSpeed = Math.random() * 2 - 1
          drop.ySpeed = Math.random() * 7 + 5
        } else if (drop.x > canvas.width || drop.x < 0) {
          drop.y = -drop.length
          drop.x = Math.random() * canvas.width
        }

        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x, drop.y + drop.length)
        ctx.strokeStyle = `rgba(17,41,255, ${drop.opacity})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(animateRain)
    }

    animateRain()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    />
  )
}

export default function HomePage() {
  const infoItems = ["Connect Wallet", "Display ENS", "Whitelisted", "grado.eth follow", "Play audio"]

  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [remainingTime, setRemainingTime] = useState(30)
  const router = useRouter()
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disconnectCompleteRef = useRef(false)
  const [efpMessage, setEfpMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isButtonClicked, setIsButtonClicked] = useState(false)
  const [connectionTimeout, setConnectionTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [port, setPort] = useState<SerialPort | null>(null)
  const [isArduinoConnected, setIsArduinoConnected] = useState(false)
  const [isArduinoLoading, setIsArduinoLoading] = useState(false)
  const [arduinoError, setArduinoError] = useState<string | null>(null)
  const [reader, setReader] = useState<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const [writer, setWriter] = useState<WritableStreamDefaultWriter<Uint8Array> | null>(null)
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)

  const ARDUINO_LEONARDO_FILTERS = [
    { usbVendorId: 0x2341, usbProductId: 0x8036 }, // Arduino Leonardo
    { usbVendorId: 0x2341, usbProductId: 0x0036 }, // Arduino Leonardo (bootloader)
  ]

  const connectToArduino = useCallback(async (autoConnect = false) => {
    try {
      setIsArduinoLoading(true)
      setArduinoError(null)
      setNeedsPermission(false)

      if (!navigator.serial) {
        throw new Error("Web Serial API is not supported in this browser. Please use Chrome 89+ or Edge 89+")
      }

      let selectedPort: SerialPort

      if (autoConnect) {
        const ports = await navigator.serial.getPorts()
        const arduinoPort = ports.find((port) => {
          const info = port.getInfo()
          return ARDUINO_LEONARDO_FILTERS.some(
            (filter) => info.usbVendorId === filter.usbVendorId && info.usbProductId === filter.usbProductId,
          )
        })

        if (!arduinoPort) {
          console.log("[v0] No previously authorized Arduino Leonardo found for auto-connect")
          setNeedsPermission(true)
          return
        }
        selectedPort = arduinoPort
      } else {
        selectedPort = await navigator.serial.requestPort({
          filters: ARDUINO_LEONARDO_FILTERS,
        })
      }

      await selectedPort.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        flowControl: "none",
      })

      const portReader = selectedPort.readable?.getReader()
      const portWriter = selectedPort.writable?.getWriter()

      if (!portReader || !portWriter) {
        throw new Error("Failed to get serial port reader/writer")
      }

      setPort(selectedPort)
      setReader(portReader)
      setWriter(portWriter)
      setIsArduinoConnected(true)

      console.log("[v0] Arduino Leonardo connected via Web Serial API")
    } catch (err) {
      if (!autoConnect) {
        setArduinoError(err instanceof Error ? err.message : "Failed to connect to Arduino")
      }
      setIsArduinoConnected(false)
    } finally {
      setIsArduinoLoading(false)
    }
  }, [])

  const sendCommand = useCallback(
    async (command: string) => {
      if (!port || !writer || !isArduinoConnected) {
        setArduinoError("Arduino not connected")
        return
      }

      try {
        setIsArduinoLoading(true)
        setArduinoError(null)
        console.log(`[v0] Sending command: ${command}`)

        const encoder = new TextEncoder()
        const data = encoder.encode(command + "\n")

        await writer.write(data)
        console.log(`[v0] Command sent via Web Serial:`, command)
      } catch (err) {
        setIsArduinoConnected(false)
        setArduinoError(err instanceof Error ? err.message : "Failed to send command")
        console.error("[v0] Send command error:", err)
      } finally {
        setIsArduinoLoading(false)
      }
    },
    [port, writer, isArduinoConnected],
  )

  const operateRelay = useCallback(async () => {
    await sendCommand("RELAY_ON")
  }, [sendCommand])

  useEffect(() => {
    if (account.isConnected) {
      setRemainingTime(30)
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current)

      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 1) {
            return prevTime - 1
          } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
            return 0
          }
        })
      }, 1000)

      timerTimeoutRef.current = setTimeout(() => {
        handleDisconnectLogic()
      }, 30000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current)
        timerTimeoutRef.current = null
      }
      setRemainingTime(30)
      if (disconnectCompleteRef.current) {
        window.location.reload()
        disconnectCompleteRef.current = false
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current)
      if (connectionTimeout) clearTimeout(connectionTimeout)
    }
  }, [account.isConnected, disconnect, router, connectionTimeout])

  useEffect(() => {
    const checkEfpFollow = async () => {
      if (account.address) {
        setEfpMessage("Checking EFP status...")
        try {
          const isFollowed = await isUserFollowedByGrado(account.address)
          if (isFollowed) {
            setEfpMessage("grado.eth follows you!")
          } else {
            setEfpMessage("grado.eth does NOT follow you.")
          }
        } catch (error) {
          console.error("Error checking EFP follow status:", error)
          setEfpMessage("Could not check EFP status.")
        }
      } else {
        setEfpMessage("")
      }
    }

    checkEfpFollow()
  }, [account.address])

  useEffect(() => {
    if (error && error.message.includes("Connection request reset")) {
      console.log("Connection request reset detected, reloading.")
      window.location.reload()
    }
    if (account.isConnected && connectionTimeout) {
      clearTimeout(connectionTimeout)
      setConnectionTimeout(null)
      setIsModalOpen(false)
    }
  }, [error, account.isConnected, connectionTimeout])

  useEffect(() => {
    const attemptAutoConnect = async () => {
      if (!autoConnectAttempted && navigator.serial) {
        setAutoConnectAttempted(true)
        console.log("[v0] Attempting auto-connect to Arduino...")
        await connectToArduino(true)
      }
    }

    attemptAutoConnect()
  }, [connectToArduino, autoConnectAttempted])

  useEffect(() => {
    const handleDisconnect = (event: Event) => {
      console.log("[v0] Serial port disconnected")
      setPort(null)
      setIsArduinoConnected(false)
      setReader(null)
      setWriter(null)
      setAutoConnectAttempted(false)
      setTimeout(() => {
        connectToArduino(true)
      }, 1000)
    }

    if (navigator.serial) {
      navigator.serial.addEventListener("disconnect", handleDisconnect)
      return () => {
        navigator.serial.removeEventListener("disconnect", handleDisconnect)
      }
    }
  }, [connectToArduino])

  const handleConnect = (connector: Connector) => {
    setIsModalOpen(true)
    setIsButtonClicked(true)
    connect({ connector })

    if (connectionTimeout) clearTimeout(connectionTimeout)

    const timeoutId = setTimeout(() => {
      if (status === "pending" || !account.isConnected) {
        console.log("Connection timed out after 120s, reloading.")
        window.location.reload()
      }
    }, 120000)

    setConnectionTimeout(timeoutId)
  }

  const handleDisconnectLogic = () => {
    console.log("Disconnect triggered.")
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current)
    timerIntervalRef.current = null
    timerTimeoutRef.current = null

    disconnectCompleteRef.current = true
    disconnect()
  }

  const handleDisconnect = () => {
    handleDisconnectLogic()
  }

  const isWebSerialSupported = typeof navigator !== "undefined" && "serial" in navigator

  return (
    <>
      <RunningInfoLine infoTexts={infoItems} speed={60} fontWeight="bold" />

      <div style={{ textAlign: "center", marginTop: "2rem", position: "relative", zIndex: 1 }}>
        <AnimatedRainCanvasBackground />

        <h2 className="ens-kiosk" style={{ zIndex: isModalOpen ? "50" : "100" }}>
          ENS KIOSK
        </h2>

        <div
          style={{
            display: "flex",
            width: "100%",
            marginTop: "2rem",
            padding: "0 2rem",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              flex: "1",
              padding: "2rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: "5px",
              textAlign: "left",
              transition: "background-color 0.3s ease",
              color: "white",
              marginRight: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgb(3, 54, 126)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
            }}
          >
            <p>
              Welcome to the ENS kiosk! Simply connect your wallet to check out with your ENS profile. Tap the connect
              button and scan the QR code with your mobile wallet. If your name is whitelisted and grado.eth follows you
              on EFP, the app will play audio, a notification will appear. This kiosk will automatically disconnect
              after 30 seconds.
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
              backgroundColor: "transparent",
              borderRadius: "5px",
              color: "white",
              marginLeft: "1rem",
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
                    e.currentTarget.style.backgroundColor = "red"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  Disconnect
                </button>
                <div style={{ marginTop: "0.5rem" }}>Time remaining: {remainingTime} seconds</div>
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
                      transition: remainingTime === 30 ? "none" : "width 1s linear",
                    }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      disabled={status === "pending"}
                      onClick={() => {
                        handleConnect(connector)
                      }}
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
                        cursor: status === "pending" ? "wait" : "pointer",
                        backgroundSize: "400px 100%",
                        animation: isButtonClicked ? "stripesAnimation 8s linear infinite" : "none",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        opacity: status === "success" ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (status !== "pending") e.currentTarget.style.background = "rgb(3, 54, 126)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isButtonClicked
                          ? "linear-gradient(to right, transparent 0px, #00BFFF 20px, rgba(0, 191, 255, 0) 40px)"
                          : "repeating-linear-gradient(to right, transparent, transparent 10px, rgb(3, 54, 126) 10px, rgb(3, 54, 126) 20px)"
                      }}
                    >
                      {status === "pending" ? `Connecting...` : connector.name}
                    </button>
                  ))}
                </div>
                {status === "pending" && <p>Please approve connection in your wallet...</p>}
                {error && (
                  <p style={{ color: "red" }}>
                    Error: {error.message.includes("rejected") ? "Connection rejected by user." : error.message}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {isWebSerialSupported && (
          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
            {needsPermission && !isArduinoConnected ? (
              <Button
                onClick={() => connectToArduino(false)}
                disabled={isArduinoLoading}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  padding: "0.5rem 2rem",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isArduinoLoading ? "wait" : "pointer",
                }}
              >
                {isArduinoLoading ? "Connecting..." : "Grant Connection"}
              </Button>
            ) : (
              <Button
                disabled
                style={{
                  backgroundColor: "green",
                  color: "white",
                  padding: "0.5rem 2rem",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "default",
                }}
              >
                Ready
              </Button>
            )}

            <Button
              onClick={operateRelay}
              disabled={!isArduinoConnected || isArduinoLoading}
              style={{
                backgroundColor: isArduinoConnected ? "blue" : "gray",
                color: "white",
                padding: "0.75rem 2rem",
                fontSize: "1.1rem",
                border: "none",
                borderRadius: "5px",
                cursor: !isArduinoConnected || isArduinoLoading ? "not-allowed" : "pointer",
              }}
            >
              {isArduinoLoading ? "Operating..." : "Operate Relay"}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
