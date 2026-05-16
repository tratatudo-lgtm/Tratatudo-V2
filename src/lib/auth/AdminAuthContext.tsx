import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../api';

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

const TOKEN_KEY = 'tratatudo_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = getAdminToken();
    const url = path.startsWith('http') ? path : API_URL + path;
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...options.headers,
      },
    });
  }, []);

  const refreshSession = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetchWithAuth('/api/admin/auth/session');
      const data = await res.json();
      if (data.ok && data.authenticated && data.email) {
        setAdmin({ email: data.email, role: data.role || 'admin' });
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setAdmin({
          email: data.data && data.data.user ? data.data.user.email : email,
          role: 'super_admin',
        });
      } else {
        throw new Error(data.error || 'Erro de autenticacao');
      }
    } catch (error) {
      setAdmin(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  };

  return (
    React.createElement(AdminAuthContext.Provider, { value: { admin, isAuthenticated: !!admin, loading, login, logout, refreshSession, fetchWithAuth } }, children)
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
