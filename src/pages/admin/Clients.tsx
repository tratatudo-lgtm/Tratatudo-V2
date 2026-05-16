import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Clock, ShieldCheck, Monitor, Zap, ShieldAlert, 
  Bot, X, Loader2, AlertCircle, Edit2, Trash2, Mail, Phone, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../lib/api';
import { extractArrayResponse } from '../../lib/utils';
import { cn } from '../../lib/utils';

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

  // Modals / Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null); 
  const [isBotConfigOpen, setIsBotConfigOpen] = useState(false);
  const [isEditRegisterOpen, setIsEditRegisterOpen] = useState(false);

  // Form States
  const [newClient, setNewClient] = useState({
    phone_e164: '',
    company_name: '',
    contact_name: '',
    email: '',
    bot_instructions: '',
    plan: 'starter' as const
  });

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
    } finaly {
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
    } finaly {
      setProcessing(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || processing) return;
    try {
      setProcessing(true);
      await apiPut(`/api/admin/clients/${selectedClient.id}`, selectedClient);
      toast.success('Dados cadastrais atualizados!');
      await fetchClients();
      setIsEditRegisterOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finaly {
      setProcessing(false);
    }
  };

  const handleSaveBotConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || processing) return;
    try {
      setProcessing(true);
      await apiPut(`/api/admin/clients/${selectedClient.id}/bot-config`, botConfig);
      toast.success('Engine de IA e Prompts sincronizados!');
      await fetchClients();
      setIsBotConfigOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar prompts de IA');
    } finaly {
      setProcessing(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este cliente? Esta ação é irreversível.')) return;
    try {
      setProcessing(true);
      await apiDelete(`/api/admin/clients/${id}`);
      toast.success('Cliente eliminado com sucesso.');
      setSelectedClient(null);
      await fetchClients();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao eliminar cliente');
    } finaly {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await apiPatch(`/api/admin/clients/${id}/status`, { status: newStatus });
      toast.success(`Cliente ${newStatus === 'active' ? 'reativado' : 'suspenso'}.`);
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
      if (selectedClient?.id === id) {
        setSelectedClient(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar estado do cliente (403/Erro de Permissão)');
    }
  };

  const handleActivateProduction = async (id: string) => {
    if (!confirm('Deseja ativar o modo de produção para este cliente? Isto criará uma instância dedicada.')) return;
    try {
      setProcessing(true);
      await apiPost(`/api/admin/clients/${id}/activate-production`);
      toast.success('Produção ativada! Instância dedicada em criação.');
      await fetchClients();
      setSelectedClient(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ativar produção');
    } finaly {
      setProcessing(false);
    }
  };

  const openBotConfig = (client: Client) => {
    setBotConfig({
      master_prompt: client.master_prompt || '',
      bot_instructions: client.bot_instructions || '',
      bot_instructions_compact: client.bot_instructions_compact || ''
    });
    setIsBotConfigOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.client_id || client.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filtroStatus === 'all' || client.status === filtroStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading && clients.length === 0) return <div className="p-20 text-center text-indigo-400 font-mono">A ler infraestrutura de rede segura...</div>;
  if (error && clients.length === 0) return <div className="p-20 text-center text-red-400 font-mono">Erro: {error}</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 px-4 text-slate-100 antialiased">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" /> TrataTudo Core Engine
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">Gestão de Clientes</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 text-white py-3 px-5 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 active:scale-95">
            <Plus className="w-4 h-4" /> Novo Trial
          </button>
        </div>
      </div>

      {/* FILTROS DE ESTADO QUICK-SELECT */}
      <div className="bg-slate-900/60 border border-slate-900 p-1 rounded-xl flex gap-1 overflow-x-auto w-full no-scrollbar">
        {(['all', 'active', 'trial', 'suspended'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize flex-1 text-center whitespace-nowrap",
              filtroStatus === status ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400"
            )}
          >
            {status === 'all' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {/* LISTAGEM RESPONSIVA (OTIMIZADA PARA TELEMÓVEL) */}
      <div className="space-y-3">
        {filteredClients.map((client) => {
          const isTrial = client.status === 'trial' || client.instance?.is_hub === true;
          return (
            <div 
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-4 flex items-center justify-between gap-4 active:bg-slate-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", isTrial ? "text-blue-400 bg-blue-500/5" : "text-emerald-400 bg-emerald-500/5")}>
                  {isTrial ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{client.company_name}</p>
                  <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{client.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", 
                  client.status === 'active' ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" : 
                  client.status === 'trial' ? "text-blue-400 bg-blue-500/5 border-blue-500/10" : "text-red-400 bg-red-500/5 border-red-500/10"
                )}>
                  {client.status}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 📱 DRAWER LATERAL: CENTRAL DE CONTROLO DO CLIENTE (MOBILE FIRST) */}
      <AnimatePresence>
        {selectedClient && !isBotConfigOpen && !isEditRegisterOpen && (
          <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedClient(null)}>
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden text-slate-200"
            >
              {/* Header do Drawer */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
                <div>
                  <span className="text-[10px] font-mono bg-slate-800 text-indigo-400 px-2 py-0.5 rounded border border-slate-700 font-bold uppercase">{selectedClient.plan}</span>
                  <h3 className="font-black text-white text-xl mt-1.5 truncate max-w-[280px]">{selectedClient.company_name}</h3>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl"><X className="w-5 h-5" /></button>
              </div>

              {/* Corpo / Informações Expandidas */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Status Operacional */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Estado do Serviço:</span>
                    <span className="font-bold text-white capitalize">{selectedClient.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Instância Atribuda:</span>
                    <span className="font-mono text-slate-300 flex items-center gap-1"><Monitor className="w-3 h-3 text-indigo-400" /> {selectedClient.instance?.instance_name || 'Nenhuma'}</span>
                  </div>
                  {selectedClient.trial_end && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Fim do Período Trial:</span>
                      <span className="font-mono text-blue-400 font-bold">{new Date(selectedClient.trial_end).toLocaleDateString('pt-PT')}</span>
                    )}
                </div>

                {/* Contactos Rápidos */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm bg-slate-950/20 p-3 rounded-xl border border-slate-900">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="font-mono text-xs">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-slate-950/20 p-3 rounded-xl border border-slate-900">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-xs truncate">{selectedClient.email || 'Sem e-mail cadastrado'}</span>
                  </div>
                </div>

                {/* 🚀 BOTÃO GIGANTE: ATIVAR MODO PRODUÇÃO (O QUE FALTAVA!) */}
                {selectedClient.status === 'trial' && (
                  <button 
                    onClick={() => handleActivateProduction(selectedClient.id)}
                    disabled={processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
                    ATIVAR MODO PRODUÇÃO (Dedicado)
                  </button>
                )}

                {/* BOTÕES DE AÇÃO DE INFRAESTRUTURA */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => openBotConfig(selectedClient)}
                    className="bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:bg-indigo-900"
                  >
                    <Bot className="w-4 h-4" /> Configurar IA
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(selectedClient.id, selectedClient.status)}
                    className={cn("border py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all", 
                      selectedClient.status === 'active' ? "bg-red-950/40 border-red-900/50 text-red-400" : "bg-emerald-950/40 border-emerald-900/50 text-emerald-400"
                    )}
                  >
                    <ShieldAlert className="w-4 h-4" /> 
                    {selectedClient.status === 'active' ? 'Suspender Conta' : 'Reativar Conta'}
                  </button>
                </div>

                {/* EDICÃO E REMOÇÃO */}
                <div className="pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3">
                  <button onClick={() => setIsEditRegisterOpen(true)} className="bg-slate-800 border border-slate-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" /> Editar Cadastro
                  </button>
                  <button onClick={() => handleDeleteClient(selectedClient.id)} className="bg-slate-950 border border-red-950 text-red-500 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-950/20">
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar Tenant
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SUB-NÍVEL: PROMPTS DE IA */}
      <AnimatePresence>
        {isBotConfigOpen && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden text-slate-200">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-lg">Engine de IA (Evolution API)</h3>
                  <p className="text-xs text-indigo-400 font-mono">{selectedClient.company_name}</p>
                </div>
                <button onClick={() => setIsBotConfigOpen(false)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSaveBotConfig} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">1. Master Prompt</label>
                  <textarea rows={4} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 outline-none" value={botConfig.master_prompt} onChange={e => setBotConfig({...botConfig, master_prompt: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">2. Bot Instructions</label>
                  <textarea rows={4} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 outline-none" value={botConfig.bot_instructions} onChange={e => setBotConfig({...botConfig, bot_instructions: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">3. Bot Instructions Compact</label>
                  <textarea rows={2} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 outline-none" value={botConfig.bot_instructions_compact} onChange={e => setBotConfig({...botConfig, bot_instructions_compact: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsBotConfigOpen(false)} className="flex-1 py-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl font-bold text-xs">Voltar</button>
                  <button type="submit" disabled={processing} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sincronizar IA"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SUB-NÍVEL: EDITAR METADADOS CADASTRAIS */}
      <AnimatePresence>
        {isEditRegisterOpen && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-lg overflow-hidden text-slate-200">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-white text-lg">Modificar Cadastro Geral</h3>
                <button onClick={() => setIsEditRegisterOpen(false)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleUpdateClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome da Entidade</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none" value={selectedClient.company_name} onChange={e => setSelectedClient({...selectedClient, company_name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Principal</label>
                  <input type="email" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none" value={selectedClient.email || ''} onChange={e => setSelectedClient({...selectedClient, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Contacto Telefónico</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none" value={selectedClient.phone || ''} onChange={e => setSelectedClient({...selectedClient, phone: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditRegisterOpen(false)} className="flex-1 py-3 bg-slate-950 text-slate-400 rounded-xl font-bold text-xs">Voltar</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl font-bold text-xs">Gravar Metadados</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PRINCIPAL: CRIAR NOVO TRIAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-md overflow-hidden text-slate-200">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-white text-lg">Criar Conta Trial</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreateTrial} className="p-6 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome da Empresa</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none" value={newClient.company_name} onChange={e => setNewClient({...newClient, company_name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Telemóvel (Formato E164)</label>
                  <input type="text" placeholder="+351912345678" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none font-mono" value={newClient.phone_e164} onChange={e => setNewClient({...newClient, phone_e164: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-slate-950 text-slate-400 rounded-xl font-bold text-xs">Cancelar</button>
                  <button type="submit" disabled={processing} className="flex-1 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Instância Hub"}
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
