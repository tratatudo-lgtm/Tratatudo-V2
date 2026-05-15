import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  Plus,
  X,
  MessageSquare,
  ClipboardList,
  Clock,
  Zap,
  ShieldCheck,
  RefreshCw,
  Copy,
  Bot,
  Layers,
  Trash2,
  SlidersHorizontal,
  DollarSign,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { LoadingState, ErrorState } from '../../components/States';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../../lib/api';

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  contact_name?: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending' | 'trial';
  plan: 'starter' | 'pro' | 'enterprise';
  trial_start: string | null;
  trial_end: string | null;
  production_activated_at: string | null;
  bot_instructions: string;
  created_at: string;
  instance: {
    instance_name: string;
    status: string;
    is_hub: boolean;
  } | null;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(new URLSearchParams(window.location.search).get('search') || '');
  
  // Estados para Filtros Avançados de Painel
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'active' | 'suspended' | 'trial'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProlongModalOpen, setIsProlongModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [prolongingClient, setProlongingClient] = useState<Client | null>(null);

  // Form States
  const [newClient, setNewClient] = useState({ 
    phone_e164: '', 
    company_name: '', 
    contact_name: '', 
    email: '', 
    bot_instructions: '',
    plan: 'starter' as const
  });
  const [processing, setProcessing] = useState(false);

  const { logout } = useAdminAuth();

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiGet('/api/admin/clients');
      const clientsData = extractArrayResponse<Client>(data, 'clients');
      setClients(clientsData);
    } catch (err: any) {
      console.error('[ADMIN] Fetch clients failed:', err);
      if (err.message && (err.message.includes('401') || err.message.includes('não autorizado'))) {
        await logout();
      }
      setError(err.message || 'Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    try {
      setProcessing(true);
      await apiPost('/api/admin/clients/trial', newClient);

      toast.success('Cliente Trial criado com sucesso!');
      await fetchClients();
      setIsCreateModalOpen(false);
      setNewClient({ phone_e164: '', company_name: '', contact_name: '', email: '', bot_instructions: '', plan: 'starter' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || processing) return;

    try {
      setProcessing(true);
      await apiPut(`/api/admin/clients/${editingClient.id}`, editingClient);

      toast.success('Cliente atualizado com sucesso!');
      await fetchClients();
      setEditingClient(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este cliente? Esta ação é irreversível.')) return;

    try {
      setProcessing(true);
      await apiDelete(`/api/admin/clients/${id}`);

      toast.success('Cliente eliminado com sucesso.');
      await fetchClients();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao eliminar cliente');
    } finally {
      setProcessing(false);
    }
  };

  const handleProlongTrial = async () => {
    toast.info('Funcionalidade de prolongar trial aguarda implementação no backend.');
    setIsProlongModalOpen(false);
    setProlongingClient(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await apiPatch(`/api/admin/clients/${id}/status`, { status: newStatus });

      toast.success(`Cliente ${newStatus === 'active' ? 'reativado' : 'suspenso'} com sucesso.`);
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar estado do cliente');
    }
  };

  const handleActivateProduction = async (id: string) => {
    if (!confirm('Deseja ativar o modo de produção para este cliente? Isto criará uma instância dedicada.')) return;

    try {
      await apiPost(`/api/admin/clients/${id}/activate-production`);

      toast.success('Produção ativada! Instância dedicada em criação.');
      await fetchClients();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ativar produção');
    }
  };

  const handleSyncInstance = async (id: string) => {
    toast.info('Funcionalidade de sincronizar instância aguarda confirmação do backend.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  // Filtragem combinada Pesquisa + Status Tabular
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.client_id || client.id).toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filtroStatus === 'all' || client.status === filtroStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getTrialStatus = (client: Client) => {
    if (!client.trial_end) return null;
    const now = new Date();
    const end = new Date(client.trial_end);
    if (end < now) return 'expired';
    if (client.status === 'suspended') return 'paused';
    return 'active';
  };

  // Contadores reais baseados na DB para alimentar os blocos de métricas
  const totalContas = clients.length;
  const ativasContas = clients.filter(c => c.status === 'active').length;
  const trialContas = clients.filter(c => c.status === 'trial' || c.instance?.is_hub).length;
  const suspensasContas = clients.filter(c => c.status === 'suspended').length;

  if (loading && clients.length === 0) return <LoadingState message="A processar infraestrutura segura..." className="h-[60vh] bg-slate-950 text-indigo-400" />;
  if (error && clients.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 sm:px-6 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. HEADER DA PÁGINA (Premium Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" /> TrataTudo Core Engine
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            Gestão de Clientes
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Monitorização de instâncias, fluxos operacionais e provisionamento de inteligência artificial.
          </p>
        </div>

        {/* Barra de Ferramentas / Controladores */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar por empresa, id, telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full sm:w-64 backdrop-blur-sm"
            />
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-wide"
          >
            <Plus className="w-4 h-4" /> Criar Novo Trial
          </button>
        </div>
      </div>

      {/* 2. BLOCOS DE MÉTRICAS REAIS DA BASE DE DADOS */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900/80 p-5 rounded-2xl relative overflow-hidden group">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Total Licenças</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-2 block tracking-tight">{totalContas}</span>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">Bases registadas na rede</span>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/5 to-transparent blur-xl pointer-events-none" />
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900/80 p-5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Operações Ativas</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 block tracking-tight">{ativasContas}</span>
          <span className="text-[10px] text-emerald-500/80 mt-1 block font-mono">Produção com uptime 100%</span>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900/80 p-5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Em Período Trial</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-400 mt-2 block tracking-tight">{trialContas}</span>
          <span className="text-[10px] text-blue-400/80 mt-1 block font-mono">Alojados no Hub Partilhado</span>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900/80 p-5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Contas Suspensas</span>
          <span className="text-2xl sm:text-3xl font-black text-red-400 mt-2 block tracking-tight">{suspensasContas}</span>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">Acesso restrito por painel</span>
        </div>
      </section>

      {/* 3. FILTROS AVANÇADOS TABULARES STYLE SHADCN */}
      <div className="bg-slate-900/60 border border-slate-900/80 p-2 rounded-xl inline-flex gap-1 max-w-full overflow-x-auto backdrop-blur-sm">
        {([
          { id: 'all', label: 'Todos os Clientes', count: totalContas },
          { id: 'active', label: 'Produção / Ativos', count: ativasContas },
          { id: 'trial', label: 'Trials ativos', count: trialContas },
          { id: 'suspended', label: 'Suspensos', count: suspensasContas }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFiltroStatus(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2",
              filtroStatus === tab.id 
                ? "bg-slate-800 text-white shadow-inner border border-slate-700/50" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded-md",
              filtroStatus === tab.id ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-500"
            )}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* 4. TABELA DE COMPONENTES OPERACIONAIS REAL */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-[2rem] overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-4.5">Empresa / Contacto</th>
                <th className="px-8 py-4.5">Ambiente Operacional</th>
                <th className="px-8 py-4.5">Licenciamento / Ciclo</th>
                <th className="px-8 py-4.5">Estado de Gateway</th>
                <th className="px-8 py-4.5 text-right">Controlo de Infraestrutura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40 text-sm">
              {filteredClients.map((client) => {
                const trialStatus = getTrialStatus(client);
                const isTrial = client.status === 'trial' || client.instance?.is_hub === true;

                return (
                  <motion.tr 
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-slate-900/30 transition-colors"
                  >
                    {/* Coluna 1: Nome e Informações de Contacto */}
                    <td className="px-8 py-5.5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center border transition-all",
                          isTrial 
                            ? "bg-blue-500/5 border-blue-500/10 text-blue-400" 
                            : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                        )}>
                          {isTrial ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{client.company_name}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 font-mono text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                              <Phone className="w-3 h-3 text-slate-600" /> {client.phone}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                              <Mail className="w-3 h-3 text-slate-600" /> {client.email || 'sem email'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Coluna 2: Instâncias e Redes */}
                    <td className="px-8 py-5.5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                            isTrial 
                              ? "bg-blue-500/5 border-blue-500/20 text-blue-400" 
                              : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                          )}>
                            {isTrial ? 'Trial Shared Hub' : 'Instância Dedicada'}
                          </span>
                          {client.instance?.is_hub && (
                            <span className="text-[8px] font-mono bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Hub</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 group/inst font-mono text-xs text-slate-400">
                          <Monitor className="w-3 h-3 text-slate-600" />
                          <span className="truncate max-w-[140px]">
                            {client.instance?.instance_name || 'Instância Ausente'}
                          </span>
                          {client.instance?.instance_name && (
                            <button 
                              onClick={() => copyToClipboard(client.instance!.instance_name)}
                              className="opacity-0 group-hover/inst:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-all"
                              title="Copiar Hostname"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Coluna 3: Planos e Ciclo de Vida */}
                    <td className="px-8 py-5.5">
                      <div className="flex flex-col gap-1 font-mono">
                        <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" /> {client.plan}
                        </span>
                        
                        {client.trial_end && (
                          <div className="flex flex-col mt-0.5">
                            <span className={cn(
                              "text-[10px] font-medium",
                              trialStatus === 'expired' ? "text-red-400 font-bold" : "text-slate-500"
                            )}>
                              Expira: {new Date(client.trial_end).toLocaleDateString('pt-PT')}
                            </span>
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest mt-0.5",
                              trialStatus === 'active' ? "text-emerald-400" : 
                               trialStatus === 'expired' ? "text-red-400" : "text-amber-400"
                            )}>
                              [{trialStatus === 'active' ? 'Ativo' : trialStatus === 'expired' ? 'Expirado' : 'Pausado'}]
                            </span>
                          </div>
                        )}
                        
                        {client.production_activated_at && (
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            Live: {new Date(client.production_activated_at).toLocaleDateString('pt-PT')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Coluna 4: Status do utilizador */}
                    <td className="px-8 py-5.5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        client.status === 'active' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : 
                        client.status === 'suspended' ? "bg-red-500/5 border-red-500/10 text-red-400" : 
                        client.status === 'trial' ? "bg-blue-500/5 border-blue-500/10 text-blue-400" : "bg-amber-500/5 border-amber-500/10 text-amber-400"
                      )}>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          client.status === 'active' ? "bg-emerald-400 animate-pulse" : 
                          client.status === 'suspended' ? "bg-red-400" : 
                          client.status === 'trial' ? "bg-blue-400" : "bg-amber-400"
                        )} />
                        {client.status === 'active' ? 'Ativo' : 
                         client.status === 'suspended' ? 'Suspenso' : 
                         client.status === 'trial' ? 'Trial' : 'Pendente'}
                      </span>
                    </td>

                    {/* Coluna 5: Menu de Ações Rápidas Custom */}
                    <td className="px-8 py-5.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Ações Exclusivas para Ambiente Trial */}
                        {isTrial && (
                          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 backdrop-blur-sm mr-1">
                            <button 
                              onClick={() => { setProlongingClient(client); setIsProlongModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800/50 rounded-lg transition-all"
                              title="Prolongar Dias Trial"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleActivateProduction(client.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider shadow-md shadow-emerald-600/10 hover:bg-emerald-500 transition-all"
                              title="Migrar para Instância Dedicada de Produção"
                            >
                              Ativar Prod
                            </button>
                          </div>
                        )}

                        {/* Linha Divisória de Operação */}
                        <div className="h-5 w-px bg-slate-900 mx-1" />

                        {/* Botão Suspender/Reativar */}
                        <button 
                          onClick={() => handleToggleStatus(client.id, client.status)}
                          className={cn(
                            "p-2 rounded-xl border transition-all bg-slate-900/40",
                            client.status === 'active' 
                              ? "border-red-900/30 text-red-400 hover:bg-red-500/10" 
                              : "border-emerald-900/30 text-emerald-400 hover:bg-emerald-500/10"
                          )}
                          title={client.status === 'active' ? 'Suspender Conta do Cliente' : 'Reativar Conta do Cliente'}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>

                        {/* Atatalhos de Redirecionamento de Logs */}
                        <button 
                          onClick={() => window.location.href = `/admin/messages?client=${client.client_id || client.id}`}
                          className="p-2 bg-slate-900/40 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-indigo-400 transition-all"
                          title="Ver Logs de Mensagens do WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => window.location.href = `/admin/tickets?client=${client.client_id || client.id}`}
                          className="p-2 bg-slate-900/40 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-all"
                          title="Histórico de Suporte / Tickets"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>

                        {/* Botões do Core de Sincronismo e Edição */}
                        <button 
                          onClick={() => handleSyncInstance(client.id)}
                          className="p-2 bg-slate-900/40 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-purple-400 transition-all"
                          title="Sincronizar Docker / Webhook no Backend"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => setEditingClient(client)}
                          className="p-2 bg-slate-900/40 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                          title="Editar Ficheiro do Cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 bg-slate-900/40 border border-slate-800 text-slate-500 rounded-xl hover:bg-red-950/40 hover:text-red-400 transition-all"
                          title="Eliminar Base e Destruir Instância"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredClients.length === 0 && (
          <div className="p-20 text-center bg-slate-900/10">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-slate-500 font-medium text-sm">Nenhum registo real encontrado para os critérios de busca.</p>
          </div>
        )}
      </div>

      {/* 5. METADADOS E SEGURANÇA (Footer Card) */}
      <div className="bg-gradient-to-r from-indigo-950/20 to-slate-900/40 border border-slate-900 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 backdrop-blur-sm">
        <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-inner shrink-0 text-indigo-400">
          <Layers className="w-6 h-6" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-base font-bold text-white tracking-tight">Isolamento de Base de Dados Ativo</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">
            Toda a arquitetura do ecossistema TrataTudo processa dados em isolamento lógico estrito. Modificações de prompts, chaves de webhook ou tokens API efetuadas através deste painel administrativo impactam unicamente o contexto mapeado por <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-indigo-400 text-[11px]">client_id</span>.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[8px] font-mono uppercase text-slate-500 tracking-wider">IA Sandbox</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[8px] font-mono uppercase text-slate-500 tracking-wider">Multi-Tenant</span>
          </div>
        </div>
      </div>

      {/* MODALS RE-ESTILIZADOS (Mantendo formulários e submissões nativas) */}
      <AnimatePresence>
        {/* Modal: Criar Cliente */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden text-slate-200"
            >
              <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <div>
                  <h3 className="font-black text-white text-lg">Adicionar Cliente no Hub</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Provisionamento automático de 3 dias no cluster central</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateTrial} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Designação Comercial / Empresa</label>
                    <input 
                      type="text" 
                      placeholder="Ex: P.M. Construções Unipessoal Lda"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold text-slate-100 placeholder-slate-600 transition-all"
                      value={newClient.company_name}
                      onChange={e => setNewClient({...newClient, company_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Contacto WhatsApp (E164)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: +351923364360"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold font-mono text-slate-100 placeholder-slate-600 transition-all"
                      value={newClient.phone_e164}
                      onChange={e => setNewClient({...newClient, phone_e164: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome do Responsável</label>
                    <input 
                      type="text" 
                      placeholder="Nome do Gestor"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold text-slate-100 placeholder-slate-600 transition-all"
                      value={newClient.contact_name}
                      onChange={e => setNewClient({...newClient, contact_name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Endereço de Email Corporativo</label>
                  <input 
                    type="email" 
                    placeholder="geral@empresa.pt"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold font-mono text-slate-100 placeholder-slate-600 transition-all"
                    value={newClient.email}
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Plano Estrutural de Faturação</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold text-slate-300 transition-all"
                    value={newClient.plan}
                    onChange={e => setNewClient({...newClient, plan: e.target.value as any})}
                  >
                    <option value="starter">Starter Plan</option>
                    <option value="pro">Pro Scale</option>
                    <option value="enterprise">Enterprise Core</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Diretivas Base do Agente IA (Prompt Sistema)</label>
                  <textarea 
                    rows={4}
                    placeholder="Instruções de comportamento da IA e regras de negócio do cliente..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs text-slate-300 font-medium placeholder-slate-600 transition-all"
                    value={newClient.bot_instructions}
                    onChange={e => setNewClient({...newClient, bot_instructions: e.target.value})}
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={processing}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Inicializar Sandbox no Hub"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal: Prolongar Trial */}
        {isProlongModalOpen && prolongingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <h3 className="font-bold text-white text-sm">Ajustar Período de Testes</h3>
                <button onClick={() => setIsProlongModalOpen(false)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6 space-y-5 text-center">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Incrementar dias operacionais para a licença de <br />
                  <span className="font-bold text-white text-sm">{prolongingClient.company_name}</span>
                </p>
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-xl flex gap-3 text-left">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-300 font-medium leading-relaxed">Esta diretiva aguarda a publicação das tabelas de mutação no endpoint correspondente do backend.</p>
                </div>
                <button 
                  onClick={handleProlongTrial}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-slate-300 py-3 rounded-xl font-bold text-xs border border-slate-800 transition-all"
                >
                  Fechar Janela
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Editar Cliente */}
        {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden text-slate-200"
            >
              <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <div>
                  <h3 className="font-black text-white text-lg">Modificar Ficheiro do Cliente</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {editingClient.client_id || editingClient.id}</p>
                </div>
                <button onClick={() => setEditingClient(null)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleUpdateClient} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome da Entidade / Empresa</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold text-slate-100 transition-all"
                      value={editingClient.company_name}
                      onChange={e => setEditingClient({...editingClient, company_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Principal</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold font-mono text-slate-100 transition-all"
                      value={editingClient.email || ''}
                      onChange={e => setEditingClient({...editingClient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Contacto Telefónico</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold font-mono text-slate-100 transition-all"
                      value={editingClient.phone || ''}
                      onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nível de Acesso (Plano SaaS)</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-bold text-slate-300 transition-all"
                    value={editingClient.plan}
                    onChange={e => setEditingClient({...editingClient, plan: e.target.value as any})}
                  >
                    <option value="starter">Starter Plan</option>
                    <option value="pro">Pro Scale</option>
                    <option value="enterprise">Enterprise Core</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Prompt do Bot (Comportamento Customizado)</label>
                  <textarea 
                    rows={6}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs text-slate-300 font-medium transition-all"
                    value={editingClient.bot_instructions || ''}
                    onChange={e => setEditingClient({...editingClient, bot_instructions: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="flex-1 px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gravar Metadados"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
