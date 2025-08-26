'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    // This would typically check a token in localStorage or cookies
    // and validate it with your backend
    const checkAuth = async () => {
      try {
        // Placeholder for authentication check
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Placeholder authentication functions
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would typically make an API call to your backend
      // Placeholder for demonstration
      setUser({
        id: '1',
        name: 'Demo User',
        email: email,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would typically make an API call to your backend
      // Placeholder for demonstration
      console.log('User registered:', { name, email });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // This would typically make an API call to your backend
      // Placeholder for demonstration
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>
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