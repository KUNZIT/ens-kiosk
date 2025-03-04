import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
const projectId = process.env.WALLETCONNECT_PROJECT_ID;

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