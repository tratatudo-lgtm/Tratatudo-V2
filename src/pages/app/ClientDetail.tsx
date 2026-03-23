import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Tag, 
  Clock, 
  FileText, 
  MessageSquare, 
  ShoppingCart, 
  Files, 
  Calendar, 
  CheckSquare, 
  Receipt,
  Loader2,
  Save,
  Plus,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  History,
  Info,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientProfile, AREA_CONFIG } from '../../types/hub';
import { apiFetch, apiPatch } from '../../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth/AuthContext';
import { cn } from '../../lib/utils';

type TabType = 'resumo' | 'dados' | 'pedidos' | 'reclamacoes' | 'vendas' | 'documentos' | 'emails' | 'agenda' | 'tarefas' | 'faturas';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can, user } = useAuth();
  
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<ClientProfile>>({});

  const config = AREA_CONFIG.clientes;

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/client/profiles/${id}`);
      const data = await res.json();
      if (data.ok) {
        setProfile(data.profile);
        setStats(data.stats);
        setEditData(data.profile);
      } else {
        toast.error('Erro ao carregar dados do cliente');
        navigate('/app/clients');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      const res = await apiPatch(`/api/client/profiles/${id}`, editData);
      const data = await res.json();
      if (data.ok) {
        setProfile(data.profile);
        setIsEditing(false);
        toast.success('Dados atualizados com sucesso');
      } else {
        toast.error(data.error || 'Erro ao atualizar dados');
      }
    } catch (error) {
      toast.error('Erro ao guardar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">A carregar ficha do cliente...</p>
      </div>
    );
  }

  if (!profile) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number; hidden?: boolean }[] = [
    { id: 'resumo', label: 'Resumo', icon: <Info size={18} /> },
    { id: 'dados', label: 'Dados', icon: <FileText size={18} /> },
    { id: 'pedidos', label: 'Pedidos', icon: <MessageSquare size={18} />, count: stats?.tickets },
    { id: 'reclamacoes', label: 'Reclamações', icon: <AlertCircle size={18} />, count: stats?.complaints },
    { id: 'vendas', label: 'Vendas', icon: <ShoppingCart size={18} />, count: stats?.sales },
    { id: 'documentos', label: 'Documentos', icon: <Files size={18} />, count: stats?.documents },
    { id: 'emails', label: 'Emails', icon: <Mail size={18} />, count: stats?.emails },
    { id: 'agenda', label: 'Agenda', icon: <Calendar size={18} />, count: stats?.events },
    { id: 'tarefas', label: 'Tarefas', icon: <CheckSquare size={18} />, count: stats?.tasks },
    { 
      id: 'faturas', 
      label: 'Faturas', 
      icon: <Receipt size={18} />, 
      count: stats?.financial?.count,
      hidden: !(user?.role === 'admin' || user?.role === 'financeiro')
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/clients')}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile.company_name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                profile.customer_type === 'Ativo' ? 'bg-emerald-100 text-emerald-700' :
                profile.customer_type === 'Lead' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {profile.customer_type}
              </span>
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <User size={14} />
              {profile.contact_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'dados' && (
            isEditing ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(profile);
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Guardar
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-bold"
              >
                <FileText size={18} />
                Editar Dados
              </button>
            )
          )}
          
          <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 font-bold">
            <Plus size={18} />
            Nova Ação
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-100 -mx-6 px-6 sticky top-0 z-10 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-8 min-w-max">
          {tabs.filter(t => !t.hidden).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-4 text-sm font-bold transition-all border-b-2 relative flex items-center gap-2",
                activeTab === tab.id 
                  ? "text-indigo-600 border-indigo-600" 
                  : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[10px] font-black",
                  activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'resumo' && <TabResumo profile={profile} stats={stats} />}
            {activeTab === 'dados' && (
              <TabDados 
                profile={profile} 
                isEditing={isEditing} 
                editData={editData} 
                setEditData={setEditData} 
              />
            )}
            {/* Other tabs would go here, showing lists of items */}
            {['pedidos', 'reclamacoes', 'vendas', 'documentos', 'emails', 'agenda', 'tarefas', 'faturas'].includes(activeTab) && (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  {tabs.find(t => t.id === activeTab)?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Módulo em desenvolvimento</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Esta funcionalidade de listagem específica para o cliente está a ser implementada.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabResumo: React.FC<{ profile: ClientProfile; stats: any }> = ({ profile, stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Faturado</div>
            <div className="text-2xl font-black text-slate-900">{stats?.financial?.total?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
              <TrendingUp size={12} />
              <span>{stats?.financial?.paid?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} pagos</span>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Em Aberto</div>
            <div className="text-2xl font-black text-rose-600">{stats?.financial?.pending?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Clock size={12} />
              <span>{stats?.financial?.count} faturas totais</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Score</div>
            <div className="text-2xl font-black text-indigo-600">{profile.customer_score || 0}/10</div>
            <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${(profile.customer_score || 0) * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contact Details Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Info size={18} className="text-indigo-500" />
              Informações de Contacto
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Email Principal</div>
                  <div className="text-slate-900 font-medium">{profile.email}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Telefone</div>
                  <div className="text-slate-900 font-medium">{profile.phone_e164 || 'Não definido'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <CreditCard size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">NIF / Contribuinte</div>
                  <div className="text-slate-900 font-medium">{profile.nif || 'Não definido'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Morada</div>
                  <div className="text-slate-900 font-medium leading-relaxed">
                    {profile.address || 'Sem morada registada'}<br />
                    {profile.postal_code} {profile.city}<br />
                    {profile.country}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-indigo-500" />
              Atividade Recente
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 3 && <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100" />}
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 z-10">
                    {i === 1 ? <MessageSquare size={18} /> : i === 2 ? <Receipt size={18} /> : <ShoppingCart size={18} />}
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-bold text-slate-900">
                      {i === 1 ? 'Novo pedido de assistência' : i === 2 ? 'Fatura emitida' : 'Venda concluída'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Há {i * 2} horas por Sistema</div>
                    <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {i === 1 ? 'O cliente solicitou apoio técnico para configuração de conta.' : 
                       i === 2 ? 'Fatura #FT2026/001 no valor de 150,00€.' : 
                       'Subscrição anual do Plano Business.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sidebar Info */}
      <div className="space-y-6">
        {/* Notes Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              Notas Internas
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 italic leading-relaxed">
              {profile.notes || 'Sem notas internas para este cliente.'}
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <TrendingUp size={18} />
            Performance do Cliente
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 opacity-80">
                <span>SATISFAÇÃO</span>
                <span>85%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[85%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 opacity-80">
                <span>FIDELIZAÇÃO</span>
                <span>92%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[92%]" />
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
            Ver Relatório Completo
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TabDados: React.FC<{ 
  profile: ClientProfile; 
  isEditing: boolean; 
  editData: Partial<ClientProfile>;
  setEditData: (data: Partial<ClientProfile>) => void;
}> = ({ profile, isEditing, editData, setEditData }) => {
  
  const config = AREA_CONFIG.clientes;

  if (!isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <section className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Identificação Principal</h4>
            <div className="space-y-4">
              <DataRow label="Nome da Empresa" value={profile.company_name} icon={<Building2 size={16} />} />
              <DataRow label="Contacto Principal" value={profile.contact_name} icon={<User size={16} />} />
              <DataRow label="Email" value={profile.email} icon={<Mail size={16} />} />
              <DataRow label="Telefone" value={profile.phone_e164} icon={<Phone size={16} />} />
              <DataRow label="NIF" value={profile.nif} icon={<CreditCard size={16} />} />
            </div>
          </section>

          <section className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Localização</h4>
            <div className="space-y-4">
              <DataRow label="Morada" value={profile.address} icon={<MapPin size={16} />} />
              <DataRow label="Cidade" value={profile.city} icon={<MapPin size={16} />} />
              <DataRow label="Código Postal" value={profile.postal_code} icon={<MapPin size={16} />} />
              <DataRow label="País" value={profile.country} icon={<Globe size={16} />} />
            </div>
          </section>

          <section className="md:col-span-2 space-y-6 pt-4 border-t border-slate-50">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Classificação e Notas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DataRow label="Tipo de Cliente" value={profile.customer_type} icon={<Tag size={16} />} />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <FileText size={14} />
                  Notas Internas
                </div>
                <div className="text-slate-700 bg-slate-50 p-4 rounded-2xl text-sm leading-relaxed min-h-[100px]">
                  {profile.notes || 'Sem notas registadas.'}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Fields */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Nome da Empresa</label>
            <input 
              type="text"
              value={editData.company_name || ''}
              onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Contacto Principal</label>
            <input 
              type="text"
              value={editData.contact_name || ''}
              onChange={(e) => setEditData({ ...editData, contact_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input 
              type="email"
              value={editData.email || ''}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Telefone</label>
            <input 
              type="text"
              value={editData.phone_e164 || ''}
              onChange={(e) => setEditData({ ...editData, phone_e164: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">NIF</label>
            <input 
              type="text"
              value={editData.nif || ''}
              onChange={(e) => setEditData({ ...editData, nif: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tipo de Cliente</label>
            <select 
              value={editData.customer_type || ''}
              onChange={(e) => setEditData({ ...editData, customer_type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {config.statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50">
          <h4 className="text-sm font-bold text-slate-900">Morada</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Logradouro</label>
              <input 
                type="text"
                value={editData.address || ''}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Cidade</label>
              <input 
                type="text"
                value={editData.city || ''}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Código Postal</label>
              <input 
                type="text"
                value={editData.postal_code || ''}
                onChange={(e) => setEditData({ ...editData, postal_code: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">País</label>
              <input 
                type="text"
                value={editData.country || ''}
                onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-4 border-t border-slate-50">
          <label className="text-sm font-bold text-slate-700">Notas Internas</label>
          <textarea 
            value={editData.notes || ''}
            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};

const DataRow: React.FC<{ label: string; value?: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 shrink-0">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-slate-900 font-semibold">{value || '---'}</div>
    </div>
  </div>
);

export default ClientDetail;
