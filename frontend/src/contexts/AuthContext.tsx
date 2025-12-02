import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK MODE: START LOGGED OUT
    // In a real app, you would check for a token here
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const response = await api.post('/auth/register/', { email, password, username });
      if (response.user) {
         setUser(response.user);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      if (response.user) {
        setUser(response.user);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await api.post('/auth/password-reset/', { email });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, resetPassword, signOut }}>
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