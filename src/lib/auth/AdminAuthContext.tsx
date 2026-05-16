import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, apiPost, apiGet } from '../api';

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
  fetchWithAuth: (path: string, options?: RequestInit) => Promise<Response>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const data = await apiGet('/api/admin/auth/session');
      if (data.authenticated && data.email) {
        setAdmin({ 
          email: data.data.user.email,
          role: data.data.admin?.role || 'admin'
        });
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
      const data = await apiPost('/api/admin/auth/login', { email, password });
      if (data.ok && data.data?.user?.email) {
        setAdmin({ 
          email: data.data.user.email,
          role: data.data.admin?.role || 'admin'
        });
      } else {
        throw new Error('Resposta do servidor inválida');
      }
    } catch (error) {
      setAdmin(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiPost('/api/admin/auth/logout');
      setAdmin(null);
    } catch (error) {
      console.error('Error signing out admin:', error);
      setAdmin(null);
    }
  };

  const fetchWithAuth = useCallback(async (path: string, options: RequestInit = {}) => {
    return apiFetch(path, options);
  }, []);

  return (
    <AdminAuthContext.Provider 
      value={{ 
        admin, 
        isAuthenticated: !!admin, 
        loading, 
        login, 
        logout, 
        refreshSession,
        fetchWithAuth
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
