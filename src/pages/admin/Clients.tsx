import React, { useState, useEffect } from 'react';
import { motion, import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializa o cliente do Supabase (Ajusta com as tuas variáveis de ambiente do Next/Vite)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface WaChat {
  id: string;
  phone_e164: string;
  current_intent: string;
  paused: boolean;
  context_data: {
    nome?: string;
    empresa?: string;
    email?: string;
  };
  updated_at: string;
}

interface ClientInstance {
  id: string;
  company_name: string;
  evolution_instance_name: string;
  evolution_status: 'connected' | 'disconnected' | 'connecting';
  apikey: string;
}

export default function ModernAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'chats' | 'instances'>('chats');
  const [chats, setChats] = useState<WaChat[]>([]);
  const [instances, setInstances] = useState<ClientInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<ClientInstance | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      // Procurar chats do WhatsApp
      const { data: chatData } = await supabase
        .from('wa_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      // Procurar os teus clientes e as respetivas configurações da Evolution API
      const { data: clientData } = await supabase
        .from('clients')
        .select('id, company_name, evolution_instance_name, evolution_status, apikey');

      if (chatData) setChats(chatData as WaChat[]);
      if (clientData) setInstances(clientData as any[]);
      setLoading(false);
    }

    loadDashboardData();

    // ⚡ REALTIME para os chats (atualiza leads e intenções no ecrã na hora)
    const chatChannel = supabase
      .channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', pattern: 'public', table: 'wa_chats' }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, []);

  // Alternar Estado do Bot (Human Takeover)
  const toggleBot = async (chatId: string, currentPausedStatus: boolean) => {
    const { error } = await supabase
      .from('wa_chats')
      .update({ paused: !currentPausedStatus })
      .eq('id', chatId);

    if (!error) {
      setChats(chats.map(c => c.id === chatId ? { ...c, paused: !currentPausedStatus } : c));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 font-medium">A carregar o ecossistema TrataTudo...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              TrataTudo V2 Hub Admin
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Gestão de Instâncias & Conversas Automáticas</p>
          </div>
          
          {/* Mobile-Friendly Tabs Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💬 Leads & IA
            </button>
            <button
              onClick={() => setActiveTab('instances')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'instances' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔌 Instâncias Evolution
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* TAB 1: LEADS & IA */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            <div className="hidden md:block overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
              {/* Layout Desktop */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Intenção Identificada</th>
                    <th className="p-4">Metadados Capturados</th>
                    <th className="p-4 text-center">Ação (Human Takeover)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {chats.map(chat => (
                    <tr key={chat.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{chat.context_data.nome || 'Lead Novo'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{chat.phone_e164}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          chat.current_intent === 'white_label' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          chat.current_intent === 'vendas_crm_ia' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {chat.current_intent === 'white_label' ? '🚀 Revenda White Label' :
                           chat.current_intent === 'vendas_crm_ia' ? '💼 Comprar CRM' : '💬 Dúvida Geral'}
                        </span>
                      </td>
                      <td className="p-4 text-xs space-y-1">
                        {chat.context_data.empresa && <div><span className="text-slate-500">Empresa:</span> <span className="text-slate-200 font-medium">{chat.context_data.empresa}</span></div>}
                        {chat.context_data.email && <div><span className="text-slate-500">Email:</span> <span className="text-slate-200 font-medium">{chat.context_data.email}</span></div>}
                        {!chat.context_data.empresa && !chat.context_data.email && <span className="text-slate-600 italic">A processar...</span>}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleBot(chat.id, chat.paused)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all border ${
                            chat.paused 
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {chat.paused ? '⏸️ Assumido por Humano' : '🤖 Bot a Responder'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Layout Mobile (Transforma linhas em cartões independentes ao toque) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {chats.map(chat => (
                <div key={chat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-base text-white">{chat.context_data.nome || 'Lead Novo'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{chat.phone_e164}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      chat.current_intent === 'white_label' ? 'bg-purple-500/20 text-purple-300' :
                      chat.current_intent === 'vendas_crm_ia' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {chat.current_intent === 'white_label' ? 'WhiteLabel' : chat.current_intent === 'vendas_crm_ia' ? 'CRM' : 'Geral'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs space-y-1">
                    {chat.context_data.empresa && <div><span className="text-slate-500">Empresa:</span> <span className="text-slate-300 font-medium">{chat.context_data.empresa}</span></div>}
                    {chat.context_data.email && <div><span className="text-slate-500">Email:</span> <span className="text-slate-300 font-medium">{chat.context_data.email}</span></div>}
                    {!chat.context_data.empresa && !chat.context_data.email && <span className="text-slate-600 italic">Nenhum dado capturado ainda.</span>}
                  </div>

                  <button
                    onClick={() => toggleBot(chat.id, chat.paused)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      chat.paused 
                        ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-600' 
                        : 'bg-slate-850 hover:bg-slate-800 text-emerald-400 border-slate-750'
                    }`}
                  >
                    {chat.paused ? '⏸️ IA Pausada - Estás a falar Tu' : '🤖 IA Ativa (Mudar para Humano)'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INSTÂNCIAS EVOLUTION API (Para o negócio dos clientes) */}
        {activeTab === 'instances' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white mb-2">Painel de Integrações WhatsApp</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Gere os canais de comunicação dos teis clientes. Cada cliente tem direito a uma instância dedicada da Evolution API para ligar o seu próprio WhatsApp comercial.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {instances.map(inst => (
                  <div key={inst.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500">ID da Conta: #{inst.id}</span>
                        <span className={`h-2 w-2 rounded-full ${
                          inst.evolution_status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`}></span>
                      </div>
                      <h4 className="font-bold text-white text-base truncate">{inst.company_name}</h4>
                      <p className="text-xs text-slate-400 mt-1">Instância: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400">{inst.evolution_instance_name || 'Não gerada'}</code></p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-900 flex gap-2">
                      <button 
                        onClick={() => setSelectedInstance(inst)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        ⚙️ Gerir Conexão
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal de Gestão de Instância Dedicada (Pop-up lindo e responsivo) */}
            {selectedInstance && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                  <h3 className="text-lg font-bold text-white mb-1">Instância {selectedInstance.company_name}</h3>
                  <p className="text-xs text-slate-400 mb-4">Configuração técnica da Evolution API.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Técnico da Instância</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedInstance.evolution_instance_name}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs p-2.5 rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Chave de API (ApiKey)</label>
                      <input 
                        type="password" 
                        readOnly 
                        value={selectedInstance.apikey || '••••••••••••••••'}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs p-2.5 rounded-xl outline-none"
                      />
                    </div>

                    {/* Espaço simulador para renderizar o QR Code da Evolution API obtido via fetch */}
                    <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center py-6">
                      <div className="h-32 w-32 bg-white rounded-lg flex items-center justify-center font-bold text-slate-900 text-xs shadow-inner">
                        [QR CODE REAL]
                      </div>
                      <p className="text-[11px] text-slate-500 mt-3 max-w-xs">
                        Pede ao cliente para ler este código com o WhatsApp do telemóvel dele (Definições &gt; Dispositivos Associados) para ativar o serviço na empresa dele.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button 
                      onClick={() => alert('A sincronizar com o servidor da Evolution API...')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      🔄 Sincronizar Estado
                    </button>
                    <button 
                      onClick={() => setSelectedInstance(null)}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
 } from 'motion/react';
import { 
  Search, 
  Plus, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Bot, 
  Trash2, 
  Edit2, 
  ShieldAlert, 
  X, 
  Loader2,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  Calendar,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Send,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../lib/api';
import { extractArrayResponse, cn } from '../../lib/utils';
import { LoadingState, ErrorState } from '../../components/States';

// --- TYPES ---

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone_e164: string;
  status: 'active' | 'suspended' | 'pending' | 'trial';
  plan: 'starter' | 'pro' | 'enterprise';
  trial_start: string | null;
  trial_end: string | null;
  production_activated_at: string | null;
  bot_instructions?: string;
  master_prompt?: string;
  bot_instructions_compact?: string;
  created_at: string;
  instance?: {
    instance_name: string;
    status: string;
    is_hub: boolean;
  } | null;
}

type FilterType = 'all' | 'active' | 'trial' | 'suspended';

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBotConfigModalOpen, setIsBotConfigModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form States
  const [createForm, setCreateForm] = useState({
    phone_e164: '',
    company_name: '',
    contact_name: '',
    email: '',
    bot_instructions: '',
    plan: 'starter' as 'starter' | 'pro' | 'enterprise'
  });

  const [botConfigForm, setBotConfigForm] = useState({
    master_prompt: '',
    bot_instructions: '',
    bot_instructions_compact: ''
  });

  const [editForm, setEditForm] = useState<Partial<Client>>({});

  // --- API HANDLERS ---

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/admin/clients');
      const clientsData = extractArrayResponse<Client>(data, 'clients');
      setClients(clientsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await apiPost('/api/admin/clients/trial', createForm);
      toast.success('Trial criado com sucesso!');
      setIsCreateModalOpen(false);
      setCreateForm({
        phone_e164: '',
        company_name: '',
        contact_name: '',
        email: '',
        bot_instructions: '',
        plan: 'starter'
      });
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar trial');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateBotConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setProcessing(true);
    try {
      await apiPut(`/api/admin/clients/${selectedClient.id}/bot-config`, botConfigForm);
      toast.success('Configuração de IA sincronizada!');
      setIsBotConfigModalOpen(false);
      fetchClients();
      // Update selected client locally
      setSelectedClient(prev => prev ? { ...prev, ...botConfigForm } : null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar IA');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await apiPatch(`/api/admin/clients/${id}/status`, { status: newStatus });
      toast.success(`Status alterado para ${newStatus}`);
      fetchClients();
      if (selectedClient?.id === id) {
        setSelectedClient(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar status');
    }
  };

  const handleActivateProduction = async (id: string) => {
    if (!confirm('Ativar Modo Produção agora? Esta ação iniciará o provisionamento de uma instância dedicada.')) return;
    setProcessing(true);
    try {
      await apiPost(`/api/admin/clients/${id}/activate-production`);
      toast.success('Modo Produção ativado! Provisionando...');
      fetchClients();
      setSelectedClient(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ativar produção');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Eliminar permanentemente este tenant? Todos os dados serão removidos.')) return;
    try {
      await apiDelete(`/api/admin/clients/${id}`);
      toast.success('Tenant eliminado');
      fetchClients();
      setSelectedClient(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao eliminar tenant');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setProcessing(true);
    try {
      await apiPut(`/api/admin/clients/${selectedClient.id}`, editForm);
      toast.success('Cadastro atualizado');
      setIsEditModalOpen(false);
      fetchClients();
      setSelectedClient(prev => prev ? { ...prev, ...editForm } : null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar cadastro');
    } finally {
      setProcessing(false);
    }
  };

  // --- HELPERS ---

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone_e164.includes(searchTerm);
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && c.status === 'active') ||
                         (filter === 'trial' && (c.status === 'trial' || c.status === 'pending')) ||
                         (filter === 'suspended' && c.status === 'suspended');
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Ativo', classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 };
      case 'suspended': return { label: 'Suspenso', classes: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: AlertTriangle };
      case 'trial': return { label: 'Trial', classes: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: Clock };
      default: return { label: 'Pendente', classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Loader2 };
    }
  };

  if (loading && clients.length === 0) return <LoadingState message="Sincronizando base de clientes..." />;
  if (error && clients.length === 0) return <ErrorState message={error} />;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* 1. HEADER & SEARCH */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <h1 className="text-xs font-black text-slate-500 uppercase tracking-widest">TrataTudo Core Engine</h1>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Gestão de Clientes</h2>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 md:px-5 md:py-2.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden md:inline font-bold">Novo Trial</span>
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar por empresa ou telefone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Segmented Filter */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start overflow-x-auto no-scrollbar max-w-full">
            {(['all', 'active', 'trial', 'suspended'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap",
                  filter === type 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {type === 'all' ? 'Todos' : type}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. CLIENT LIST (MOBILE-FIRST CARDS) */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => {
              const status = getStatusConfig(client.status);
              const isTrial = client.status === 'trial' || client.status === 'pending';
              
              return (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedClient(client)}
                  className="group bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/30 rounded-3xl p-5 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                >
                  {/* Card Background Glow */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full group-hover:bg-indigo-600/10 transition-colors" />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center p-3",
                      isTrial ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {isTrial ? <Clock className="w-full h-full" /> : <ShieldCheck className="w-full h-full" />}
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      status.classes
                    )}>
                      {status.label}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-lg font-black text-white leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
                      {client.company_name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {client.phone_e164}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="uppercase tracking-tighter">{client.plan}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredClients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <Bot className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">Nenhum tenant encontrado</h3>
            <p className="text-slate-500 max-w-xs mt-2">Ajuste os filtros ou crie um novo trial para começar.</p>
          </div>
        )}
      </main>

      {/* 3. CLIENT DETAIL DRAWER */}
      <AnimatePresence>
        {selectedClient && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-slate-900 border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{selectedClient.company_name}</h3>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-0.5">ID: {selectedClient.client_id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
                
                {/* 3.1 PROMINENT ACTION: ACTIVATE PRODUCTION */}
                {(selectedClient.status === 'trial' || selectedClient.status === 'pending') && (
                  <button 
                    onClick={() => handleActivateProduction(selectedClient.id)}
                    disabled={processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-xl shadow-emerald-600/20 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group relative mb-4 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/0 via-white/10 to-emerald-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Zap className="w-8 h-8 mb-1 animate-bounce" />
                    <span>ATIVAR MODO PRODUÇÃO</span>
                    <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Provisionar Instância Dedicada</span>
                  </button>
                )}

                {/* 3.2 CLIENT METADATA */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Dados de Contrato</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Plano Atual</label>
                        <div className="flex items-center gap-2 text-indigo-400 font-black uppercase text-sm">
                          <Zap className="w-3.5 h-3.5" />
                          {selectedClient.plan}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Instância</label>
                        <div className="text-sm font-bold text-slate-200 truncate pr-2">
                          {selectedClient.instance?.instance_name || 'N/A (Hub)'}
                        </div>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fim do Trial / Vencimento</label>
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {selectedClient.trial_end ? new Date(selectedClient.trial_end).toLocaleDateString() : 'Indeterminado'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contacto Direto</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-sm">{selectedClient.phone_e164}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-sm truncate">{selectedClient.email || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.3 SECONDARY ACTIONS CONTAINER */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Gestão Estratégica</h4>
                  
                  <button 
                    onClick={() => {
                      setBotConfigForm({
                        master_prompt: selectedClient.master_prompt || '',
                        bot_instructions: selectedClient.bot_instructions || '',
                        bot_instructions_compact: selectedClient.bot_instructions_compact || ''
                      });
                      setIsBotConfigModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/20 transition-all font-bold text-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5" />
                      <span>Configurar Engine de IA</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setEditForm({ ...selectedClient });
                        setIsEditModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 font-bold text-xs border border-white/5 transition-all"
                    >
                      <Edit2 className="w-4 h-4 text-indigo-400" />
                      Editar Dados
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedClient.id, selectedClient.status)}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3.5 rounded-2xl font-bold text-xs border transition-all",
                        selectedClient.status === 'active' 
                          ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-500" 
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-500"
                      )}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      {selectedClient.status === 'active' ? 'Suspender' : 'Reativar'}
                    </button>
                  </div>

                  <button 
                    onClick={() => handleDeleteTenant(selectedClient.id)}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-2xl font-bold text-xs border border-white/5 hover:border-rose-500 transition-all mt-4"
                  >
                    <Trash2 className="w-4 h-4" />
                    ELIMINAR TENANT DEFINITIVAMENTE
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. MODALS (CREATE, IA CONFIG, EDIT) */}
      <AnimatePresence>
        
        {/* NEW TRIAL MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl shadow-indigo-500/10"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Criar Conta Trial</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Instância Hub Automática</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTrial} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Empresa</label>
                      <input 
                        type="text" required placeholder="Ex: TrataTudo Lda"
                        value={createForm.company_name} onChange={e => setCreateForm({...createForm, company_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone (Whatsapp)</label>
                      <input 
                        type="text" required placeholder="+351912345678"
                        value={createForm.phone_e164} onChange={e => setCreateForm({...createForm, phone_e164: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Responsável</label>
                      <input 
                        type="text" placeholder="Nome do Admin"
                        value={createForm.contact_name} onChange={e => setCreateForm({...createForm, contact_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" placeholder="admin@empresa.com"
                        value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plano Target</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['starter', 'pro', 'enterprise'] as const).map(p => (
                        <button
                          key={p} type="button"
                          onClick={() => setCreateForm({...createForm, plan: p})}
                          className={cn(
                            "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all",
                            createForm.plan === p 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "bg-white/5 border-white/10 text-slate-400"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instruções Iniciais da IA</label>
                    <textarea 
                      rows={4} placeholder="Ex: Atua como um assistente de vendas da TrataTudo..."
                      value={createForm.bot_instructions} onChange={e => setCreateForm({...createForm, bot_instructions: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium min-h-[100px]"
                    />
                  </div>
                </div>
                <button 
                  type="submit" disabled={processing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 ml-1" /> Provisionar Trial Hub</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* IA CONFIG MODAL */}
        {isBotConfigModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsBotConfigModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/20 rounded-xl text-indigo-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Configuração IA Evolution</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Prompt Engineering & Hub Synch</p>
                  </div>
                </div>
                <button onClick={() => setIsBotConfigModalOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateBotConfig} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Master Prompt (Personalidade)</label>
                    <textarea 
                      rows={4} value={botConfigForm.master_prompt} onChange={e => setBotConfigForm({...botConfigForm, master_prompt: e.target.value})}
                      className="w-full bg-slate-950 font-mono text-xs p-4 rounded-2xl border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all"
                      placeholder="Identidade fundamental do bot..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Instructions (Regras de Negócio)</label>
                    <textarea 
                      rows={6} value={botConfigForm.bot_instructions} onChange={e => setBotConfigForm({...botConfigForm, bot_instructions: e.target.value})}
                      className="w-full bg-slate-950 font-mono text-xs p-4 rounded-2xl border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all"
                      placeholder="Instruções completas para operação..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Instructions Compact (Contexto Rápido)</label>
                    <textarea 
                      rows={3} value={botConfigForm.bot_instructions_compact} onChange={e => setBotConfigForm({...botConfigForm, bot_instructions_compact: e.target.value})}
                      className="w-full bg-slate-950 font-mono text-xs p-4 rounded-2xl border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all"
                      placeholder="Resumo para chamadas de baixa latência..."
                    />
                  </div>
                </div>
                <button 
                  type="submit" disabled={processing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sincronizar Engine de IA"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* EDIT CLIENT MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-xl font-black tracking-tight">Editar Cadastro</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Empresa</label>
                    <input 
                      type="text" value={editForm.company_name || ''} onChange={e => setEditForm({...editForm, company_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone Principal</label>
                    <input 
                      type="text" value={editForm.phone_e164 || ''} onChange={e => setEditForm({...editForm, phone_e164: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Operacional</label>
                    <input 
                      type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold"
                    />
                  </div>
                </div>
                <button 
                  type="submit" disabled={processing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Salvar Alterações"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* 5. FLOATING FOOTER STATUS */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none z-20 flex justify-center">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 flex items-center gap-4 pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Sync</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{clients.length} Clientes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
