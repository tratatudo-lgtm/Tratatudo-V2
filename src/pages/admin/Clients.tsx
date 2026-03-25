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
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { LoadingState, ErrorState } from '../../components/States';

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
  const [trialDays, setTrialDays] = useState(3);

  const { logout } = useAdminAuth();
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${baseUrl}/api/admin/clients`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        const clientsData = extractArrayResponse<Client>(data, 'clients');
        setClients(clientsData);
      } else if (res.status === 401) {
        await logout();
      } else {
        throw new Error('Falha ao carregar lista de clientes');
      }
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
      const response = await fetch(`${baseUrl}/api/admin/clients/trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
        credentials: 'include'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao criar cliente trial');
      }

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
      const response = await fetch(`${baseUrl}/api/admin/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClient),
        credentials: 'include'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao atualizar cliente');
      }

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
      const response = await fetch(`${baseUrl}/api/admin/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Falha ao eliminar cliente');

      toast.success('Cliente eliminado com sucesso.');
      await fetchClients();
    } catch (err) {
      toast.error('Erro ao eliminar cliente');
    } finally {
      setProcessing(false);
    }
  };

  const handleProlongTrial = async () => {
    if (!prolongingClient) return;

    const days = Number(trialDays);
    if (!Number.isFinite(days) || days <= 0) {
      toast.error('Número de dias inválido.');
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch(`${baseUrl}/api/admin/clients/${prolongingClient.id}/reactivate-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
        credentials: 'include'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao reativar trial');
      }

      toast.success(`Trial atribuído por ${days} dias.`);
      setIsProlongModalOpen(false);
      setProlongingClient(null);
      setTrialDays(3);
      await fetchClients();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao reativar trial');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const response = await fetch(`${baseUrl}/api/admin/clients/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Falha ao atualizar estado');
      
      toast.success(`Cliente ${newStatus === 'active' ? 'reativado' : 'suspenso'} com sucesso.`);
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (err) {
      toast.error('Erro ao atualizar estado do cliente');
    }
  };

  const handleActivateProduction = async (id: string) => {
    if (!confirm('Deseja ativar o modo de produção para este cliente? Isto criará uma instância dedicada.')) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/admin/clients/${id}/activate-production`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Falha ao ativar produção');
      
      toast.success('Produção ativada! Instância dedicada em criação.');
      await fetchClients();
    } catch (err) {
      toast.error('Erro ao ativar produção');
    }
  };

  const handleSyncInstance = async (id: string) => {
    try {
      setProcessing(true);

      const response = await fetch(`${baseUrl}/api/admin/clients/${id}/sync`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao sincronizar instância');
      }

      toast.success('Instância sincronizada com sucesso.');
      await fetchClients();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sincronizar instância');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const filteredClients = clients.filter(client => 
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.client_id || client.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrialStatus = (client: Client) => {
    if (!client.trial_end) return null;
    const now = new Date();
    const end = new Date(client.trial_end);
    if (end < now) return 'expired';
    if (client.status === 'suspended') return 'paused';
    return 'active';
  };

  if (loading && clients.length === 0) return <LoadingState message="A carregar clientes..." className="h-[60vh]" />;
  if (error && clients.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h1>
          <p className="text-slate-500 font-medium">Controlo total de Trials, Produção e Suporte</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Criar Trial
          </button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-black text-slate-900 text-xl">Novo Cliente Trial</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">O trial inicial é de 3 dias no Hub "TrataTudo bot"</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleCreateTrial} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa</label>
                    <input 
                      type="text" 
                      placeholder="Nome da Empresa Lda"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                      value={newClient.company_name}
                      onChange={e => setNewClient({...newClient, company_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefone (E164)</label>
                    <input 
                      type="text" 
                      placeholder="+351912345678"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                      value={newClient.phone_e164}
                      onChange={e => setNewClient({...newClient, phone_e164: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contacto Responsável</label>
                    <input 
                      type="text" 
                      placeholder="Nome do Contacto"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                      value={newClient.contact_name}
                      onChange={e => setNewClient({...newClient, contact_name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@empresa.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                    value={newClient.email}
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plano Inicial</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                    value={newClient.plan}
                    onChange={e => setNewClient({...newClient, plan: e.target.value as any})}
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instruções do Bot (Prompt)</label>
                  <textarea 
                    rows={4}
                    placeholder="Descreva como o bot deve agir..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium"
                    value={newClient.bot_instructions}
                    onChange={e => setNewClient({...newClient, bot_instructions: e.target.value})}
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={processing}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Trial no Hub"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isProlongModalOpen && prolongingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-900">Prolongar Trial</h3>
                <button onClick={() => setIsProlongModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-sm text-slate-600 text-center">
                  Adicionar dias de teste para <span className="font-bold text-slate-900">{prolongingClient.company_name}</span>
                </p>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dias de Trial</label>
                  <input
                    type="number"
                    min={1}
                    value={trialDays}
                    onChange={(e) => setTrialDays(Number(e.target.value || 0))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[3, 7, 14].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTrialDays(days)}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                        trialDays === days
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {days} dias
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleProlongTrial}
                  disabled={processing}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aplicar Trial'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-xl">Editar Cliente</h3>
                <button onClick={() => setEditingClient(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleUpdateClient} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                      value={editingClient.company_name}
                      onChange={e => setEditingClient({...editingClient, company_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                      value={editingClient.email || ''}
                      onChange={e => setEditingClient({...editingClient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefone</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                      value={editingClient.phone || ''}
                      onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plano</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                    value={editingClient.plan}
                    onChange={e => setEditingClient({...editingClient, plan: e.target.value as any})}
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instruções do Bot (Prompt)</label>
                  <textarea 
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-medium"
                    value={editingClient.bot_instructions || ''}
                    onChange={e => setEditingClient({...editingClient, bot_instructions: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={processing}
                    className="flex-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Alterações"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clients Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa / Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ambiente / Instância</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano / Trial</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações Operacionais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map((client) => {
                const trialStatus = getTrialStatus(client);
                const isTrial = client.status === 'trial' || client.instance?.is_hub === true;
                
                return (
                  <motion.tr 
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          isTrial ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                        )}>
                          {isTrial ? <Clock className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{client.company_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {client.phone}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">•</span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {client.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            isTrial ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                          )}>
                            {isTrial ? 'Trial / Hub' : 'Produção / Dedicada'}
                          </span>
                          {client.instance?.is_hub && (
                            <span className="text-[8px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Hub</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 group/inst">
                          <span className="text-xs font-bold text-slate-500 truncate max-w-[120px]">
                            {client.instance?.instance_name || 'Sem instância'}
                          </span>
                          {client.instance?.instance_name && (
                            <button 
                              onClick={() => copyToClipboard(client.instance!.instance_name)}
                              className="opacity-0 group-hover/inst:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                            >
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1">
                          <Zap className="w-3 h-3 text-primary" /> {client.plan}
                        </span>
                        {client.trial_end && (
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-[10px] font-bold",
                              trialStatus === 'expired' ? "text-red-500" : "text-slate-400"
                            )}>
                              Expira: {new Date(client.trial_end).toLocaleDateString()}
                            </span>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest mt-0.5",
                              trialStatus === 'active' ? "text-emerald-500" : 
                               trialStatus === 'expired' ? "text-red-500" : "text-amber-500"
                            )}>
                              {trialStatus === 'active' ? 'Ativo' : 
                               trialStatus === 'expired' ? 'Expirado' : 'Pausado'}
                            </span>
                          </div>
                        )}
                        {client.production_activated_at && (
                          <span className="text-[10px] font-bold text-slate-400">
                            Ativo desde: {new Date(client.production_activated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        client.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                        client.status === 'suspended' ? "bg-red-50 text-red-600" : 
                        client.status === 'trial' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {client.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : 
                         client.status === 'suspended' ? <XCircle className="w-3 h-3" /> : 
                         client.status === 'trial' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {isTrial && client.status !== 'trial' ? 'Trial ' : ''}
                        {client.status === 'active' ? 'Ativo' : 
                         client.status === 'suspended' ? 'Suspenso' : 
                         client.status === 'trial' ? 'Trial' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Primary Actions */}
                        {isTrial && (
                          <>
                            <button 
                              onClick={() => { setProlongingClient(client); setIsProlongModalOpen(true); }}
                              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                              title="Prolongar Trial"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleActivateProduction(client.id)}
                              className="px-3 py-2 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                              title="Ativar Produção"
                            >
                              Ativar Prod
                            </button>
                          </>
                        )}
                        
                        {/* Secondary Actions Menu */}
                        <div className="h-6 w-px bg-slate-100 mx-1" />
                        
                        <button 
                          onClick={() => handleToggleStatus(client.id, client.status)}
                          className={cn(
                            "p-2 rounded-xl border transition-all shadow-sm",
                            client.status === 'active' 
                              ? "bg-white border-red-100 text-red-500 hover:bg-red-50" 
                              : "bg-white border-emerald-100 text-emerald-500 hover:bg-emerald-50"
                          )}
                          title={client.status === 'active' ? 'Suspender' : 'Ativar'}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => window.location.href = `/admin/messages?client=${client.client_id || client.id}`}
                          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
                          title="Ver Mensagens"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => window.location.href = `/admin/tickets?client=${client.client_id || client.id}`}
                          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-orange-500 transition-all shadow-sm"
                          title="Ver Tickets"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleSyncInstance(client.id)}
                          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-indigo-500 transition-all shadow-sm"
                          title="Sincronizar Instância"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => setEditingClient(client)}
                          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                          title="Editar Cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                          title="Eliminar Cliente"
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
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum cliente encontrado com estes critérios.</p>
          </div>
        )}
      </div>

      {/* Trial Isolation Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Layers className="w-8 h-8 text-blue-500" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-lg font-black text-slate-900 tracking-tight">Isolamento Lógico em Trial</h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Mesmo utilizando o <span className="font-bold text-blue-600">Hub TrataTudo bot</span>, cada cliente trial possui um contexto 100% isolado. 
            Prompts, mensagens, tickets e dados operacionais são filtrados por <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-xs">client_id</span>, garantindo total privacidade e segurança.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Bot className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Prompt Único</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Dados Seguros</span>
          </div>
        </div>
      </div>
    </div>
  );
}
