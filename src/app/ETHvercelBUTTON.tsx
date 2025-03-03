"use client"

import { useConnect } from "wagmi"
import type React from "react"

// Define proper types for the Button component
interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  children: React.ReactNode
}

// Simple button component with proper TypeScript types
const Button = ({ onClick, disabled, children }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md text-white font-semibold ${
      disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
    }`}
  >
    {children}
  </button>
)

export function ConnectButton() {
  const { connect, connectors, isLoading, error } = useConnect()

  // Debug logging
  console.log("Connectors:", connectors)

  // If no connectors, show error message
  if (!connectors || connectors.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <Button disabled>Wallet Connect Not Available</Button>
        <p className="text-red-500 text-sm">WalletConnect configuration issue. Check console for details.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <Button key={connector.uid} onClick={() => connect({ connector })} disabled={isLoading}>
          {isLoading ? "Connecting..." : `Connect with ${connector.name}`}
        </Button>
      ))}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  )
}

