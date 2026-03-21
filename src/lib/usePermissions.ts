import { useAuth } from './auth/AuthContext';
import { HubArea, HubAction, UserPermissions } from '../types/team';

export function usePermissions() {
  const { user } = useAuth();
  
  // Cast to any to access role and permissions without modifying AuthContext
  const teamUser = user as any;

  const can = (area: HubArea, action: HubAction): boolean => {
    if (!teamUser) return false;
    
    // Admins have full access to everything
    // Default to admin if no role is present (compatibility with current system)
    if (!teamUser.role || teamUser.role === 'admin') return true;

    // Check specific permissions for members
    const permissions = (teamUser.permissions as UserPermissions) || {};
    const areaPermissions = permissions[area] || [];
    
    return areaPermissions.includes(action);
  };

  const canSee = (area: HubArea): boolean => can(area, 'ver');

  return {
    can,
    canSee,
    role: teamUser?.role || 'admin',
    isAdmin: !teamUser?.role || teamUser?.role === 'admin'
  };
}
