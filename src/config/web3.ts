import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';

// Story Protocol Testnet (Aeneid)
export const storyTestnet: Chain = {
  id: 1315,
  name: 'Story Testnet (Aeneid)',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
    public: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'Story Explorer', url: 'https://aeneid.explorer.story.foundation' },
  },
  testnet: true,
};

// Story Protocol Mainnet
export const storyMainnet: Chain = {
  id: 1514,
  name: 'Story Mainnet',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.storyrpc.io'] },
    public: { http: ['https://mainnet.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'Story Explorer', url: 'https://explorer.story.foundation' },
  },
  testnet: false,
};

// SPG Contract Addresses
export const SPG_CONTRACTS = {
  testnet: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
  mainnet: '', // User must deploy their own
};

export const wagmiConfig = getDefaultConfig({
  appName: 'KrumpVerse Journal',
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID || '',
  chains: [storyTestnet],
  ssr: false,
});
