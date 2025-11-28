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
        if (session?.user) {
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
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
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
            // Create or update profile
            await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                wallet_address: address,
              });
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
