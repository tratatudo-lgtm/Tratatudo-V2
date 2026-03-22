import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Check,
  X,
  Search,
  ShieldCheck,
  Clock,
  Trash2,
  Lock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import {
  TeamMember,
  HubArea,
  HubAction,
  TEAM_AREAS,
  TEAM_ACTIONS,
  UserPermissions
} from '../../types/team';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';

function buildAvatar(name: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;
}

function normalizeMember(raw: any): TeamMember {
  return {
    id: String(raw?.id ?? ''),
    name: raw?.name || raw?.full_name || raw?.email || 'Utilizador',
    email: raw?.email || '',
    role: raw?.role === 'admin' ? 'admin' : 'member',
    permissions: (raw?.permissions || {}) as UserPermissions,
    status:
      raw?.status === 'active' || raw?.status === 'invited' || raw?.status === 'suspended'
        ? raw.status
        : 'active',
    created_at: raw?.created_at || new Date().toISOString(),
    last_login: raw?.last_login || undefined,
    avatar_url: raw?.avatar_url || buildAvatar(raw?.name || raw?.email || 'User')
  };
}

export function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const fetchMembers = async () => {
    const endpoints = [
      `${BASE_URL}/api/client/team`,
      `${BASE_URL}/api/team`
    ];

    let lastError: any = null;

    try {
      setLoading(true);

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            credentials: 'include'
          });

          if (!res.ok) {
            if (res.status === 401) {
              throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            throw new Error('Falha ao carregar equipa.');
          }

          const json = await res.json().catch(() => ({}));
          const rawMembers = json?.members || json?.team || json?.data?.members || json?.data || [];

          if (Array.isArray(rawMembers)) {
            setMembers(rawMembers.map(normalizeMember));
            return;
          }

          throw new Error('Resposta inválida da equipa.');
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError || new Error('Falha ao carregar equipa.');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao carregar equipa.');

      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        setMembers([
          {
            id: '1',
            name: 'Admin Principal',
            email: 'admin@tratatudo.pt',
            role: 'admin',
            permissions: {},
            status: 'active',
            created_at: new Date().toISOString(),
            avatar_url: buildAvatar('Admin Principal')
          },
          {
            id: '2',
            name: 'João Silva',
            email: 'joao@tratatudo.pt',
            role: 'member',
            permissions: {
              dashboard: ['ver'],
              pedidos: ['ver', 'ver_detalhe', 'criar', 'editar', 'alterar_estado'],
              mensagens: ['ver', 'responder']
            },
            status: 'active',
            created_at: new Date().toISOString(),
            avatar_url: buildAvatar('João Silva')
          },
          {
            id: '3',
            name: 'Maria Santos',
            email: 'maria@tratatudo.pt',
            role: 'member',
            permissions: {
              vendas: ['ver', 'ver_detalhe', 'criar', 'editar', 'gerir'],
              mensagens: ['ver', 'responder']
            },
            status: 'invited',
            created_at: new Date().toISOString(),
            avatar_url: buildAvatar('Maria Santos')
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;

    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const handleTogglePermission = (area: HubArea, action: HubAction) => {
    if (!selectedMember || selectedMember.role === 'admin') return;

    const currentPermissions: UserPermissions = { ...(selectedMember.permissions || {}) };
    const areaPerms = currentPermissions[area] || [];

    if (areaPerms.includes(action)) {
      const next = areaPerms.filter((a) => a !== action);
      if (next.length > 0) currentPermissions[area] = next;
      else delete currentPermissions[area];
    } else {
      currentPermissions[area] = [...areaPerms, action];
    }

    setSelectedMember({
      ...selectedMember,
      permissions: currentPermissions
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedMember) return;

    try {
      setSavingPermissions(true);

      const endpoints = [
        `${BASE_URL}/api/client/team/${selectedMember.id}/permissions`,
        `${BASE_URL}/api/team/${selectedMember.id}/permissions`
      ];

      let saved = false;
      let lastError: any = null;

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              permissions: selectedMember.permissions
            })
          });

          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Erro ao guardar permissões.');
          }

          saved = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!saved) {
        if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
          setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? selectedMember : m)));
          toast.success(`Permissões de ${selectedMember.name} atualizadas.`);
          setIsPermissionsModalOpen(false);
          return;
        }
        throw lastError || new Error('Erro ao guardar permissões.');
      }

      setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? selectedMember : m)));
      toast.success(`Permissões de ${selectedMember.name} atualizadas.`);
      setIsPermissionsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao guardar permissões.');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const name = String(formData.get('name') || '').trim();

    if (!name || !email) {
      toast.error('Preencha nome e email.');
      return;
    }

    try {
      setInviting(true);

      const endpoints = [
        `${BASE_URL}/api/client/team/invite`,
        `${BASE_URL}/api/team/invite`
      ];

      let invited = false;
      let responseMember: TeamMember | null = null;
      let lastError: any = null;

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name,
              email,
              permissions: { dashboard: ['ver'] }
            })
          });

          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Erro ao enviar convite.');
          }

          const json = await res.json().catch(() => ({}));
          responseMember = normalizeMember(json?.member || json?.user || { name, email, role: 'member', status: 'invited' });
          invited = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!invited) {
        if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
          const newMember: TeamMember = {
            id: Math.random().toString(36).slice(2, 11),
            name,
            email,
            role: 'member',
            permissions: { dashboard: ['ver'] },
            status: 'invited',
            created_at: new Date().toISOString(),
            avatar_url: buildAvatar(name)
          };
          setMembers((prev) => [newMember, ...prev]);
          toast.success(`Convite enviado para ${email}`);
          setIsInviteModalOpen(false);
          e.currentTarget.reset();
          return;
        }
        throw lastError || new Error('Erro ao enviar convite.');
      }

      if (responseMember) {
        setMembers((prev) => [responseMember!, ...prev.filter((m) => m.id !== responseMember!.id)]);
      }

      toast.success(`Convite enviado para ${email}`);
      setIsInviteModalOpen(false);
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao enviar convite.');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (member.role === 'admin') {
      toast.error('Não podes remover um administrador por aqui.');
      return;
    }

    const confirmed = window.confirm(`Remover ${member.name}?`);
    if (!confirmed) return;

    try {
      setRemovingId(member.id);

      const endpoints = [
        `${BASE_URL}/api/client/team/${member.id}`,
        `${BASE_URL}/api/team/${member.id}`
      ];

      let deleted = false;
      let lastError: any = null;

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Erro ao remover colaborador.');
          }

          deleted = true;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!deleted) {
        if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
          setMembers((prev) => prev.filter((m) => m.id !== member.id));
          toast.success('Colaborador removido.');
          return;
        }
        throw lastError || new Error('Erro ao remover colaborador.');
      }

      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success('Colaborador removido.');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover colaborador.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Gestão de Equipa
          </h1>
          <p className="text-slate-500">Gerencie os acessos e permissões dos seus colaboradores.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchMembers}
            className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Convidar Membro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Membros</p>
            <p className="text-xl font-bold text-slate-900">{members.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administradores</p>
            <p className="text-xl font-bold text-slate-900">{members.filter((m) => m.role === 'admin').length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendentes</p>
            <p className="text-xl font-bold text-slate-900">{members.filter((m) => m.status === 'invited').length}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-slate-500 font-medium">A carregar equipa...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum membro encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar_url || buildAvatar(member.name)}
                      alt={member.name}
                      className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm"
                    />
                    <div
                      className={cn(
                        'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm',
                        member.status === 'active'
                          ? 'bg-emerald-500'
                          : member.status === 'invited'
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                      )}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{member.name}</h3>
                      {member.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {member.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setIsPermissionsModalOpen(true);
                    }}
                    disabled={member.role === 'admin'}
                    className={cn(
                      'flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border',
                      member.role === 'admin'
                        ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'
                    )}
                  >
                    <Lock className="w-3.5 h-3.5" /> Permissões
                  </button>

                  <button
                    onClick={() => handleDeleteMember(member)}
                    disabled={member.role === 'admin' || removingId === member.id}
                    className={cn(
                      'p-2 rounded-xl transition-all border',
                      member.role === 'admin'
                        ? 'text-slate-300 border-transparent cursor-not-allowed'
                        : 'text-slate-400 hover:bg-white hover:text-red-600 border-transparent hover:border-red-100'
                    )}
                  >
                    {removingId === member.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Convidar Colaborador</h3>
                    <p className="text-xs text-slate-500">Envie um convite por email.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInviteMember} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                  <input
                    name="name"
                    required
                    type="text"
                    placeholder="Ex: João Silva"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email Profissional</label>
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="email@empresa.pt"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={inviting}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {inviting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        A enviar...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Enviar Convite
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPermissionsModalOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Permissões: {selectedMember.name}</h3>
                    <p className="text-xs text-slate-500">Defina o que este utilizador pode fazer em cada área.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">
                          Área / Módulo
                        </th>
                        {TEAM_ACTIONS.map((action) => (
                          <th
                            key={action.id}
                            className="py-4 px-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider"
                          >
                            {action.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {TEAM_AREAS.map((area) => (
                        <tr key={area.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm">{area.label}</span>
                              <span className="text-[10px] text-slate-500">{area.description}</span>
                            </div>
                          </td>

                          {TEAM_ACTIONS.map((action) => {
                            const isChecked = selectedMember.permissions?.[area.id]?.includes(action.id);

                            return (
                              <td key={action.id} className="py-4 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(area.id, action.id)}
                                  disabled={selectedMember.role === 'admin'}
                                  className={cn(
                                    'w-6 h-6 rounded-md border-2 transition-all mx-auto flex items-center justify-center',
                                    isChecked
                                      ? 'bg-primary border-primary text-white shadow-sm'
                                      : 'bg-white border-slate-200 text-transparent hover:border-primary/50'
                                  )}
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={savingPermissions}
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {savingPermissions && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}