"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { EnsDisplay } from "../EnsDisplay"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { isUserFollowedByGrado } from "../efpUtils"

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
  // Fix 1: Change type to array of numbers and initialize properly
  const [timerSectors, setTimerSectors] = useState<number[]>([])

  useEffect(() => {
    if (account.isConnected) {
      setRemainingTime(30)
      // Fix 2: Correct the syntax error in the Array.from callback
      setTimerSectors(Array.from({ length: 30 }, (_, i) => i + 1))

      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1
          } else {
            // Fix 3: Check if timerIntervalRef.current exists before clearing
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current)
            }
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
      // Fix 4: Initialize timerSectors as an empty array instead of undefined
      setTimerSectors([])
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current)
      }
    }
  }, [account.isConnected, disconnect])
  // Fix 5: Remove router from dependencies as it's not used in the effect

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
        } catch (error) {
          console.error("Error checking EFP follow status:", error)
        }
      }
    }

    checkEfpFollow()
  }, [account.address])

  // Fix 6: Remove redundant useEffect that also manipulates timerSectors
  // This effect was causing conflicts with the first effect that sets timerSectors
  // The logic for updating sectors is now handled in a single place

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Remember the current location is Latvia.
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Removed ConnectButton here */}
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl lg:static lg:w-auto dark:from-black dark:to-transparent lg:!bg-red-200">
        {account.isConnected && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", width: "300px", height: "10px", backgroundColor: "#f0f0f0" }}>
              {/* Fix 7: Add conditional check for timerSectors before mapping */}
              {timerSectors &&
                timerSectors.length > 0 &&
                timerSectors.map((sector) => (
                  <div
                    key={sector}
                    style={{
                      width: `${100 / 30}%`,
                      height: "100%",
                      backgroundColor: "green",
                    }}
                  />
                ))}
            </div>

            <p>Time remaining: {remainingTime} seconds</p>
            <EnsDisplay efpMessage={efpMessage} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ fontSize: "7rem", color: "blue" }}>ENS KIOSK</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                console.log("Connecting with:", connector.name)
                connect({ connector })
              }}
              type="button"
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "black",
                color: "white",
                border: "1px solid white",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "blue"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "black"
              }}
            >
              {connector.name}
            </button>
          ))}
        </div>
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </main>
  )
}

export default App

