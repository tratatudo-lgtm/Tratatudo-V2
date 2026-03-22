import { useAuth } from './auth/AuthContext';
import { PermissionAction, PermissionModule, ROLE_PERMISSIONS, UserRole } from '../types/hub';

export function usePermissions() {
  const { user, can: authCan } = useAuth();
  
  const can = (module: PermissionModule, action: PermissionAction): boolean => {
    return authCan(module, action);
  };

  const canSee = (module: PermissionModule): boolean => can(module, 'view');

  return {
    can,
    canSee,
    role: user?.role || 'visualizador',
    isAdmin: user?.role === 'admin'
  };
}
