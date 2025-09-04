'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { refreshSession, isSessionExpiringSoon, setSessionTimeout } from '@/lib/session-management';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string, sessionTimeoutMinutes?: number) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserSession: () => Promise<boolean>;
  checkSessionExpiry: (warningMinutes?: number) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Get session from Supabase
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Check if session is about to expire
      if (session) {
        const expiringSoon = await isSessionExpiringSoon(15); // 15 minutes warning
        if (expiringSoon) {
          // Attempt to refresh the session
          const refreshed = await refreshUserSession();
          if (refreshed) {
            toast({
              title: "Session Extended",
              description: "Your login session has been automatically extended."
            });
          } else {
            toast({
              title: "Session Expiring",
              description: "Your session will expire soon. Please save your work and log in again.",
              variant: "destructive"
            });
          }
        }
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );
    
    // Set up periodic session check (every 5 minutes)
    const sessionCheckInterval = setInterval(async () => {
      const expiringSoon = await checkSessionExpiry(15);
      if (expiringSoon && session) {
        await refreshUserSession();
      }
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, sessionTimeoutMinutes = 60) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Set custom session timeout if provided
      await setSessionTimeout(sessionTimeoutMinutes);
      
      router.push('/polls');
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh the user session
  const refreshUserSession = async (): Promise<boolean> => {
    try {
      const newSession = await refreshSession();
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  // Function to check if the session is expiring soon
  const checkSessionExpiry = async (warningMinutes = 5): Promise<boolean> => {
    return await isSessionExpiringSoon(warningMinutes);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshUserSession,
        checkSessionExpiry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}