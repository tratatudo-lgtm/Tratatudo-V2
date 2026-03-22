import.meta.env.VITE_API_URL import React, { useEffect, useMemo, useState } from 'react';
import.meta.env.VITE_API_URL import {
import.meta.env.VITE_API_URL   Users,
import.meta.env.VITE_API_URL   UserPlus,
import.meta.env.VITE_API_URL   Shield,
import.meta.env.VITE_API_URL   Mail,
import.meta.env.VITE_API_URL   Check,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   Search,
import.meta.env.VITE_API_URL   ShieldCheck,
import.meta.env.VITE_API_URL   Clock,
import.meta.env.VITE_API_URL   Trash2,
import.meta.env.VITE_API_URL   Lock,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   RefreshCw
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { cn } from '../../lib/utils';
import.meta.env.VITE_API_URL import { toast } from 'sonner';
import.meta.env.VITE_API_URL import {
import.meta.env.VITE_API_URL   TeamMember,
import.meta.env.VITE_API_URL   HubArea,
import.meta.env.VITE_API_URL   HubAction,
import.meta.env.VITE_API_URL   TEAM_AREAS,
import.meta.env.VITE_API_URL   TEAM_ACTIONS,
import.meta.env.VITE_API_URL   UserPermissions
import.meta.env.VITE_API_URL } from '../../types/team';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL function buildAvatar(name: string) {
import.meta.env.VITE_API_URL   return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL function normalizeMember(raw: any): TeamMember {
import.meta.env.VITE_API_URL   return {
import.meta.env.VITE_API_URL     id: String(raw?.id ?? ''),
import.meta.env.VITE_API_URL     name: raw?.name || raw?.full_name || raw?.email || 'Utilizador',
import.meta.env.VITE_API_URL     email: raw?.email || '',
import.meta.env.VITE_API_URL     role: raw?.role === 'admin' ? 'admin' : 'member',
import.meta.env.VITE_API_URL     permissions: (raw?.permissions || {}) as UserPermissions,
import.meta.env.VITE_API_URL     status:
import.meta.env.VITE_API_URL       raw?.status === 'active' || raw?.status === 'invited' || raw?.status === 'suspended'
import.meta.env.VITE_API_URL         ? raw.status
import.meta.env.VITE_API_URL         : 'active',
import.meta.env.VITE_API_URL     created_at: raw?.created_at || new Date().toISOString(),
import.meta.env.VITE_API_URL     last_login: raw?.last_login || undefined,
import.meta.env.VITE_API_URL     avatar_url: raw?.avatar_url || buildAvatar(raw?.name || raw?.email || 'User')
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Team() {
import.meta.env.VITE_API_URL   const [members, setMembers] = useState<TeamMember[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [savingPermissions, setSavingPermissions] = useState(false);
import.meta.env.VITE_API_URL   const [inviting, setInviting] = useState(false);
import.meta.env.VITE_API_URL   const [removingId, setRemovingId] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [searchQuery, setSearchQuery] = useState('');
import.meta.env.VITE_API_URL   const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
import.meta.env.VITE_API_URL   const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
import.meta.env.VITE_API_URL   const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchMembers = async () => {
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${BASE_URL}/api/client/team`,
import.meta.env.VITE_API_URL       `${BASE_URL}/api/team`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     let lastError: any = null;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           if (!res.ok) {
import.meta.env.VITE_API_URL             if (res.status === 401) {
import.meta.env.VITE_API_URL               throw new Error('Sessão expirada. Por favor, faça login novamente.');
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL             throw new Error('Falha ao carregar equipa.');
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           const json = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL           const rawMembers = json?.members || json?.team || json?.data?.members || json?.data || [];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           if (Array.isArray(rawMembers)) {
import.meta.env.VITE_API_URL             setMembers(rawMembers.map(normalizeMember));
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           throw new Error('Resposta inválida da equipa.');
import.meta.env.VITE_API_URL         } catch (error) {
import.meta.env.VITE_API_URL           lastError = error;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar equipa.');
import.meta.env.VITE_API_URL     } catch (error: any) {
import.meta.env.VITE_API_URL       toast.error(error?.message || 'Erro ao carregar equipa.');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         setMembers([
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '1',
import.meta.env.VITE_API_URL             name: 'Admin Principal',
import.meta.env.VITE_API_URL             email: 'admin@tratatudo.pt',
import.meta.env.VITE_API_URL             role: 'admin',
import.meta.env.VITE_API_URL             permissions: {},
import.meta.env.VITE_API_URL             status: 'active',
import.meta.env.VITE_API_URL             created_at: new Date().toISOString(),
import.meta.env.VITE_API_URL             avatar_url: buildAvatar('Admin Principal')
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '2',
import.meta.env.VITE_API_URL             name: 'João Silva',
import.meta.env.VITE_API_URL             email: 'joao@tratatudo.pt',
import.meta.env.VITE_API_URL             role: 'member',
import.meta.env.VITE_API_URL             permissions: {
import.meta.env.VITE_API_URL               dashboard: ['ver'],
import.meta.env.VITE_API_URL               pedidos: ['ver', 'ver_detalhe', 'criar', 'editar', 'alterar_estado'],
import.meta.env.VITE_API_URL               mensagens: ['ver', 'responder']
import.meta.env.VITE_API_URL             },
import.meta.env.VITE_API_URL             status: 'active',
import.meta.env.VITE_API_URL             created_at: new Date().toISOString(),
import.meta.env.VITE_API_URL             avatar_url: buildAvatar('João Silva')
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '3',
import.meta.env.VITE_API_URL             name: 'Maria Santos',
import.meta.env.VITE_API_URL             email: 'maria@tratatudo.pt',
import.meta.env.VITE_API_URL             role: 'member',
import.meta.env.VITE_API_URL             permissions: {
import.meta.env.VITE_API_URL               vendas: ['ver', 'ver_detalhe', 'criar', 'editar', 'gerir'],
import.meta.env.VITE_API_URL               mensagens: ['ver', 'responder']
import.meta.env.VITE_API_URL             },
import.meta.env.VITE_API_URL             status: 'invited',
import.meta.env.VITE_API_URL             created_at: new Date().toISOString(),
import.meta.env.VITE_API_URL             avatar_url: buildAvatar('Maria Santos')
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         ]);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchMembers();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredMembers = useMemo(() => {
import.meta.env.VITE_API_URL     const q = searchQuery.trim().toLowerCase();
import.meta.env.VITE_API_URL     if (!q) return members;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     return members.filter(
import.meta.env.VITE_API_URL       (m) =>
import.meta.env.VITE_API_URL         m.name.toLowerCase().includes(q) ||
import.meta.env.VITE_API_URL         m.email.toLowerCase().includes(q)
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }, [members, searchQuery]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleTogglePermission = (area: HubArea, action: HubAction) => {
import.meta.env.VITE_API_URL     if (!selectedMember || selectedMember.role === 'admin') return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const currentPermissions: UserPermissions = { ...(selectedMember.permissions || {}) };
import.meta.env.VITE_API_URL     const areaPerms = currentPermissions[area] || [];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     if (areaPerms.includes(action)) {
import.meta.env.VITE_API_URL       const next = areaPerms.filter((a) => a !== action);
import.meta.env.VITE_API_URL       if (next.length > 0) currentPermissions[area] = next;
import.meta.env.VITE_API_URL       else delete currentPermissions[area];
import.meta.env.VITE_API_URL     } else {
import.meta.env.VITE_API_URL       currentPermissions[area] = [...areaPerms, action];
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     setSelectedMember({
import.meta.env.VITE_API_URL       ...selectedMember,
import.meta.env.VITE_API_URL       permissions: currentPermissions
import.meta.env.VITE_API_URL     });
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSavePermissions = async () => {
import.meta.env.VITE_API_URL     if (!selectedMember) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setSavingPermissions(true);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const endpoints = [
import.meta.env.VITE_API_URL         `${BASE_URL}/api/client/team/${selectedMember.id}/permissions`,
import.meta.env.VITE_API_URL         `${BASE_URL}/api/team/${selectedMember.id}/permissions`
import.meta.env.VITE_API_URL       ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       let saved = false;
import.meta.env.VITE_API_URL       let lastError: any = null;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             method: 'PATCH',
import.meta.env.VITE_API_URL             headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL             credentials: 'include',
import.meta.env.VITE_API_URL             body: JSON.stringify({
import.meta.env.VITE_API_URL               permissions: selectedMember.permissions
import.meta.env.VITE_API_URL             })
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           if (!res.ok) {
import.meta.env.VITE_API_URL             const json = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL             throw new Error(json?.error || 'Erro ao guardar permissões.');
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           saved = true;
import.meta.env.VITE_API_URL           break;
import.meta.env.VITE_API_URL         } catch (error) {
import.meta.env.VITE_API_URL           lastError = error;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!saved) {
import.meta.env.VITE_API_URL         if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL           setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? selectedMember : m)));
import.meta.env.VITE_API_URL           toast.success(`Permissões de ${selectedMember.name} atualizadas.`);
import.meta.env.VITE_API_URL           setIsPermissionsModalOpen(false);
import.meta.env.VITE_API_URL           return;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL         throw lastError || new Error('Erro ao guardar permissões.');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? selectedMember : m)));
import.meta.env.VITE_API_URL       toast.success(`Permissões de ${selectedMember.name} atualizadas.`);
import.meta.env.VITE_API_URL       setIsPermissionsModalOpen(false);
import.meta.env.VITE_API_URL     } catch (error: any) {
import.meta.env.VITE_API_URL       toast.error(error?.message || 'Erro ao guardar permissões.');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setSavingPermissions(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleInviteMember = async (e: React.FormEvent<HTMLFormElement>) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const formData = new FormData(e.currentTarget);
import.meta.env.VITE_API_URL     const email = String(formData.get('email') || '').trim();
import.meta.env.VITE_API_URL     const name = String(formData.get('name') || '').trim();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     if (!name || !email) {
import.meta.env.VITE_API_URL       toast.error('Preencha nome e email.');
import.meta.env.VITE_API_URL       return;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setInviting(true);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const endpoints = [
import.meta.env.VITE_API_URL         `${BASE_URL}/api/client/team/invite`,
import.meta.env.VITE_API_URL         `${BASE_URL}/api/team/invite`
import.meta.env.VITE_API_URL       ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       let invited = false;
import.meta.env.VITE_API_URL       let responseMember: TeamMember | null = null;
import.meta.env.VITE_API_URL       let lastError: any = null;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             method: 'POST',
import.meta.env.VITE_API_URL             headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL             credentials: 'include',
import.meta.env.VITE_API_URL             body: JSON.stringify({
import.meta.env.VITE_API_URL               name,
import.meta.env.VITE_API_URL               email,
import.meta.env.VITE_API_URL               permissions: { dashboard: ['ver'] }
import.meta.env.VITE_API_URL             })
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           if (!res.ok) {
import.meta.env.VITE_API_URL             const json = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL             throw new Error(json?.error || 'Erro ao enviar convite.');
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           const json = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL           responseMember = normalizeMember(json?.member || json?.user || { name, email, role: 'member', status: 'invited' });
import.meta.env.VITE_API_URL           invited = true;
import.meta.env.VITE_API_URL           break;
import.meta.env.VITE_API_URL         } catch (error) {
import.meta.env.VITE_API_URL           lastError = error;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!invited) {
import.meta.env.VITE_API_URL         if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL           const newMember: TeamMember = {
import.meta.env.VITE_API_URL             id: Math.random().toString(36).slice(2, 11),
import.meta.env.VITE_API_URL             name,
import.meta.env.VITE_API_URL             email,
import.meta.env.VITE_API_URL             role: 'member',
import.meta.env.VITE_API_URL             permissions: { dashboard: ['ver'] },
import.meta.env.VITE_API_URL             status: 'invited',
import.meta.env.VITE_API_URL             created_at: new Date().toISOString(),
import.meta.env.VITE_API_URL             avatar_url: buildAvatar(name)
import.meta.env.VITE_API_URL           };
import.meta.env.VITE_API_URL           setMembers((prev) => [newMember, ...prev]);
import.meta.env.VITE_API_URL           toast.success(`Convite enviado para ${email}`);
import.meta.env.VITE_API_URL           setIsInviteModalOpen(false);
import.meta.env.VITE_API_URL           e.currentTarget.reset();
import.meta.env.VITE_API_URL           return;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL         throw lastError || new Error('Erro ao enviar convite.');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (responseMember) {
import.meta.env.VITE_API_URL         setMembers((prev) => [responseMember!, ...prev.filter((m) => m.id !== responseMember!.id)]);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       toast.success(`Convite enviado para ${email}`);
import.meta.env.VITE_API_URL       setIsInviteModalOpen(false);
import.meta.env.VITE_API_URL       e.currentTarget.reset();
import.meta.env.VITE_API_URL     } catch (error: any) {
import.meta.env.VITE_API_URL       toast.error(error?.message || 'Erro ao enviar convite.');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setInviting(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleDeleteMember = async (member: TeamMember) => {
import.meta.env.VITE_API_URL     if (member.role === 'admin') {
import.meta.env.VITE_API_URL       toast.error('Não podes remover um administrador por aqui.');
import.meta.env.VITE_API_URL       return;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const confirmed = window.confirm(`Remover ${member.name}?`);
import.meta.env.VITE_API_URL     if (!confirmed) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setRemovingId(member.id);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const endpoints = [
import.meta.env.VITE_API_URL         `${BASE_URL}/api/client/team/${member.id}`,
import.meta.env.VITE_API_URL         `${BASE_URL}/api/team/${member.id}`
import.meta.env.VITE_API_URL       ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       let deleted = false;
import.meta.env.VITE_API_URL       let lastError: any = null;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             method: 'DELETE',
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           if (!res.ok) {
import.meta.env.VITE_API_URL             const json = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL             throw new Error(json?.error || 'Erro ao remover colaborador.');
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           deleted = true;
import.meta.env.VITE_API_URL           break;
import.meta.env.VITE_API_URL         } catch (error) {
import.meta.env.VITE_API_URL           lastError = error;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!deleted) {
import.meta.env.VITE_API_URL         if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL           setMembers((prev) => prev.filter((m) => m.id !== member.id));
import.meta.env.VITE_API_URL           toast.success('Colaborador removido.');
import.meta.env.VITE_API_URL           return;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL         throw lastError || new Error('Erro ao remover colaborador.');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       setMembers((prev) => prev.filter((m) => m.id !== member.id));
import.meta.env.VITE_API_URL       toast.success('Colaborador removido.');
import.meta.env.VITE_API_URL     } catch (error: any) {
import.meta.env.VITE_API_URL       toast.error(error?.message || 'Erro ao remover colaborador.');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setRemovingId(null);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-6">
import.meta.env.VITE_API_URL       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
import.meta.env.VITE_API_URL             <Users className="w-8 h-8 text-primary" />
import.meta.env.VITE_API_URL             Gestão de Equipa
import.meta.env.VITE_API_URL           </h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500">Gerencie os acessos e permissões dos seus colaboradores.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="flex gap-2 w-full sm:w-auto">
import.meta.env.VITE_API_URL           <button
import.meta.env.VITE_API_URL             onClick={fetchMembers}
import.meta.env.VITE_API_URL             className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <RefreshCw className="w-4 h-4" />
import.meta.env.VITE_API_URL             Atualizar
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <button
import.meta.env.VITE_API_URL             onClick={() => setIsInviteModalOpen(true)}
import.meta.env.VITE_API_URL             className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <UserPlus className="w-4 h-4" /> Convidar Membro
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
import.meta.env.VITE_API_URL         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
import.meta.env.VITE_API_URL           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
import.meta.env.VITE_API_URL             <Users className="w-6 h-6" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Membros</p>
import.meta.env.VITE_API_URL             <p className="text-xl font-bold text-slate-900">{members.length}</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
import.meta.env.VITE_API_URL           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
import.meta.env.VITE_API_URL             <ShieldCheck className="w-6 h-6" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administradores</p>
import.meta.env.VITE_API_URL             <p className="text-xl font-bold text-slate-900">{members.filter((m) => m.role === 'admin').length}</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
import.meta.env.VITE_API_URL           <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
import.meta.env.VITE_API_URL             <Clock className="w-6 h-6" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendentes</p>
import.meta.env.VITE_API_URL             <p className="text-xl font-bold text-slate-900">{members.filter((m) => m.status === 'invited').length}</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="relative">
import.meta.env.VITE_API_URL         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
import.meta.env.VITE_API_URL         <input
import.meta.env.VITE_API_URL           type="text"
import.meta.env.VITE_API_URL           placeholder="Pesquisar por nome ou email..."
import.meta.env.VITE_API_URL           value={searchQuery}
import.meta.env.VITE_API_URL           onChange={(e) => setSearchQuery(e.target.value)}
import.meta.env.VITE_API_URL           className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
import.meta.env.VITE_API_URL         />
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
import.meta.env.VITE_API_URL         {loading ? (
import.meta.env.VITE_API_URL           <div className="p-12 flex flex-col items-center justify-center gap-3">
import.meta.env.VITE_API_URL             <Loader2 className="w-8 h-8 text-primary animate-spin" />
import.meta.env.VITE_API_URL             <p className="text-slate-500 font-medium">A carregar equipa...</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         ) : filteredMembers.length === 0 ? (
import.meta.env.VITE_API_URL           <div className="p-12 text-center">
import.meta.env.VITE_API_URL             <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
import.meta.env.VITE_API_URL             <p className="text-slate-500 font-medium">Nenhum membro encontrado.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         ) : (
import.meta.env.VITE_API_URL           <div className="divide-y divide-slate-100">
import.meta.env.VITE_API_URL             {filteredMembers.map((member) => (
import.meta.env.VITE_API_URL               <div
import.meta.env.VITE_API_URL                 key={member.id}
import.meta.env.VITE_API_URL                 className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-4">
import.meta.env.VITE_API_URL                   <div className="relative">
import.meta.env.VITE_API_URL                     <img
import.meta.env.VITE_API_URL                       src={member.avatar_url || buildAvatar(member.name)}
import.meta.env.VITE_API_URL                       alt={member.name}
import.meta.env.VITE_API_URL                       className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm"
import.meta.env.VITE_API_URL                     />
import.meta.env.VITE_API_URL                     <div
import.meta.env.VITE_API_URL                       className={cn(
import.meta.env.VITE_API_URL                         'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm',
import.meta.env.VITE_API_URL                         member.status === 'active'
import.meta.env.VITE_API_URL                           ? 'bg-emerald-500'
import.meta.env.VITE_API_URL                           : member.status === 'invited'
import.meta.env.VITE_API_URL                             ? 'bg-orange-500'
import.meta.env.VITE_API_URL                             : 'bg-red-500'
import.meta.env.VITE_API_URL                       )}
import.meta.env.VITE_API_URL                     />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-2 flex-wrap">
import.meta.env.VITE_API_URL                       <h3 className="font-bold text-slate-900">{member.name}</h3>
import.meta.env.VITE_API_URL                       {member.role === 'admin' && (
import.meta.env.VITE_API_URL                         <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md flex items-center gap-1">
import.meta.env.VITE_API_URL                           <Shield className="w-3 h-3" /> Admin
import.meta.env.VITE_API_URL                         </span>
import.meta.env.VITE_API_URL                       )}
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-3 text-sm text-slate-500">
import.meta.env.VITE_API_URL                       <span className="flex items-center gap-1">
import.meta.env.VITE_API_URL                         <Mail className="w-3.5 h-3.5" /> {member.email}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-2 w-full sm:w-auto">
import.meta.env.VITE_API_URL                   <button
import.meta.env.VITE_API_URL                     onClick={() => {
import.meta.env.VITE_API_URL                       setSelectedMember(member);
import.meta.env.VITE_API_URL                       setIsPermissionsModalOpen(true);
import.meta.env.VITE_API_URL                     }}
import.meta.env.VITE_API_URL                     disabled={member.role === 'admin'}
import.meta.env.VITE_API_URL                     className={cn(
import.meta.env.VITE_API_URL                       'flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border',
import.meta.env.VITE_API_URL                       member.role === 'admin'
import.meta.env.VITE_API_URL                         ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
import.meta.env.VITE_API_URL                         : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     <Lock className="w-3.5 h-3.5" /> Permissões
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                   <button
import.meta.env.VITE_API_URL                     onClick={() => handleDeleteMember(member)}
import.meta.env.VITE_API_URL                     disabled={member.role === 'admin' || removingId === member.id}
import.meta.env.VITE_API_URL                     className={cn(
import.meta.env.VITE_API_URL                       'p-2 rounded-xl transition-all border',
import.meta.env.VITE_API_URL                       member.role === 'admin'
import.meta.env.VITE_API_URL                         ? 'text-slate-300 border-transparent cursor-not-allowed'
import.meta.env.VITE_API_URL                         : 'text-slate-400 hover:bg-white hover:text-red-600 border-transparent hover:border-red-100'
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     {removingId === member.id ? (
import.meta.env.VITE_API_URL                       <Loader2 className="w-4 h-4 animate-spin" />
import.meta.env.VITE_API_URL                     ) : (
import.meta.env.VITE_API_URL                       <Trash2 className="w-4 h-4" />
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             ))}
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {isInviteModalOpen && (
import.meta.env.VITE_API_URL           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               initial={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, scale: 1, y: 0 }}
import.meta.env.VITE_API_URL               exit={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL               className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
import.meta.env.VITE_API_URL                     <UserPlus className="w-6 h-6" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <h3 className="text-lg font-bold text-slate-900">Convidar Colaborador</h3>
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-500">Envie um convite por email.</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button
import.meta.env.VITE_API_URL                   onClick={() => setIsInviteModalOpen(false)}
import.meta.env.VITE_API_URL                   className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <X className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <form onSubmit={handleInviteMember} className="p-6 space-y-4">
import.meta.env.VITE_API_URL                 <div className="space-y-1.5">
import.meta.env.VITE_API_URL                   <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
import.meta.env.VITE_API_URL                   <input
import.meta.env.VITE_API_URL                     name="name"
import.meta.env.VITE_API_URL                     required
import.meta.env.VITE_API_URL                     type="text"
import.meta.env.VITE_API_URL                     placeholder="Ex: João Silva"
import.meta.env.VITE_API_URL                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 <div className="space-y-1.5">
import.meta.env.VITE_API_URL                   <label className="text-sm font-semibold text-slate-700">Email Profissional</label>
import.meta.env.VITE_API_URL                   <input
import.meta.env.VITE_API_URL                     name="email"
import.meta.env.VITE_API_URL                     required
import.meta.env.VITE_API_URL                     type="email"
import.meta.env.VITE_API_URL                     placeholder="email@empresa.pt"
import.meta.env.VITE_API_URL                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 <div className="pt-4">
import.meta.env.VITE_API_URL                   <button
import.meta.env.VITE_API_URL                     type="submit"
import.meta.env.VITE_API_URL                     disabled={inviting}
import.meta.env.VITE_API_URL                     className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     {inviting ? (
import.meta.env.VITE_API_URL                       <>
import.meta.env.VITE_API_URL                         <Loader2 className="w-4 h-4 animate-spin" />
import.meta.env.VITE_API_URL                         A enviar...
import.meta.env.VITE_API_URL                       </>
import.meta.env.VITE_API_URL                     ) : (
import.meta.env.VITE_API_URL                       <>
import.meta.env.VITE_API_URL                         <UserPlus className="w-4 h-4" />
import.meta.env.VITE_API_URL                         Enviar Convite
import.meta.env.VITE_API_URL                       </>
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </form>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {isPermissionsModalOpen && selectedMember && (
import.meta.env.VITE_API_URL           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               initial={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, scale: 1, y: 0 }}
import.meta.env.VITE_API_URL               exit={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL               className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
import.meta.env.VITE_API_URL                     <Lock className="w-6 h-6" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <h3 className="text-lg font-bold text-slate-900">Permissões: {selectedMember.name}</h3>
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-500">Defina o que este utilizador pode fazer em cada área.</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button
import.meta.env.VITE_API_URL                   onClick={() => setIsPermissionsModalOpen(false)}
import.meta.env.VITE_API_URL                   className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <X className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="flex-1 overflow-y-auto p-6">
import.meta.env.VITE_API_URL                 <div className="overflow-x-auto">
import.meta.env.VITE_API_URL                   <table className="w-full text-left border-collapse">
import.meta.env.VITE_API_URL                     <thead>
import.meta.env.VITE_API_URL                       <tr className="border-b border-slate-100">
import.meta.env.VITE_API_URL                         <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">
import.meta.env.VITE_API_URL                           Área / Módulo
import.meta.env.VITE_API_URL                         </th>
import.meta.env.VITE_API_URL                         {TEAM_ACTIONS.map((action) => (
import.meta.env.VITE_API_URL                           <th
import.meta.env.VITE_API_URL                             key={action.id}
import.meta.env.VITE_API_URL                             className="py-4 px-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider"
import.meta.env.VITE_API_URL                           >
import.meta.env.VITE_API_URL                             {action.label}
import.meta.env.VITE_API_URL                           </th>
import.meta.env.VITE_API_URL                         ))}
import.meta.env.VITE_API_URL                       </tr>
import.meta.env.VITE_API_URL                     </thead>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                     <tbody className="divide-y divide-slate-50">
import.meta.env.VITE_API_URL                       {TEAM_AREAS.map((area) => (
import.meta.env.VITE_API_URL                         <tr key={area.id} className="hover:bg-slate-50/50 transition-colors">
import.meta.env.VITE_API_URL                           <td className="py-4 px-4">
import.meta.env.VITE_API_URL                             <div className="flex flex-col">
import.meta.env.VITE_API_URL                               <span className="font-bold text-slate-900 text-sm">{area.label}</span>
import.meta.env.VITE_API_URL                               <span className="text-[10px] text-slate-500">{area.description}</span>
import.meta.env.VITE_API_URL                             </div>
import.meta.env.VITE_API_URL                           </td>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                           {TEAM_ACTIONS.map((action) => {
import.meta.env.VITE_API_URL                             const isChecked = selectedMember.permissions?.[area.id]?.includes(action.id);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                             return (
import.meta.env.VITE_API_URL                               <td key={action.id} className="py-4 px-2 text-center">
import.meta.env.VITE_API_URL                                 <button
import.meta.env.VITE_API_URL                                   type="button"
import.meta.env.VITE_API_URL                                   onClick={() => handleTogglePermission(area.id, action.id)}
import.meta.env.VITE_API_URL                                   disabled={selectedMember.role === 'admin'}
import.meta.env.VITE_API_URL                                   className={cn(
import.meta.env.VITE_API_URL                                     'w-6 h-6 rounded-md border-2 transition-all mx-auto flex items-center justify-center',
import.meta.env.VITE_API_URL                                     isChecked
import.meta.env.VITE_API_URL                                       ? 'bg-primary border-primary text-white shadow-sm'
import.meta.env.VITE_API_URL                                       : 'bg-white border-slate-200 text-transparent hover:border-primary/50'
import.meta.env.VITE_API_URL                                   )}
import.meta.env.VITE_API_URL                                 >
import.meta.env.VITE_API_URL                                   <Check className="w-4 h-4 stroke-[3]" />
import.meta.env.VITE_API_URL                                 </button>
import.meta.env.VITE_API_URL                               </td>
import.meta.env.VITE_API_URL                             );
import.meta.env.VITE_API_URL                           })}
import.meta.env.VITE_API_URL                         </tr>
import.meta.env.VITE_API_URL                       ))}
import.meta.env.VITE_API_URL                     </tbody>
import.meta.env.VITE_API_URL                   </table>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
import.meta.env.VITE_API_URL                 <button
import.meta.env.VITE_API_URL                   onClick={() => setIsPermissionsModalOpen(false)}
import.meta.env.VITE_API_URL                   className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Cancelar
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button
import.meta.env.VITE_API_URL                   onClick={handleSavePermissions}
import.meta.env.VITE_API_URL                   disabled={savingPermissions}
import.meta.env.VITE_API_URL                   className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center gap-2"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   {savingPermissions && <Loader2 className="w-4 h-4 animate-spin" />}
import.meta.env.VITE_API_URL                   Guardar Alterações
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }