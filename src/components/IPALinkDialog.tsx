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

interface IPALinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  walletAddress: string;
  onSuccess: () => void;
}

export const IPALinkDialog = ({
  open,
  onOpenChange,
  articleId,
  walletAddress,
  onSuccess,
}: IPALinkDialogProps) => {
  const [ipaInput, setIpaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const parseIPAId = (input: string): string | null => {
    const trimmed = input.trim();
    
    // If it's already a hex address
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Extract from Story Explorer URL
    const explorerMatch = trimmed.match(/explorer\.story\.foundation\/ipa\/(0x[a-fA-F0-9]{40})/);
    if (explorerMatch) {
      return explorerMatch[1];
    }
    
    // Extract from testnet Explorer URL
    const testnetMatch = trimmed.match(/aeneid\.explorer\.story\.foundation\/ipa\/(0x[a-fA-F0-9]{40})/);
    if (testnetMatch) {
      return testnetMatch[1];
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const ipAssetId = parseIPAId(ipaInput);
    
    if (!ipAssetId) {
      toast({
        title: 'Invalid IPA ID',
        description: 'Please enter a valid IPA address (0x...) or Story Explorer URL',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({ ip_asset_id: ipAssetId })
        .eq('id', articleId)
        .ilike('wallet_address', walletAddress)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Update failed - you may not own this article');
      }

      toast({
        title: 'Success',
        description: 'IPA linked successfully',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error linking IPA:', error);
      toast({
        title: 'Error',
        description: 'Failed to link IPA. Please try again.',
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
          <DialogTitle>Link Story Protocol IPA</DialogTitle>
          <DialogDescription>
            Enter the IPA address or Story Explorer URL for this article.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ipa-input">IPA Address or URL</Label>
            <Input
              id="ipa-input"
              placeholder="0x... or https://aeneid.explorer.story.foundation/ipa/0x..."
              value={ipaInput}
              onChange={(e) => setIpaInput(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Linking...' : 'Link IPA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
