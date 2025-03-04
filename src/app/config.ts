import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [mainnet, sepola],
  connectors: [
    
    walletConnect({ projectId }),
    
    
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})