import { configureChains, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { WalletConnectConnector } from '@wagmi/connectors/walletConnect';
import { alchemyProvider } from '@wagmi/core/providers/alchemy';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [
    alchemyProvider({
      apiKey: process.env.ALCHEMY_API_KEY || '',
    }),
  ]
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains };