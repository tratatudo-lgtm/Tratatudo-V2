import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { Navigate } from 'react-router-dom';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL import { Loader2 } from 'lucide-react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
import.meta.env.VITE_API_URL   const { isAuthenticated, loading } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-screen flex items-center justify-center bg-slate-50">
import.meta.env.VITE_API_URL         <Loader2 className="w-8 h-8 text-primary animate-spin" />
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (!isAuthenticated) {
import.meta.env.VITE_API_URL     return <Navigate to="/admin/login" replace />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return <>{children}</>;
import.meta.env.VITE_API_URL }
