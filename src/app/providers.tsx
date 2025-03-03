"use client"

import type React from "react"

import { createConfig, WagmiProvider, type Config } from "wagmi"
import { mainnet } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { walletConnect, injected } from "wagmi/connectors"
import { http } from "viem"

// Create a query client
const queryClient = new QueryClient()

// Make sure your WalletConnect ID is properly accessed
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID

if (!walletConnectProjectId) {
  console.error("WalletConnect Project ID is not set")
}

// Create wagmi config
const config: Config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [
    walletConnect({
      projectId: walletConnectProjectId!,
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

