"use client"

import { useAccount, useConnect, useDisconnect, Connector } from "wagmi" // Import Connector type
import { EnsDisplay } from "./EnsDisplay"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { isUserFollowedByGrado } from "./efpUtils"

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [remainingTime, setRemainingTime] = useState(30)
  const router = useRouter()
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disconnectCompleteRef = useRef(false)
  const [efpMessage, setEfpMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (account.isConnected) {
      setRemainingTime(30)
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1
          } else {
            clearInterval(timerIntervalRef.current!)
            return 0
          }
        })
      }, 1000)

      timerTimeoutRef.current = setTimeout(() => {
        disconnect()
        disconnectCompleteRef.current = true
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
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current)
      }
    }
  }, [account.isConnected, disconnect, router])

  useEffect(() => {
    if (!account.isConnected && disconnectCompleteRef.current) {
      window.location.reload()
      disconnectCompleteRef.current = false
    }
  }, [account.isConnected])

  useEffect(() => {
    const checkEfpFollow = async () => {
      if (account.address) {
        try {
          const isFollowed = await isUserFollowedByGrado(account.address)
          if (isFollowed) {
            setEfpMessage("grado.eth follows you!")
          } else {
            setEfpMessage("grado.eth does NOT follow you.")
          }
        } catch (error) {}
      }
    }

    checkEfpFollow()
  }, [account.address])

  const handleConnect = (connector: Connector) => { // Add type annotation here
    setIsModalOpen(true);
    connect({ connector });
  };


   
  
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2 className="ens-kiosk" style={{ zIndex: isModalOpen ? "50" : "100" }}>
        ENS KIOSK
      </h2>

      <div style={{ display: "flex", width: "100%", marginTop: "2rem" }}>
        <div style={{ flex: "1", padding: "2rem", backgroundColor:  "rgba(0, 0, 0, 0.5)",border: "1px solid white",  borderRadius: "5px", textAlign: "left" }}>
          <p>
            Welcome to the ENS snack bar!
            Simply connect your wallet to check out with your ENS profile.
            Tap the connect button and scan the QR code with your mobile wallet.
            If your name is whitelisted and grado.eth folows you on EFP ,
            the app will unlock your snack bag and play audio ,a notification will appear.
            This kiosk will automatically disconnect after 30 seconds.
            
          </p>
        </div>

        <div style={{ flex: "1", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {account.status === "connected" ? (
            <>
              <EnsDisplay efpMessage={efpMessage} />
              <button
                type="button"
                onClick={() => disconnect()}
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
                  e.currentTarget.style.backgroundColor = "red"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black"
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
    setIsButtonClicked(true); // Set state to true on click
  }}
  type="button"
  style={{
    padding: "1rem 2rem",
    fontSize: "1rem",
    background: isButtonClicked
      ? "url('/your-image.jpg')" // Replace with your image path
      : "repeating-linear-gradient(to right, black, black 10px, blue 10px, blue 20px)",
    color: "white",
    border: "1px solid white",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundSize: 'cover', // Recommended for image backgrounds
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "blue";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = isButtonClicked
      ? "url('/your-image.jpg')"
      : "repeating-linear-gradient(to right, black, black 10px, blue 10px, blue 20px)";
  }}
>
  {connector.name}
</button>;
                ))}
              </div>
             
              <div>{error?.message}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
