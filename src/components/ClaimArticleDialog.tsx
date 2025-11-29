import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ClaimArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  walletAddress: string;
  onSuccess: () => void;
}

export const ClaimArticleDialog = ({ open, onOpenChange, articleId, walletAddress, onSuccess }: ClaimArticleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClaim = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('articles')
        .update({ wallet_address: walletAddress })
        .eq('id', articleId)
        .is('wallet_address', null)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Failed to claim article - it may already be claimed');
      }

      toast({
        title: 'Success',
        description: 'Article claimed successfully. You can now link Zenodo DOI.'
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error claiming article:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim article',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Article Ownership</DialogTitle>
          <DialogDescription>
            This article doesn't have an associated wallet address yet. By claiming it, you'll be able to link
            Zenodo DOI, IPA, and transaction details to this article.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleClaim} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim Article'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
