import { defineChain } from 'viem';

// Story Testnet Configuration
export const STORY_TESTNET_CONFIG = defineChain({
  id: 1315,
  name: 'Story Testnet (Aeneid)',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://aeneid.storyrpc.io'] },
    public: { http: ['https://aeneid.storyrpc.io'] },
  },
  blockExplorers: {
    default: { 
      name: 'Story Explorer', 
      url: 'https://aeneid.explorer.story.foundation' 
    },
  },
  testnet: true,
});

// Story Mainnet Configuration
export const STORY_MAINNET_CONFIG = defineChain({
  id: 1514,
  name: 'Story Mainnet',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.storyrpc.io'] },
    public: { http: ['https://mainnet.storyrpc.io'] },
  },
  blockExplorers: {
    default: { 
      name: 'Story Explorer', 
      url: 'https://explorer.story.foundation' 
    },
  },
  testnet: false,
});

// SPG Contract Addresses
export const SPG_CONTRACTS = {
  testnet: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
  mainnet: import.meta.env.VITE_MAINNET_SPG_CONTRACT || '',
};

// Helper to get Story config by chain ID
export const getStoryConfig = (chainId: number) => {
  switch (chainId) {
    case 1315:
      return {
        chain: STORY_TESTNET_CONFIG,
        spgContract: SPG_CONTRACTS.testnet,
        network: 'testnet' as const,
      };
    case 1514:
      return {
        chain: STORY_MAINNET_CONFIG,
        spgContract: SPG_CONTRACTS.mainnet,
        network: 'mainnet' as const,
      };
    default:
      return {
        chain: STORY_TESTNET_CONFIG,
        spgContract: SPG_CONTRACTS.testnet,
        network: 'testnet' as const,
      };
  }
};

// Convert IPFS hash to gateway URL
export const convertIpfsToGateway = (ipfsHash: string): string => {
  if (ipfsHash.startsWith('ipfs://')) {
    return ipfsHash.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  if (ipfsHash.startsWith('Qm') || ipfsHash.startsWith('bafy')) {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return ipfsHash;
};
