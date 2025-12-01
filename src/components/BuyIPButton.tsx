import { openHallidayPayments } from "@halliday-sdk/payments";
import { useAccount, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

export const BuyIPButton = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const handleBuyIP = () => {
    // Story mainnet (1514) vs testnet (1315)
    const isMainnet = chainId === 1514;
    
    openHallidayPayments({
      apiKey: import.meta.env.VITE_HALLIDAY_API_KEY,
      // Native $IP on Story (per official Story Protocol docs)
      outputs: ["story:0x"],
      sandbox: !isMainnet, // sandbox mode for testnet
      windowType: "MODAL",
      ...(address && { destAddress: address }),
    });
  };
  
  return (
    <Button 
      onClick={handleBuyIP}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Coins className="h-4 w-4" />
      <span className="hidden sm:inline">Get IP</span>
    </Button>
  );
};
