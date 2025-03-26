"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useAccount, useEnsAvatar } from "wagmi"
import { normalize } from "viem/ens"
import { getEnsName } from "./ensUtils"
import WhitelistedModal from "./WhitelistedModal"
import NotWhitelistedModal from "./NotWhitelistedModal"
import { isUserFollowedByGrado } from "./efpUtils"
import SpinningTriangleInCircle from './SpinningTriangleInCircle';


interface EnsDisplayProps {
  efpMessage: string
}

export function EnsDisplay({ efpMessage }: EnsDisplayProps) {
  const { address, isConnected } = useAccount()
  const [ensName, setEnsName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarErrorMessage, setAvatarErrorMessage] = useState<string | null>(null)
  const {
    data: avatarUrl,
    isLoading: avatarLoading,
    error: avatarError,
  } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  })

  const [isWhitelistedModalOpen, setIsWhitelistedModalOpen] = useState(false)
  const [isNotWhitelistedModalOpen, setIsNotWhitelistedModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [remainingCheckTime, setRemainingCheckTime] = useState<number | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isFirstTimeWhitelisted, setIsFirstTimeWhitelisted] = useState(false)

  const handleWhitelisted = useCallback((ensName: string, remainingTime?: number) => {
    setModalMessage(`${ensName} is whitelisted!`)
    setRemainingCheckTime(remainingTime)
    if (remainingTime === undefined) {
      setIsFirstTimeWhitelisted(true)
    } else {
      setIsFirstTimeWhitelisted(false)
    }
    setIsWhitelistedModalOpen(true)
  }, [])

  const handleNotWhitelisted = useCallback((ensName: string) => {
    setModalMessage(`${ensName} is not whitelisted.`)
    setIsNotWhitelistedModalOpen(true)
  }, [])

  const closeWhitelistedModal = () => {
    setIsWhitelistedModalOpen(false)
    setRemainingCheckTime(undefined)
    setIsFirstTimeWhitelisted(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const closeNotWhitelistedModal = () => {
    setIsNotWhitelistedModalOpen(false)
  }

  useEffect(() => {
    async function fetchEnsData() {
      if (isConnected && address) {
        setLoading(true)
        setError(null)
        try {
          const resolvedName = await getEnsName(address, process.env.NEXT_PUBLIC_ALCHEMY_ID)
          setEnsName(resolvedName)
        } catch (err) {
          setError("Error fetching ENS data.")
        } finally {
          setLoading(false)
        }
      } else {
        setEnsName(null)
      }
    }

    fetchEnsData()
  }, [address, isConnected])

  useEffect(() => {
    if (avatarError) {
      setAvatarErrorMessage(avatarError.message || String(avatarError))
    } else {
      setAvatarErrorMessage(null)
    }
  }, [avatarError])

  useEffect(() => {
    const checkWhitelist = async () => {
      if (ensName) {
        try {
          const response = await fetch("/api/whitelist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ensName }),
          })
          const data = await response.json()
          if (data.isWhitelisted) {
            handleWhitelisted(ensName, data.remainingTime)
          } else {
            handleNotWhitelisted(ensName)
          }
        } catch (error) {
        }
      }
    }

    checkWhitelist()
  }, [ensName, handleWhitelisted, handleNotWhitelisted])

  useEffect(() => {
    if (isWhitelistedModalOpen && remainingCheckTime !== undefined) {
      timerRef.current = setInterval(() => {
        setRemainingCheckTime((prevTime) => {
          if (prevTime && prevTime > 0) {
            return prevTime - 1
          } else {
            clearInterval(timerRef.current!)
            timerRef.current = null
            return undefined
          }
        })
      }, 60000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [isWhitelistedModalOpen, remainingCheckTime])

  useEffect(() => {
    if (isWhitelistedModalOpen && isFirstTimeWhitelisted && efpMessage === "grado.eth follows you!") {
      const audio = new Audio("/assets/beep.mp3")
      audio.play()
    }
  }, [isWhitelistedModalOpen, isFirstTimeWhitelisted, efpMessage])

  useEffect(() => {
    const checkEfpFollow = async () => {
      if (address) {
        try {
          await isUserFollowedByGrado(address)
        } catch (error) {
        }
      }
    }

    checkEfpFollow()
  }, [address])

  if (!isConnected) {
    return <p></p>
  }

  if (avatarErrorMessage) {
    return <p>Error fetching ENS avatar: {avatarErrorMessage}</p>
  }

  if (error) {
    return <p>Error fetching ENS profile: {error}</p>
  }

  if (loading || avatarLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
        <div
          <SpinningTriangleInCircle />
        </div>
        <p style={{ fontSize: "1.2em", color: "white", marginLeft: "10px" }}>Loading ENS profile...</p>
      </div>
    )
  }

  return (
    <div>
      {avatarUrl && (
        <img
          src={avatarUrl || "/placeholder.svg"}
          alt="ENS Avatar"
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />
      )}
      {ensName ? <p>ENS Name: {ensName}</p> : <p>No ENS name found for {address}</p>}
      {isWhitelistedModalOpen && (
        <WhitelistedModal message={modalMessage} remainingTime={remainingCheckTime} efpMessage={efpMessage} />
      )}
      {isNotWhitelistedModalOpen && <NotWhitelistedModal message={modalMessage} />}
    </div>
  )
}
