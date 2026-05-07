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
import { apiGet, apiPatch } from '../../lib/api';
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
      const data = await apiGet(`/api/client/profiles/${id}`);
      setProfile(data.profile);
      setStats(data.stats);
      setEditData(data.profile);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Erro ao carregar dados do cliente');
      navigate('/app/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      const data = await apiPatch(`/api/client/profiles/${id}`, editData);
      setProfile(data.profile);
      setIsEditing(false);
      toast.success('Dados atualizados com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao guardar alterações');
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
            {activeTab === 'pedidos' && <TabTickets tickets={profile.tickets?.filter(t => t.kind === 'pedido') || []} kind="pedido" />}
            {activeTab === 'reclamacoes' && <TabTickets tickets={profile.tickets?.filter(t => t.kind === 'reclamação') || []} kind="reclamação" />}
            {activeTab === 'vendas' && <TabTickets tickets={profile.tickets?.filter(t => t.kind === 'venda') || []} kind="venda" />}
            {activeTab === 'documentos' && <TabDocumentos documents={profile.documents || []} />}
            {activeTab === 'emails' && <TabEmails emails={profile.emails || []} />}
            {activeTab === 'agenda' && <TabAgenda events={profile.calendar_events || []} />}
            {activeTab === 'tarefas' && <TabTarefas tasks={profile.tasks || []} />}
            {activeTab === 'faturas' && <TabFaturas documents={profile.financial_documents || []} stats={stats?.financial} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabTickets: React.FC<{ tickets: any[]; kind: string }> = ({ tickets, kind }) => {
  const navigate = useNavigate();
  const label = kind === 'pedido' ? 'Pedidos' : kind === 'reclamação' ? 'Reclamações' : 'Vendas';
  
  if (tickets.length === 0) {
    return <EmptyState icon={<MessageSquare size={40} />} title={`Sem ${label.toLowerCase()}`} description={`Este cliente ainda não tem ${label.toLowerCase()} registados.`} />;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Título</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {ticket.tracking_code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{ticket.title}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[200px]">{ticket.category}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    ticket.priority === 'urgente' ? 'bg-rose-100 text-rose-700' :
                    ticket.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                    ticket.priority === 'média' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  )}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(ticket.created_at).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/app/tickets/${ticket.id}`)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-slate-50">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {ticket.tracking_code}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {new Date(ticket.created_at).toLocaleDateString('pt-PT')}
              </span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{ticket.title}</div>
              <div className="text-xs text-slate-500">{ticket.category}</div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                  {ticket.status}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                  ticket.priority === 'urgente' ? 'bg-rose-100 text-rose-700' :
                  ticket.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                  ticket.priority === 'média' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                )}>
                  {ticket.priority}
                </span>
              </div>
              <button 
                onClick={() => navigate(`/app/tickets/${ticket.id}`)}
                className="flex items-center gap-1 text-indigo-600 text-xs font-bold"
              >
                Ver <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabDocumentos: React.FC<{ documents: any[] }> = ({ documents }) => {
  if (documents.length === 0) {
    return <EmptyState icon={<Files size={40} />} title="Sem documentos" description="Não existem documentos associados a este cliente." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <FileText size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
              {doc.file_type?.split('/')[1] || 'DOC'}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 mb-1 truncate">{doc.title}</h4>
          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{doc.description || 'Sem descrição'}</p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {new Date(doc.created_at).toLocaleDateString('pt-PT')}
            </span>
            <a 
              href={doc.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
            >
              Abrir <ExternalLink size={12} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

const TabEmails: React.FC<{ emails: any[] }> = ({ emails }) => {
  if (emails.length === 0) {
    return <EmptyState icon={<Mail size={40} />} title="Sem emails" description="Não existem emails registados para este cliente." />;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-50">
        {emails.map((email) => (
          <div key={email.id} className="p-6 hover:bg-slate-50/50 transition-all flex gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              email.direction === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            )}>
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-900 truncate">{email.subject}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {new Date(email.created_at).toLocaleDateString('pt-PT')}
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                <span className="font-bold">{email.from_email}</span>
                <span>→</span>
                <span>{email.to_email}</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 italic">
                {email.body_preview || 'Sem pré-visualização disponível.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabAgenda: React.FC<{ events: any[] }> = ({ events }) => {
  if (events.length === 0) {
    return <EmptyState icon={<Calendar size={40} />} title="Agenda vazia" description="Não existem eventos agendados para este cliente." />;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4 md:w-48 shrink-0">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase leading-none">{new Date(event.start_at).toLocaleDateString('pt-PT', { month: 'short' })}</span>
              <span className="text-lg font-black leading-none">{new Date(event.start_at).getDate()}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{new Date(event.start_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{event.event_type}</div>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
            <p className="text-sm text-slate-500 line-clamp-1">{event.description || 'Sem descrição'}</p>
            {event.location && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <MapPin size={12} />
                {event.location}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
              event.status === 'confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            )}>
              {event.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TabTarefas: React.FC<{ tasks: any[] }> = ({ tasks }) => {
  if (tasks.length === 0) {
    return <EmptyState icon={<CheckSquare size={40} />} title="Sem tarefas" description="Não existem tarefas pendentes para este cliente." />;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-50">
        {tasks.map((task) => (
          <div key={task.id} className="p-6 hover:bg-slate-50/50 transition-all flex items-center gap-4">
            <div className={cn(
              "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
              task.status === 'concluída' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-transparent'
            )}>
              <CheckSquare size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-bold text-slate-900 truncate",
                task.status === 'concluída' && "line-through text-slate-400"
              )}>
                {task.title}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  task.priority === 'urgente' ? 'text-rose-600' :
                  task.priority === 'alta' ? 'text-orange-600' :
                  'text-slate-400'
                )}>
                  {task.priority}
                </span>
                {task.due_at && (
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(task.due_at).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabFaturas: React.FC<{ documents: any[]; stats: any }> = ({ documents, stats }) => {
  if (documents.length === 0) {
    return <EmptyState icon={<Receipt size={40} />} title="Sem faturas" description="Não existem documentos financeiros registados." />;
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</div>
          <div className="text-xl font-black text-slate-900">{stats?.total?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Pago</div>
          <div className="text-xl font-black text-emerald-600">{stats?.paid?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Pendente</div>
          <div className="text-xl font-black text-rose-600">{stats?.pending?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Documentos</div>
          <div className="text-xl font-black text-slate-900">{stats?.count}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Número</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{doc.document_number}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 uppercase">{doc.document_type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(doc.issue_date).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    {doc.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      doc.status === 'pago' ? 'bg-emerald-100 text-emerald-700' :
                      doc.status === 'atrasado' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    )}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {doc.file_url && (
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex transition-all"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-500 max-w-xs mx-auto">{description}</p>
    </div>
  </div>
);

const TabResumo: React.FC<{ profile: ClientProfile; stats: any }> = ({ profile, stats }) => {
  // Derive recent activity from all related entities
  const activities = [
    ...(profile.tickets || []).map(t => ({ 
      id: t.id, 
      type: 'ticket', 
      title: t.title, 
      date: t.created_at, 
      icon: <MessageSquare size={18} />,
      desc: `${t.kind === 'pedido' ? 'Novo pedido' : t.kind === 'reclamação' ? 'Nova reclamação' : 'Nova venda'}: ${t.status}`
    })),
    ...(profile.documents || []).map(d => ({ 
      id: d.id, 
      type: 'document', 
      title: d.title, 
      date: d.created_at, 
      icon: <Files size={18} />,
      desc: `Documento carregado: ${d.category}`
    })),
    ...(profile.financial_documents || []).map(f => ({ 
      id: f.id, 
      type: 'financial', 
      title: f.document_number, 
      date: f.created_at, 
      icon: <Receipt size={18} />,
      desc: `Fatura emitida: ${f.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} (${f.status})`
    })),
    ...(profile.calendar_events || []).map(e => ({ 
      id: e.id, 
      type: 'event', 
      title: e.title, 
      date: e.created_at, 
      icon: <Calendar size={18} />,
      desc: `Evento agendado: ${new Date(e.start_at).toLocaleDateString('pt-PT')}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

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

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-indigo-500" />
              Atividade Recente
            </h3>
          </div>
          <div className="p-6">
            {activities.length > 0 ? (
              <div className="space-y-6">
                {activities.map((act, i) => (
                  <div key={act.id} className="flex gap-4 relative">
                    {i !== activities.length - 1 && <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100" />}
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 z-10">
                      {act.icon}
                    </div>
                    <div className="pt-1">
                      <div className="text-sm font-bold text-slate-900">
                        {act.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {new Date(act.date).toLocaleDateString('pt-PT')} às {new Date(act.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {act.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 italic text-sm">
                Nenhuma atividade recente registada.
              </div>
            )}
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
