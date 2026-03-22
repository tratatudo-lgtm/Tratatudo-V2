import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { Navigate } from 'react-router-dom';
import.meta.env.VITE_API_URL import { Loader2 } from 'lucide-react';
import.meta.env.VITE_API_URL import { useAuth } from '../lib/auth/AuthContext';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function ProtectedRoute({ children }: { children: React.ReactNode }) {
import.meta.env.VITE_API_URL   const { isAuthenticated, loading } = useAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="min-h-screen flex items-center justify-center bg-slate-50">
import.meta.env.VITE_API_URL         <div className="text-center space-y-4">
import.meta.env.VITE_API_URL           <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium">A verificar sessão...</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (!isAuthenticated) {
import.meta.env.VITE_API_URL     return <Navigate to="/login" replace />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return <>{children}</>;
import.meta.env.VITE_API_URL }
