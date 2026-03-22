import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { PermissionModule, PermissionAction } from '../types/hub';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: PermissionModule;
  action?: PermissionAction;
}

export function ProtectedRoute({ children, module, action = 'view' }: ProtectedRouteProps) {
  const { user, can, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (module && !can(module, action)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-6">
          <ShieldAlert className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">
          Acesso Negado
        </h1>
        <p className="text-slate-600 max-w-md mb-8">
          Não tem permissões suficientes para aceder a este módulo ({module}). 
          Por favor, contacte o administrador do sistema se acredita que isto é um erro.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
