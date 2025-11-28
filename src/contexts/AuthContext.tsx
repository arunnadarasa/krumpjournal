import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  walletAddress: string | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  walletAddress: undefined,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
