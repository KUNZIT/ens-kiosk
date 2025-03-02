import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';
import { configureChains } from 'wagmi';

const { publicClient } = configureChains(
  [mainnet, sepolia],
  [
    alchemyProvider({
      apiKey: process.env.ALCHEMY_API_KEY || '',
    }),
  ]
);

export const config = createConfig({
  autoConnect: true,
  chains: [mainnet, sepolia],
  connectors: [
    new WalletConnectConnector({
      chains: [mainnet, sepolia],
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  publicClient,
});