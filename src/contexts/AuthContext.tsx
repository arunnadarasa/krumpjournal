import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  walletAddress: string | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: Tables<'profiles'> | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  walletAddress: undefined,
  isAuthenticated: false,
  isLoading: true,
  profile: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Fetch profile when user changes
        if (session?.user && address) {
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('wallet_address', address)
              .maybeSingle()
              .then(({ data }) => setProfile(data));
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session?.user && address) {
        supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', address)
          .maybeSingle()
          .then(({ data }) => setProfile(data));
      }
    });

    return () => subscription.unsubscribe();
  }, [address]);

  // Refetch profile when wallet address changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (address && session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', address)
          .maybeSingle();
        setProfile(data);
      }
    };

    fetchProfile();
  }, [address, session]);

  // Auto-login with wallet address
  useEffect(() => {
    const loginWithWallet = async () => {
      if (address && !session) {
        try {
          const { data, error } = await supabase.auth.signInAnonymously({
            options: {
              data: {
                wallet_address: address,
              }
            }
          });
          
          if (!error && data.user) {
            // Check if profile already exists for this wallet
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('wallet_address', address)
              .maybeSingle();

            if (!existingProfile) {
              // Only create if no profile exists for this wallet
              await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  wallet_address: address,
                });
            } else {
              // Profile exists with different id - migrate to new user id
              // This happens when same wallet reconnects and gets new anonymous session
              
              // Create new profile with current user id, copying existing data
              const { data: newProfile, error: migrateError } = await supabase
                .from('profiles')
                .upsert({
                  id: data.user.id,  // Use current session's user id
                  wallet_address: existingProfile.wallet_address,
                  orcid_id: existingProfile.orcid_id,
                  orcid_name: existingProfile.orcid_name,
                  orcid_verified: existingProfile.orcid_verified,
                })
                .select()
                .single();

              if (!migrateError && newProfile) {
                // Delete the old profile (orphaned)
                await supabase
                  .from('profiles')
                  .delete()
                  .eq('id', existingProfile.id)
                  .neq('id', data.user.id);  // Safety: don't delete if somehow same
                
                setProfile(newProfile);
              } else {
                console.error('Failed to migrate profile:', migrateError);
                setProfile(existingProfile);  // Fallback
              }
            }
          }
        } catch (err) {
          console.error('Wallet login error:', err);
        }
      }
    };

    loginWithWallet();
  }, [address, session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        walletAddress: address,
        isAuthenticated: !!session && !!address,
        isLoading,
        profile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
