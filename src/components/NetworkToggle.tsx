import { useSwitchChain, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { STORY_TESTNET_CONFIG, STORY_MAINNET_CONFIG, SPG_CONTRACTS } from '@/lib/storyConfig';

export const NetworkToggle = () => {
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const currentNetwork = chainId === 1514 ? 'mainnet' : 'testnet';
  const isMainnet = chainId === 1514;
  const mainnetConfigured = SPG_CONTRACTS.mainnet !== '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-xs">
            {isMainnet ? '🟢' : '🟡'} <span className="hidden sm:inline">{isMainnet ? 'Mainnet' : 'Testnet'}</span>
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchChain({ chainId: STORY_TESTNET_CONFIG.id })}
          disabled={chainId === STORY_TESTNET_CONFIG.id}
        >
          <span className="mr-2">🟡</span>
          Story Testnet
          {chainId === STORY_TESTNET_CONFIG.id && (
            <span className="ml-auto text-xs text-muted-foreground">Active</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchChain({ chainId: STORY_MAINNET_CONFIG.id })}
          disabled={chainId === STORY_MAINNET_CONFIG.id || !mainnetConfigured}
        >
          <span className="mr-2">🟢</span>
          Story Mainnet
          {chainId === STORY_MAINNET_CONFIG.id && (
            <span className="ml-auto text-xs text-muted-foreground">Active</span>
          )}
          {!mainnetConfigured && (
            <AlertCircle className="ml-2 h-3 w-3 text-destructive" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
