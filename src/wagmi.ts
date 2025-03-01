import { configureChains, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { WalletConnectConnector } from '@wagmi/connectors/walletConnect'; // Correct import path
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [mainnet, sepolia],
  [publicProvider()]
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
});

export { chains };