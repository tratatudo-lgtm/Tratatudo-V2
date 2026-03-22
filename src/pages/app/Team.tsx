import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical, 
  Check, 
  X, 
  Search,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Trash2,
  Edit2,
  Lock,
  Loader2
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

export function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Mock data for initial development
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a fetch call
        await new Promise(resolve => setTimeout(resolve, 800));
        setMembers([
          {
            id: '1',
            name: 'Admin Principal',
            email: 'admin@tratatudo.pt',
            role: 'admin',
            permissions: {},
            status: 'active',
            created_at: new Date().toISOString(),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
          },
          {
            id: '2',
            name: 'João Silva',
            email: 'joao@tratatudo.pt',
            role: 'member',
            permissions: {
              dashboard: ['ver'],
              pedidos: ['ver', 'criar', 'editar', 'alterar_estado'],
              mensagens: ['ver', 'responder']
            },
            status: 'active',
            created_at: new Date().toISOString(),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao'
          },
          {
            id: '3',
            name: 'Maria Santos',
            email: 'maria@tratatudo.pt',
            role: 'member',
            permissions: {
              vendas: ['ver', 'criar', 'editar', 'gerir'],
              mensagens: ['ver', 'responder']
            },
            status: 'invited',
            created_at: new Date().toISOString(),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
          }
        ]);
      } catch (error) {
        toast.error('Erro ao carregar equipa.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePermission = (area: HubArea, action: HubAction) => {
    if (!selectedMember) return;

    const currentPermissions = { ...selectedMember.permissions };
    const areaPerms = currentPermissions[area] || [];

    if (areaPerms.includes(action)) {
      currentPermissions[area] = areaPerms.filter(a => a !== action);
    } else {
      currentPermissions[area] = [...areaPerms, action];
    }

    setSelectedMember({ ...selectedMember, permissions: currentPermissions });
  };

  const handleSavePermissions = async () => {
    if (!selectedMember) return;
    
    try {
      // Real API call would go here
      setMembers(members.map(m => m.id === selectedMember.id ? selectedMember : m));
      toast.success(`Permissões de ${selectedMember.name} atualizadas.`);
      setIsPermissionsModalOpen(false);
    } catch (error) {
      toast.error('Erro ao guardar permissões.');
    }
  };

  const handleInviteMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: 'member',
      permissions: { dashboard: ['ver'] },
      status: 'invited',
      created_at: new Date().toISOString(),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    setMembers([...members, newMember]);
    toast.success(`Convite enviado para ${email}`);
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Gestão de Equipa
          </h1>
          <p className="text-slate-500">Gerencie os acessos e permissões dos seus colaboradores.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Convidar Membro
        </button>
      </div>

      {/* Stats & Search */}
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
            <p className="text-xl font-bold text-slate-900">{members.filter(m => m.role === 'admin').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendentes</p>
            <p className="text-xl font-bold text-slate-900">{members.filter(m => m.status === 'invited').length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Members List */}
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
                      src={member.avatar_url} 
                      alt={member.name}
                      className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm"
                    />
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                      member.status === 'active' ? "bg-emerald-500" : 
                      member.status === 'invited' ? "bg-orange-500" : "bg-red-500"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{member.name}</h3>
                      {member.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {member.email}</span>
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
                      "flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border",
                      member.role === 'admin' 
                        ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary"
                    )}
                  >
                    <Lock className="w-3.5 h-3.5" /> Permissões
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-white hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
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
                <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
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
                  <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    Enviar Convite
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permissions Modal */}
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
                <button onClick={() => setIsPermissionsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">Área / Módulo</th>
                        {TEAM_ACTIONS.map(action => (
                          <th key={action.id} className="py-4 px-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {action.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {TEAM_AREAS.map(area => (
                        <tr key={area.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm">{area.label}</span>
                              <span className="text-[10px] text-slate-500">{area.description}</span>
                            </div>
                          </td>
                          {TEAM_ACTIONS.map(action => {
                            const isChecked = selectedMember.permissions[area.id]?.includes(action.id);
                            return (
                              <td key={action.id} className="py-4 px-2 text-center">
                                <button
                                  onClick={() => handleTogglePermission(area.id, action.id)}
                                  className={cn(
                                    "w-6 h-6 rounded-md border-2 transition-all mx-auto flex items-center justify-center",
                                    isChecked 
                                      ? "bg-primary border-primary text-white shadow-sm" 
                                      : "bg-white border-slate-200 text-transparent hover:border-primary/50"
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
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
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
