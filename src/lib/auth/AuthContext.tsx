import.meta.env.VITE_API_URL import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface User {
import.meta.env.VITE_API_URL   phone_e164: string;
import.meta.env.VITE_API_URL   client_id: string;
import.meta.env.VITE_API_URL   company_name: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface AuthContextType {
import.meta.env.VITE_API_URL   user: User | null;
import.meta.env.VITE_API_URL   isAuthenticated: boolean;
import.meta.env.VITE_API_URL   loading: boolean;
import.meta.env.VITE_API_URL   signOut: () => Promise<void>;
import.meta.env.VITE_API_URL   refreshSession: () => Promise<boolean>;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const AuthContext = createContext<AuthContextType | undefined>(undefined);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AuthProvider({ children }: { children: React.ReactNode }) {
import.meta.env.VITE_API_URL   const [user, setUser] = useState<User | null>(null);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const refreshSession = useCallback(async () => {
import.meta.env.VITE_API_URL     const url = `${import.meta.env.VITE_API_URL}/api/auth/session`;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(url, {
import.meta.env.VITE_API_URL         method: 'GET',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       if (response.ok) {
import.meta.env.VITE_API_URL         const data = await response.json();
import.meta.env.VITE_API_URL         if (data.authenticated) {
import.meta.env.VITE_API_URL           setUser({ 
import.meta.env.VITE_API_URL             phone_e164: data.phone_e164,
import.meta.env.VITE_API_URL             client_id: data.client_id,
import.meta.env.VITE_API_URL             company_name: data.company_name
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           return true;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       setUser(null);
import.meta.env.VITE_API_URL       return false;
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       console.error('[AUTH] Session check failed:', error);
import.meta.env.VITE_API_URL       setUser(null);
import.meta.env.VITE_API_URL       return false;
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     refreshSession();
import.meta.env.VITE_API_URL   }, [refreshSession]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const signOut = async () => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { 
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       setUser(null);
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       console.error('Error signing out:', error);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <AuthContext.Provider 
import.meta.env.VITE_API_URL       value={{ 
import.meta.env.VITE_API_URL         user, 
import.meta.env.VITE_API_URL         isAuthenticated: !!user, 
import.meta.env.VITE_API_URL         loading, 
import.meta.env.VITE_API_URL         signOut, 
import.meta.env.VITE_API_URL         refreshSession 
import.meta.env.VITE_API_URL       }}
import.meta.env.VITE_API_URL     >
import.meta.env.VITE_API_URL       {children}
import.meta.env.VITE_API_URL     </AuthContext.Provider>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function useAuth() {
import.meta.env.VITE_API_URL   const context = useContext(AuthContext);
import.meta.env.VITE_API_URL   if (context === undefined) {
import.meta.env.VITE_API_URL     throw new Error('useAuth must be used within an AuthProvider');
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL   return context;
import.meta.env.VITE_API_URL }
