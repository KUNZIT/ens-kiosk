import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

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