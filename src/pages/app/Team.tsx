import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Shield, 
  Mail, 
  Phone, 
  Clock, 
  MoreVertical, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Loader2, 
  ChevronRight,
  Briefcase,
  Settings,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AREA_CONFIG, ClientUser } from '../../types/hub';
import { toast } from 'sonner';
import { apiFetch, apiPost } from '../../lib/api';

const Team: React.FC = () => {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone_e164: '',
    role: 'operador',
    status: 'invited'
  });

  const config = AREA_CONFIG.equipa;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/client/users');
      const data = await res.json();
      if (data.ok) {
        setUsers(data.users);
      } else {
        toast.error('Erro ao carregar equipa');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMember.name || !newMember.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const res = await apiPost('/api/client/users', newMember);

      if ((res as any)?.ok) {
        toast.success('Membro convidado com sucesso');
        setIsAddingMember(false);
        setNewMember({
          name: '',
          email: '',
          phone_e164: '',
          role: 'operador',
          status: 'invited'
        });
        fetchUsers();
      } else {
        toast.error((res as any)?.error || 'Erro ao convidar membro');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao convidar membro');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    invited: users.filter(u => u.status === 'invited').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-rose-100 text-rose-700 border-rose-200',
    gestor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    operador: 'bg-blue-100 text-blue-700 border-blue-200',
    comercial: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    técnico: 'bg-amber-100 text-amber-700 border-amber-200',
    financeiro: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${config.bgLight} rounded-xl ${config.textMain}`}>
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Equipa</h1>
            <p className="text-slate-500 text-sm">Gira os seus colaboradores, funções e permissões de acesso.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAddingMember(true)}
          className={`flex items-center gap-2 px-4 py-2.5 ${config.bgMain} text-white rounded-xl ${config.bgHover} transition-all shadow-lg ${config.shadowMain} font-medium`}
        >
          <Plus size={20} />
          <span>Convidar Membro</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total da Equipa" 
          value={stats.total} 
          icon={<Users size={20} />} 
          color="slate" 
        />
        <StatCard 
          label="Membros Ativos" 
          value={stats.active} 
          icon={<UserCheck size={20} />} 
          color="emerald" 
        />
        <StatCard 
          label="Convites Pendentes" 
          value={stats.invited} 
          icon={<UserPlus size={20} />} 
          color="blue" 
        />
        <StatCard 
          label="Administradores" 
          value={stats.admins} 
          icon={<Shield size={20} />} 
          color="rose" 
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Pesquisar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-600"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Todas as Funções</option>
            <option value="admin">Administrador</option>
            <option value="gestor">Gestor</option>
            <option value="operador">Operador</option>
            <option value="comercial">Comercial</option>
            <option value="técnico">Técnico</option>
            <option value="financeiro">Financeiro</option>
          </select>
          
          <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Team List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
            <p className="text-slate-500 animate-pulse">A carregar equipa...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{user.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail size={12} />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleColors[user.role] || 'bg-slate-100 text-slate-700 border-slate-200'} uppercase tracking-wider flex items-center gap-1.5`}>
                    <Briefcase size={12} />
                    {user.role}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                    user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    user.status === 'invited' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-slate-50 text-slate-700 border-slate-100'
                  }`}>
                    {user.status === 'active' ? <CheckCircle2 size={12} /> : 
                     user.status === 'invited' ? <Clock size={12} /> : 
                     <XCircle size={12} />}
                    {user.status === 'active' ? 'Ativo' : 
                     user.status === 'invited' ? 'Pendente' : 
                     'Inativo'}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>Último Acesso</span>
                    </div>
                    <span className="font-medium text-slate-700">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('pt-PT') : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Lock size={14} />
                      <span>Permissões</span>
                    </div>
                    <button className="text-indigo-600 font-bold hover:underline">Ver todas</button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider">
                  Editar Perfil
                </button>
                <button className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-wider">
                  Desativar
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Nenhum membro encontrado</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Tente ajustar a sua pesquisa ou convide um novo colaborador para a sua equipa.</p>
            </div>
            <button 
              onClick={() => setIsAddingMember(true)}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium"
            >
              Convidar Primeiro Membro
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isAddingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Convidar Membro</h3>
                  <p className="text-sm text-slate-500">Adicione um novo membro à equipa.</p>
                </div>
                <button
                  onClick={() => setIsAddingMember(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateMember} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={newMember.phone_e164}
                    onChange={(e) => setNewMember({ ...newMember, phone_e164: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  />
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  >
                    <option value="admin">Administrador</option>
                    <option value="gestor">Gestor</option>
                    <option value="operador">Operador</option>
                    <option value="comercial">Comercial</option>
                    <option value="técnico">Técnico</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="visualizador">Visualizador</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-70"
                  >
                    {saving ? 'A guardar...' : 'Convidar Membro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'slate' | 'emerald' | 'blue' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const colors = {
    slate: 'bg-slate-50 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
};

export default Team;
