"use client"

import type React from "react"

import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { walletConnect, injected } from "wagmi/connectors"

// Create a query client
const queryClient = new QueryClient()

// Make sure your WalletConnect ID is properly accessed
const walletConnectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID

// Create wagmi config with explicit connectors
export const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [
    walletConnect({
      projectId: walletConnectId || "", // Fallback to empty string if undefined
      metadata: {
        name: "ENS Kiosk",
        description: "ENS Profile Display",
        url: "https://ens-kiosk.vercel.app",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
    }),
    injected(),
  ],
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

