import { openHallidayPayments } from "@halliday-sdk/payments";
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

export const BuyIPButton = () => {
  const { address } = useAccount();
  
  const handleBuyIP = () => {
    openHallidayPayments({
      apiKey: import.meta.env.VITE_HALLIDAY_API_KEY,
      // Native $IP on Story (mainnet only - no testnet support in Halliday)
      outputs: ["story:0x"],
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
