import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  phone: string;
  client_id?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (phone: string) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/auth/session`;
    console.log(`[AUTH] Checking session: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log(`[AUTH] Session status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[AUTH] Session data:`, data);
        setUser({ 
          phone: data.phone,
          client_id: data.client_id
        });
      } else {
        const errorText = await response.text();
        console.warn(`[AUTH] No active session: ${errorText}`);
        setUser(null);
      }
    } catch (error) {
      console.error('[AUTH] Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = (phone: string) => {
    setUser({ 
      phone,
      client_id: `CL-${phone.replace(/\D/g, '').slice(-6)}`
    });
  };

  const signOut = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        signIn, 
        signOut, 
        refreshSession 
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
