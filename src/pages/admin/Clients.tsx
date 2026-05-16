import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Clock, ShieldCheck, Phone, Mail, Monitor, 
  Copy, Zap, ShieldAlert, MessageSquare, ClipboardList, 
  RefreshCw, Edit2, Trash2, Layers, Bot, X, Loader2, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../lib/api'; // Ajusta os caminhos se necessário
import { extractArrayResponse } from '../../lib/utils';
import { cn } from '../../lib/utils';

// 1. INTERFACE REESTRUTURADA PARA O BACKEND MULTITENANT
interface Client {
  id: string;
  client_id?: string;
  company_name: string;
  phone: string;
  phone_e164: string;
  email: string | null;
  status: 'active' | 'suspended' | 'trial' | 'pending';
  plan: 'starter' | 'pro' | 'enterprise';
  trial_end?: string;
  production_activated_at?: string;
  master_prompt?: string;
  bot_instructions?: string;
  bot_instructions_compact?: string;
  instance?: {
    instance_name: string;
    is_hub: boolean;
  } | null;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(new URLSearchParams(window.location.search).get('search') || '');
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'active' | 'suspended' | 'trial'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProlongModalOpen, setIsProlongModalOpen] = useState(false);
  const [isBotConfigModalOpen, setIsBotConfigModalOpen] = useState(false); // Modal focado em IA
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [prolongingClient, setProlongingClient] = useState<Client | null>(null);
  const [botClient, setBotClient] = useState<Client | null>(null); // State para o bot ativo

  // Form States
  const [newClient, setNewClient] = useState({
    phone_e164: '',
    company_name: '',
    contact_name: '',
    email: '',
    bot_instructions: '',
    plan: 'starter' as const
  });
  
  // States dedicados para os 3 Prompts da Evolution API
  const [botConfig, setBotConfig] = useState({
    master_prompt: '',
    bot_instructions: '',
    bot_instructions_compact: ''
  });

  const [processing, setProcessing] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet('/api/admin/clients');
      const clientsData = extractArrayResponse<Client>(data, 'clients');
      setClients(clientsData);
    } catch (err: any) {
      console.error('[ADMIN] Fetch clients failed:', err);
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

  // Atualização cadastral básica
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || processing) return;
    try {
      setProcessing(true);
      await apiPut(`/api/admin/clients/${editingClient.id}`, editingClient);
      toast.success('Dados cadastrais atualizados!');
      await fetchClients();
      setEditingClient(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ROTA CRÍTICA: Gravar Configurações de IA na Evolution API
  const handleSaveBotConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botClient || processing) return;
    try {
      setProcessing(true);
      await apiPut(`/api/admin/clients/${botClient.id}/bot-config`, botConfig);
      toast.success('Engine de IA e Prompts da Evolution API sincronizados!');
      await fetchClients();
      setIsBotConfigModalOpen(false);
      setBotClient(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar prompts de IA');
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

  const openBotConfig = (client: Client) => {
    setBotClient(client);
    setBotConfig({
      master_prompt: client.master_prompt || '',
      bot_instructions: client.bot_instructions || '',
      bot_instructions_compact: client.bot_instructions_compact || ''
    });
    setIsBotConfigModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Hostname copiado');
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.client_id || client.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filtroStatus === 'all' || client.status === filtroStatus;
    return matchesSearch && matchesStatus;
  });

  const totalContas = clients.length;
  const ativasContas = clients.filter(c => c.status === 'active').length;
  const trialContas = clients.filter(c => c.status === 'trial' || c.instance?.is_hub).length;
  const suspensasContas = clients.filter(c => c.status === 'suspended').length;

  if (loading && clients.length === 0) return <div className="p-20 text-center text-indigo-400 font-mono">A ler infraestrutura de rede segura...</div>;
  if (error && clients.length === 0) return <div className="p-20 text-center text-red-400 font-mono">Erro: {error}</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 sm:px-6 text-slate-100 antialiased">
      {/* 1. HEADER DA PÁGINA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" /> TrataTudo Core Engine
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">Gestão de Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">Monitorização de instâncias e provisionamento de inteligência artificial.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar por empresa, id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-500 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Criar Novo Trial
          </button>
        </div>
      </div>

      {/* 2. BLOCOS DE MÉTRICAS */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Licenças</span>
          <span className="text-2xl font-black text-white mt-2 block">{totalContas}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Operações Ativas</span>
          <span className="text-2xl font-black text-emerald-400 mt-2 block">{ativasContas}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Em Período Trial</span>
          <span className="text-2xl font-black text-blue-400 mt-2 block">{trialContas}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Contas Suspensas</span>
          <span className="text-2xl font-black text-red-400 mt-2 block">{suspensasContas}</span>
        </div>
      </section>

      {/* 3. FILTROS AVANÇADOS */}
      <div className="bg-slate-900/60 border border-slate-900 p-2 rounded-xl inline-flex gap-1 max-w-full overflow-x-auto">
        {(['all', 'active', 'trial', 'suspended'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize",
              filtroStatus === status ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {status === 'all' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {/* 4. TABELA DE COMPONENTES OPERACIONAIS */}
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
                const isTrial = client.status === 'trial' || client.instance?.is_hub === true;
                return (
                  <tr key={client.id} className="group hover:bg-slate-900/30 transition-colors">
                    <td className="px-8 py-5.5">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", isTrial ? "text-blue-400 bg-blue-500/5" : "text-emerald-400 bg-emerald-500/5")}>
                          {isTrial ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{client.company_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{client.phone} • {client.email || 'sem e-mail'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5.5">
                      <div className="flex flex-col font-mono text-xs text-slate-400">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{isTrial ? 'Trial Shared Hub' : 'Instância Dedicada'}</span>
                        <span className="flex items-center gap-1 mt-1"><Monitor className="w-3 h-3" /> {client.instance?.instance_name || 'Ausente'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5.5">
                      <div className="flex flex-col font-mono text-xs">
                        <span className="font-bold text-white uppercase tracking-tight flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {client.plan}</span>
                        {client.trial_end && <span className="text-[10px] text-slate-500 mt-1">Expira: {new Date(client.trial_end).toLocaleDateString('pt-PT')}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border", client.status === 'active' ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" : "text-red-400 bg-red-500/5 border-red-500/10")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", client.status === 'active' ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
                        {client.status}
                      </span>
                    </td>
                    <td className="px-8 py-5.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* BOTÃO CRÍTICO: CONFIGURAR IA DO BOT (Evolution API) */}
                        <button onClick={() => openBotConfig(client)} className="p-2 bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="Configurar Prompts do Agente IA">
                          <Bot className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(client.id, client.status)} className="p-2 bg-slate-900/40 border border-slate-800 text-slate-400 rounded-xl hover:text-red-400 transition-all">
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingClient(client)} className="p-2 bg-slate-900/40 border border-slate-800 text-slate-400 rounded-xl hover:text-white transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClient(client.id)} className="p-2 bg-slate-900/40 border border-slate-800 text-slate-500 rounded-xl hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: CONFIGURAÇÃO DO BOT / EVOLUTION API (OS 3 PROMPTS) */}
      <AnimatePresence>
        {isBotConfigModalOpen && botClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden text-slate-200">
              <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <div>
                  <h3 className="font-black text-white text-lg">Injetar Engine de IA (Evolution API)</h3>
                  <p className="text-[11px] text-indigo-400 font-mono mt-0.5">{botClient.company_name}</p>
                </div>
                <button onClick={() => setIsBotConfigModalOpen(false)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleSaveBotConfig} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex gap-3 text-left">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-300 leading-relaxed">Estes parâmetros alimentam o comportamento em tempo real do assistente do cliente. Nunca utilizes dados de outros tenants aqui.</p>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">1. Master Prompt (Contexto Global)</label>
                  <textarea
                    rows={4}
                    placeholder="Tu és o assistente virtual da empresa X..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-mono text-slate-300"
                    value={botConfig.master_prompt}
                    onChange={e => setBotConfig({...botConfig, master_prompt: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">2. Bot Instructions (Regras de Negócio e Fluxos)</label>
                  <textarea
                    rows={4}
                    placeholder="Regra 1: Nunca dês preços sem o NIF. Regra 2: Agenda chamadas na segunda-feira..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-mono text-slate-300"
                    value={botConfig.bot_instructions}
                    onChange={e => setBotConfig({...botConfig, bot_instructions: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">3. Bot Instructions Compact (Memória Flash / Restrições Rápidas)</label>
                  <textarea
                    rows={2}
                    placeholder="Seja extremamente curto. Limite de 2 parágrafos por mensagem."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-xs font-mono text-slate-300"
                    value={botConfig.bot_instructions_compact}
                    onChange={e => setBotConfig({...botConfig, bot_instructions_compact: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsBotConfigModalOpen(false)} className="flex-1 px-5 py-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl font-bold text-xs">Cancelar</button>
                  <button type="submit" disabled={processing} className="flex-1 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-500 flex items-center justify-center gap-2">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gravar e Sincronizar Instância"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDITAR CADASTRO BÁSICO */}
      <AnimatePresence>
        {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden text-slate-200">
              <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <h3 className="font-black text-white text-lg">Modificar Cadastro Geral</h3>
                <button onClick={() => setEditingClient(null)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleUpdateClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome da Entidade</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white" value={editingClient.company_name} onChange={e => setEditingClient({...editingClient, company_name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Principal</label>
                    <input type="email" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" value={editingClient.email || ''} onChange={e => setEditingClient({...editingClient, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Contacto</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" value={editingClient.phone || ''} onChange={e => setEditingClient({...editingClient, phone: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingClient(null)} className="flex-1 px-5 py-3 bg-slate-950 text-slate-400 rounded-xl font-bold text-xs">Cancelar</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl font-bold text-xs">Gravar Metadados</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
