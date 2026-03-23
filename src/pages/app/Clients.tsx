import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  X,
  Building2,
  User,
  Tag,
  FileText,
  Save,
  CreditCard,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AREA_CONFIG, ClientProfile } from '../../types/hub';
import { toast } from 'sonner';
import { apiFetch, apiPost } from '../../lib/api';
import { cn } from '../../lib/utils';

import { useAuth } from '../../lib/auth/AuthContext';

const Clients: React.FC = () => {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone_e164: '',
    nif: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Portugal',
    customer_type: 'Lead',
    notes: ''
  });

  const config = AREA_CONFIG.clientes;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/client/profiles');
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

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.contact_name || !formData.email) {
      toast.error('Por favor preencha os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiPost('/api/client/profiles', formData);
      if (res.ok) {
        toast.success('Cliente criado com sucesso!');
        setIsAddingClient(false);
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          phone_e164: '',
          nif: '',
          address: '',
          city: '',
          postal_code: '',
          country: 'Portugal',
          customer_type: 'Lead',
          notes: ''
        });
        fetchProfiles();
      } else {
        toast.error(res.error || 'Erro ao criar cliente');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.company_name.toLowerCase().includes(query) ||
      p.contact_name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.phone_e164.includes(searchQuery) ||
      (p.nif && p.nif.includes(searchQuery));
    
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
            placeholder="Pesquisar por nome, email, telefone ou NIF..."
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
                  <tr 
                    key={profile.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/app/clients/${profile.id}`)}
                  >
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
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/clients/${profile.id}`);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
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

      {/* New Client Modal */}
      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.bgLight, config.textMain)}>
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Novo Cliente</h3>
                    <p className="text-sm text-slate-500">Adicione um novo cliente à sua base de dados.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddingClient(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddClient} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      Nome da Empresa / Entidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Ex: TrataTudo Lda"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>

                  {/* Contact Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      Nome do Contacto Principal *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Ex: João Silva"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      Telefone (E.164)
                    </label>
                    <input
                      type="text"
                      value={formData.phone_e164}
                      onChange={(e) => setFormData({ ...formData, phone_e164: e.target.value })}
                      placeholder="+351912345678"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>

                  {/* NIF */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      NIF / Contribuinte
                    </label>
                    <input
                      type="text"
                      value={formData.nif}
                      onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                      placeholder="123456789"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>

                  {/* Customer Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Tag size={14} className="text-slate-400" />
                      Tipo de Cliente
                    </label>
                    <select
                      value={formData.customer_type}
                      onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    >
                      {config.statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} />
                    Morada e Localização
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Morada Completa</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua, número, andar..."
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Cidade</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ex: Lisboa"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Código Postal</label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        placeholder="0000-000"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">País</label>
                      <div className="relative">
                        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações relevantes sobre o cliente..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingClient(false)}
                    className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "px-8 py-2.5 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg",
                      config.bgMain,
                      config.bgHover,
                      config.shadowMain,
                      isSubmitting && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        A criar...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Criar Cliente
                      </>
                    )}
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
