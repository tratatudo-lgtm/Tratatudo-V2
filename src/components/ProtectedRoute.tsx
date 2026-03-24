import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthContext';
import { usePermissions } from '../lib/usePermissions';
import type { PermissionModule } from '../types/hub';

interface Props {
  children: React.ReactNode;
  module?: PermissionModule;
  feature?: string;
}

export function ProtectedRoute({ children, module, feature }: Props) {
  const { user, loading } = useAuth();
  const { canSee } = usePermissions();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (module && !canSee(module)) {
    return <Navigate to="/app/billing" replace />;
  }

  if (feature && user.features && user.features[feature] === false) {
    return <Navigate to="/app/billing" replace />;
  }

  return <>{children}</>;
}
