import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api'

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  // session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {

    // const mockUser = {
    //   id: 'mock-user-1',
    //   username: 'DreamExplorer',
    //   email: 'test@example.com'
    // };

    console.log("AuthContext: Setting mock user...");
    // setUser(mockUser);
    setUser(user)
    setLoading(false);
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          // Assumes an endpoint that returns the current user's info
          const userData = await api.get('/auth/me/');
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed', error);
          localStorage.removeItem('authToken');
          setUser(null);
        } finally {
          setLoading(false);
        }
    };


    const signUp = async (email: string, password: string, username: string) => {
        try {
          // Assumes standard registration endpoint
          const response = await api.post('/auth/register/', { email, password, username });
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            setUser(response.user);
          }
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
    };



    const signIn = async (email: string, password: string) => {
        try {
          // Assumes standard login endpoint
          const response = await api.post('/auth/login/', { email, password });
          if (response.token) {
            localStorage.setItem('authToken', response.token);

            // Fetch full user details if not provided in login response
            const userData = response.user || await api.get('/auth/me/');
            setUser(userData);
          }
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
    };


    const signOut = async () => {
        try {
          // Optional: Call logout endpoint if your backend requires token invalidation
          await api.post('/auth/logout/', {});
        } catch (e) {
          // Ignore logout errors
        }
        localStorage.removeItem('authToken');
        setUser(null);
    };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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
