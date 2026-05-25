import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { Loader2 } from 'lucide-react';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
