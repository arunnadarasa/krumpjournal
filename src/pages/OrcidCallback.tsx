import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrcidCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing ORCID verification...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (error) {
          throw new Error(`ORCID authorization failed: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!user || state !== user.id) {
          throw new Error('Invalid state parameter');
        }

        // Call edge function to complete OAuth flow
        const { data, error: callbackError } = await supabase.functions.invoke('orcid-callback', {
          body: { code, userId: user.id },
        });

        if (callbackError) throw callbackError;

        setStatus('success');
        setMessage(`Successfully linked ORCID iD: ${data.orcid}`);
        toast.success('ORCID iD linked successfully!');
        
        // Redirect after 2 seconds
        setTimeout(() => navigate('/submit'), 2000);
      } catch (err: any) {
        console.error('ORCID callback error:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to link ORCID iD');
        toast.error(err.message || 'Failed to link ORCID iD');
      }
    };

    if (user) {
      handleCallback();
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-sm border">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <h2 className="text-xl font-semibold">Verifying ORCID</h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-accent" />
              <h2 className="text-xl font-semibold text-accent">Success!</h2>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecting to submit page...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-semibold text-destructive">Error</h2>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={() => navigate('/submit')} className="mt-4">
                Back to Submit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}