import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TransactionLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  walletAddress: string;
  onSuccess: () => void;
}

export const TransactionLinkDialog = ({
  open,
  onOpenChange,
  articleId,
  walletAddress,
  onSuccess,
}: TransactionLinkDialogProps) => {
  const [txInput, setTxInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const parseTransactionHash = (input: string): string | null => {
    const trimmed = input.trim();
    
    // If it's already a tx hash
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Extract from StoryScan URL (mainnet)
    const mainnetMatch = trimmed.match(/storyscan\.io\/tx\/(0x[a-fA-F0-9]{64})/);
    if (mainnetMatch) {
      return mainnetMatch[1];
    }
    
    // Extract from StoryScan URL (testnet)
    const testnetMatch = trimmed.match(/aeneid\.storyscan\.io\/tx\/(0x[a-fA-F0-9]{64})/);
    if (testnetMatch) {
      return testnetMatch[1];
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const txHash = parseTransactionHash(txInput);
    
    if (!txHash) {
      toast({
        title: 'Invalid Transaction Hash',
        description: 'Please enter a valid transaction hash (0x...) or StoryScan URL',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({ transaction_hash: txHash })
        .eq('id', articleId)
        .eq('wallet_address', walletAddress.toLowerCase())
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Update failed - you may not own this article');
      }

      toast({
        title: 'Success',
        description: 'Transaction linked successfully',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error linking transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to link transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Transaction Hash</DialogTitle>
          <DialogDescription>
            Enter the transaction hash or StoryScan URL for this article.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tx-input">Transaction Hash or URL</Label>
            <Input
              id="tx-input"
              placeholder="0x... or https://aeneid.storyscan.io/tx/0x..."
              value={txInput}
              onChange={(e) => setTxInput(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Linking...' : 'Link Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
