import { createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';



export const config = createConfig({
  
  connectors: [ WalletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
    }),
  ],
  
});