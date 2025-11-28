import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getOrcidAuthUrl } from '@/lib/orcid';
import { CheckCircle2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const OrcidLink = () => {
  const { user, profile, walletAddress } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkOrcid = () => {
    if (!user || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    const state = walletAddress;
    const authUrl = getOrcidAuthUrl(state);
    window.location.href = authUrl;
  };

  if (!user) return null;

  if (profile?.orcid_verified && profile?.orcid_id) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          ORCID: {profile.orcid_id}
        </Badge>
      </div>
    );
  }

  return (
    <Button
      onClick={handleLinkOrcid}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LinkIcon className="w-4 h-4" />
      )}
      Link ORCID iD
    </Button>
  );
};