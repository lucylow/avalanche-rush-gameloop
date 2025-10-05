import { createConfig, http } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// WalletConnect project ID from environment
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c3d6c0f0e8e7e8f0e8e7e8f0e8e7e8f0';

// Wagmi configuration for Avalanche Rush
export const config = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: 'Avalanche Rush',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://avalanche-rush.app',
      },
    }),
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: 'Avalanche Rush',
        description: 'Learn-to-earn educational gaming platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://avalanche-rush.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
});

export default config;

