import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;


if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined in environment variables.");
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    
    walletConnect({ projectId }),
    
    
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})