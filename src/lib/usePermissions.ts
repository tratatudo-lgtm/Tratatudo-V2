import { useAuth } from './auth/AuthContext';
import { HubArea, HubAction, UserPermissions } from '../types/team';

export function usePermissions() {
  const { user } = useAuth();

  const teamUser = user as any;

  const isAdmin = !teamUser?.role || teamUser?.role === 'admin';

  const can = (area: HubArea, action: HubAction): boolean => {
    if (!teamUser) return false;

    // ADMIN → acesso total
    if (isAdmin) return true;

    const permissions: UserPermissions = teamUser.permissions || {};
    const areaPermissions = permissions[area] || [];

    // 🔥 IMPORTANTE:
    // "gerir" dá acesso total dentro da área
    if (areaPermissions.includes('gerir')) return true;

    return areaPermissions.includes(action);
  };

  const canSee = (area: HubArea): boolean => {
    return can(area, 'ver') || can(area, 'ver_detalhe');
  };

  return {
    can,
    canSee,
    role: teamUser?.role || 'admin',
    isAdmin
  };
}