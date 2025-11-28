import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { WalletClient, custom } from 'viem';
import { getStoryConfig } from './storyConfig';

export const createStoryClient = (
  walletClient: WalletClient,
  chainId: number
): StoryClient => {
  const config = getStoryConfig(chainId);
  
  const storyConfig: StoryConfig = {
    transport: custom(walletClient.transport),
    chainId: config.chain.id,
  };

  return StoryClient.newClient(storyConfig);
};
