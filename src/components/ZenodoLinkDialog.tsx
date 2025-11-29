import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ZenodoLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  walletAddress: string;
  onSuccess: () => void;
}

export const ZenodoLinkDialog = ({ open, onOpenChange, articleId, walletAddress, onSuccess }: ZenodoLinkDialogProps) => {
  const [zenodoInput, setZenodoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const parseZenodoDOI = (input: string): string | null => {
    const trimmed = input.trim();
    
    // Already a DOI format
    if (trimmed.match(/^10\.\d+\/zenodo\.\d+$/)) {
      return trimmed;
    }
    
    // Extract from Zenodo URL
    const urlMatch = trimmed.match(/zenodo\.org\/records?\/(\d+)/);
    if (urlMatch) {
      return `10.5281/zenodo.${urlMatch[1]}`;
    }
    
    // Just a record number
    if (trimmed.match(/^\d+$/)) {
      return `10.5281/zenodo.${trimmed}`;
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const doi = parseZenodoDOI(zenodoInput);
    
    if (!doi) {
      toast({
        title: 'Invalid format',
        description: 'Please enter a valid Zenodo DOI, URL, or record ID',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('articles')
        .update({ zenodo_doi: doi })
        .eq('id', articleId)
        .ilike('wallet_address', walletAddress)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Update failed - you may not own this article');
      }

      toast({
        title: 'Success',
        description: 'Zenodo DOI linked successfully'
      });

      setZenodoInput('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error linking Zenodo DOI:', error);
      toast({
        title: 'Error',
        description: 'Failed to link Zenodo DOI',
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
          <DialogTitle>Link to Zenodo</DialogTitle>
          <DialogDescription>
            Enter the Zenodo DOI, URL, or record ID to link this article to your Zenodo deposit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="zenodo">Zenodo DOI or URL</Label>
              <Input
                id="zenodo"
                placeholder="10.5281/zenodo.17755770 or https://zenodo.org/records/17755770"
                value={zenodoInput}
                onChange={(e) => setZenodoInput(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: DOI (10.5281/zenodo.XXXXX), URL, or record ID
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !zenodoInput.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                'Link to Zenodo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
