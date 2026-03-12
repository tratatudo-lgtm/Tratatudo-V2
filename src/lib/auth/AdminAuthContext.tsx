import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminUser {
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/session`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        if (data.authenticated && data.email) {
          setAdmin({
            email: data.email,
            role: data.role || 'admin'
          });
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro ao iniciar sessão' }));
        throw new Error(error.error || 'Erro ao iniciar sessão');
      }

      const data = await response.json();

      if (!data.ok || !data.email) {
        throw new Error('Resposta do servidor inválida');
      }

      // Marca como autenticado imediatamente para evitar loop no redirect
      setAdmin({
        email: data.email,
        role: data.role || 'admin'
      });

      // Confirma a sessão depois, já com o cookie persistido
      setTimeout(() => {
        refreshSession();
      }, 300);

    } catch (error) {
      setAdmin(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setAdmin(null);
    } catch (error) {
      console.error('Error signing out admin:', error);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }

  return context;
}
