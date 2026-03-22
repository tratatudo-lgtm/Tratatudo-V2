import.meta.env.VITE_API_URL import { useAuth } from './auth/AuthContext';
import.meta.env.VITE_API_URL import { HubArea, HubAction, UserPermissions } from '../types/team';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function usePermissions() {
import.meta.env.VITE_API_URL   const { user } = useAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const teamUser = user as any;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const isAdmin = !teamUser?.role || teamUser?.role === 'admin';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const can = (area: HubArea, action: HubAction): boolean => {
import.meta.env.VITE_API_URL     if (!teamUser) return false;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     // ADMIN → acesso total
import.meta.env.VITE_API_URL     if (isAdmin) return true;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const permissions: UserPermissions = teamUser.permissions || {};
import.meta.env.VITE_API_URL     const areaPermissions = permissions[area] || [];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     // 🔥 IMPORTANTE:
import.meta.env.VITE_API_URL     // "gerir" dá acesso total dentro da área
import.meta.env.VITE_API_URL     if (areaPermissions.includes('gerir')) return true;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     return areaPermissions.includes(action);
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const canSee = (area: HubArea): boolean => {
import.meta.env.VITE_API_URL     return can(area, 'ver') || can(area, 'ver_detalhe');
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return {
import.meta.env.VITE_API_URL     can,
import.meta.env.VITE_API_URL     canSee,
import.meta.env.VITE_API_URL     role: teamUser?.role || 'admin',
import.meta.env.VITE_API_URL     isAdmin
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL }