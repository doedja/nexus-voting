import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const nexusChain = defineChain({
  id: 392,
  name: 'Nexus',
  network: 'nexus',
  nativeCurrency: {
    decimals: 18,
    name: 'Nexus',
    symbol: 'NEX',
  },
  rpcUrls: {
    default: { 
      http: [import.meta.env.VITE_NEXUS_RPC_URL],
      webSocket: ['wss://rpc.nexus.xyz/ws'],
    },
    public: { 
      http: [import.meta.env.VITE_NEXUS_RPC_URL],
      webSocket: ['wss://rpc.nexus.xyz/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.nexus.xyz' },
  },
});

export const config = getDefaultConfig({
  appName: 'Nexus Voting dApp',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [nexusChain],
}); 