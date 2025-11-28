import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export const WalletConnect = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button 
                    onClick={openConnectModal} 
                    variant="default"
                    className="font-medium gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button 
                    onClick={openChainModal} 
                    variant="destructive"
                    className="gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-destructive-foreground animate-pulse" />
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <span className="text-xs">
                      {chain.id === 1514 ? '🟢' : '🟡'}
                    </span>
                    <span className="hidden sm:inline font-mono text-xs">
                      {chain.name}
                    </span>
                  </Button>

                  <Button 
                    onClick={openAccountModal} 
                    variant="secondary"
                    size="sm"
                    className="font-mono text-xs gap-2"
                  >
                    <Wallet className="h-3 w-3" />
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
