import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { STORY_TESTNET_CONFIG, STORY_MAINNET_CONFIG } from '@/lib/storyConfig';

// Export chain configs for use in other files
export { STORY_TESTNET_CONFIG as storyTestnet, STORY_MAINNET_CONFIG as storyMainnet };

// Configure wallet connectors with explicit MetaMask priority
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'KrumpVerse Journal',
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID || '',
  }
);

// Create wagmi config with explicit transports for both networks
export const wagmiConfig = createConfig({
  connectors,
  chains: [STORY_TESTNET_CONFIG, STORY_MAINNET_CONFIG],
  transports: {
    [STORY_TESTNET_CONFIG.id]: http('https://aeneid.storyrpc.io'),
    [STORY_MAINNET_CONFIG.id]: http('https://mainnet.storyrpc.io'),
  },
  ssr: false,
});
