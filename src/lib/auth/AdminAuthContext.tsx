import.meta.env.VITE_API_URL import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface AdminUser {
import.meta.env.VITE_API_URL   email: string;
import.meta.env.VITE_API_URL   role: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface AdminAuthContextType {
import.meta.env.VITE_API_URL   admin: AdminUser | null;
import.meta.env.VITE_API_URL   isAuthenticated: boolean;
import.meta.env.VITE_API_URL   loading: boolean;
import.meta.env.VITE_API_URL   login: (email: string, password: string) => Promise<void>;
import.meta.env.VITE_API_URL   logout: () => Promise<void>;
import.meta.env.VITE_API_URL   refreshSession: () => Promise<void>;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
import.meta.env.VITE_API_URL   const [admin, setAdmin] = useState<AdminUser | null>(null);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const refreshSession = useCallback(async () => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/session`, {
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       if (response.ok) {
import.meta.env.VITE_API_URL         const data = await response.json();
import.meta.env.VITE_API_URL         if (data.authenticated && data.email) {
import.meta.env.VITE_API_URL           setAdmin({ 
import.meta.env.VITE_API_URL             email: data.email,
import.meta.env.VITE_API_URL             role: data.role || 'admin'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL         } else {
import.meta.env.VITE_API_URL           setAdmin(null);
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         setAdmin(null);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       console.error('Error checking admin session:', error);
import.meta.env.VITE_API_URL       setAdmin(null);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     refreshSession();
import.meta.env.VITE_API_URL   }, [refreshSession]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const login = async (email: string, password: string) => {
import.meta.env.VITE_API_URL     setLoading(true);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/login`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({ email, password }),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!response.ok) {
import.meta.env.VITE_API_URL         const error = await response.json().catch(() => ({ error: 'Erro ao iniciar sessão' }));
import.meta.env.VITE_API_URL         throw new Error(error.error || 'Erro ao iniciar sessão');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const data = await response.json();
import.meta.env.VITE_API_URL       if (data.ok && data.email) {
import.meta.env.VITE_API_URL         setAdmin({ 
import.meta.env.VITE_API_URL           email: data.email,
import.meta.env.VITE_API_URL           role: data.role || 'admin'
import.meta.env.VITE_API_URL         });
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         throw new Error('Resposta do servidor inválida');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       setAdmin(null);
import.meta.env.VITE_API_URL       throw error;
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const logout = async () => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/logout`, { 
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       setAdmin(null);
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       console.error('Error signing out admin:', error);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <AdminAuthContext.Provider 
import.meta.env.VITE_API_URL       value={{ 
import.meta.env.VITE_API_URL         admin, 
import.meta.env.VITE_API_URL         isAuthenticated: !!admin, 
import.meta.env.VITE_API_URL         loading, 
import.meta.env.VITE_API_URL         login, 
import.meta.env.VITE_API_URL         logout, 
import.meta.env.VITE_API_URL         refreshSession 
import.meta.env.VITE_API_URL       }}
import.meta.env.VITE_API_URL     >
import.meta.env.VITE_API_URL       {children}
import.meta.env.VITE_API_URL     </AdminAuthContext.Provider>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function useAdminAuth() {
import.meta.env.VITE_API_URL   const context = useContext(AdminAuthContext);
import.meta.env.VITE_API_URL   if (context === undefined) {
import.meta.env.VITE_API_URL     throw new Error('useAdminAuth must be used within an AdminAuthProvider');
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL   return context;
import.meta.env.VITE_API_URL }
