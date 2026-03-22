import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  UserCheck,
  UserPlus,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AREA_CONFIG, ClientProfile } from '../../types/hub';
import { toast } from 'sonner';

import { useAuth } from '../../lib/auth/AuthContext';

const Clients: React.FC = () => {
  const { can } = useAuth();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingClient, setIsAddingClient] = useState(false);

  const config = AREA_CONFIG.clientes;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/client/profiles');
      const data = await res.json();
      if (data.ok) {
        setProfiles(data.profiles);
      } else {
        toast.error('Erro ao carregar clientes');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone_e164.includes(searchQuery);
    
    const matchesFilter = filterType === 'all' || p.customer_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: profiles.length,
    active: profiles.filter(p => p.customer_type === 'Ativo').length,
    leads: profiles.filter(p => p.customer_type === 'Lead').length,
    avgScore: profiles.length > 0 
      ? (profiles.reduce((acc, p) => acc + (p.customer_score || 0), 0) / profiles.length).toFixed(1)
      : '0'
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
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Clientes</h1>
            <p className="text-slate-500 text-sm">Centralize e gira todos os seus contactos e histórico.</p>
          </div>
        </div>
        
        {can('clients', 'create') && (
          <button 
            onClick={() => setIsAddingClient(true)}
            className={`flex items-center gap-2 px-4 py-2.5 ${config.bgMain} text-white rounded-xl ${config.bgHover} transition-all shadow-lg ${config.shadowMain} font-medium`}
          >
            <Plus size={20} />
            <span>Novo Cliente</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Clientes" 
          value={stats.total} 
          icon={<Users size={20} />} 
          color="indigo" 
        />
        <StatCard 
          label="Clientes Ativos" 
          value={stats.active} 
          icon={<UserCheck size={20} />} 
          color="emerald" 
        />
        <StatCard 
          label="Novos Leads" 
          value={stats.leads} 
          icon={<UserPlus size={20} />} 
          color="blue" 
        />
        <StatCard 
          label="Score Médio" 
          value={`${stats.avgScore}/10`} 
          icon={<TrendingUp size={20} />} 
          color="amber" 
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Pesquisar por nome, email, telefone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-600"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos os Tipos</option>
            {config.statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          
          <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
            <p className="text-slate-500 animate-pulse">A carregar clientes...</p>
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-bottom border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo / Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Interação</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {profile.company_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{profile.company_name}</div>
                          <div className="text-xs text-slate-500">{profile.contact_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          <span>{profile.phone_e164}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                          profile.customer_type === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
                          profile.customer_type === 'Lead' ? 'bg-blue-100 text-blue-700' :
                          profile.customer_type === 'VIP' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {profile.customer_type || 'N/A'}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${(profile.customer_score || 0) * 10}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{profile.customer_score || 0}/10</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        <span>{profile.last_interaction_at ? new Date(profile.last_interaction_at).toLocaleDateString('pt-PT') : 'Sem registo'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <ChevronRight size={20} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Nenhum cliente encontrado</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Tente ajustar a sua pesquisa ou adicione um novo cliente à sua base de dados.</p>
            </div>
            {can('clients', 'create') && (
              <button 
                onClick={() => setIsAddingClient(true)}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                Adicionar Primeiro Cliente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'blue' | 'amber' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
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

export default Clients;
