import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  phone_e164: string;
  client_id: string;
  company_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/auth/session`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser({ 
            phone_e164: data.phone_e164,
            client_id: data.client_id,
            company_name: data.company_name
          });
          return true;
        }
      }
      setUser(null);
      return false;
    } catch (error) {
      console.error('[AUTH] Session check failed:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

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
