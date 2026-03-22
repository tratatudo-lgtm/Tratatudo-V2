import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Plus,
  X,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { AnimatePresence } from 'motion/react';

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  plan: string;
  trial_end: string | null;
  bot_instructions: string;
  created_at: string;
  instance: {
    instance_name: string;
    status: string;
    is_hub: boolean;
  } | null;
  subscription: {
    plan: string;
    status: string;
    ends_at: string | null;
  } | null;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({ phone_e164: '', company_name: '', contact_name: '', email: '', bot_instructions: '' });
  const [creating, setCreating] = useState(false);

  const { logout } = useAdminAuth();

  const fetchClients = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    const endpoints = [
      `${baseUrl}/api/admin/clients`,
      `${baseUrl}/api/clients`
    ];
    
    let lastError = null;
    
    try {
      setLoading(true);
      setError(null);
      
      for (const url of endpoints) {
        console.log(`[ADMIN] Fetching clients: ${url}`);
        try {
          const res = await fetch(url, {
            credentials: 'include'
          });
          
          if (res.ok) {
            const data = await res.json();
            const clientsData = extractArrayResponse<Client>(data, 'clients');
            setClients(clientsData);
            setLoading(false);
            return;
          } else if (res.status === 401) {
            console.warn('[ADMIN] Session expired, logging out...');
            await logout();
            return;
          }
        } catch (e) {
          lastError = e;
        }
      }
      
      throw lastError || new Error('Falha ao carregar lista de clientes');
      
    } catch (err: any) {
      console.error('[ADMIN] Fetch clients failed:', err);
      setError(err.message || 'Não foi possível carregar os clientes.');
      
      // Professional fallback for demo/development
      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        console.log('[ADMIN] Using fallback clients data');
        setClients([
          {
            id: '1',
            client_id: 'C-1001',
            company_name: 'João Silva Lda',
            email: 'joao@silva.pt',
            phone: '+351912345678',
            status: 'active',
            plan: 'Pro',
            trial_end: null,
            bot_instructions: 'Atendimento geral.',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            instance: { instance_name: 'TT-JOAO', status: 'connected', is_hub: true },
            subscription: { plan: 'Pro', status: 'active', ends_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString() }
          },
          {
            id: '2',
            client_id: 'C-1002',
            company_name: 'Maria Santos Unipessoal',
            email: 'maria@santos.pt',
            phone: '+351919876543',
            status: 'pending',
            plan: 'Trial',
            trial_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            bot_instructions: 'Suporte técnico.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            instance: null,
            subscription: { plan: 'Trial', status: 'active', ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
          }
        ]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.phone_e164 || !newClient.company_name || creating) return;

    try {
      setCreating(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
        credentials: 'include'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao criar cliente trial');
      }

      await fetchClients();
      setIsModalOpen(false);
      setNewClient({ phone_e164: '', company_name: '', contact_name: '', email: '', bot_instructions: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || creating) return;

    try {
      setCreating(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClient),
        credentials: 'include'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao atualizar cliente');
      }

      await fetchClients();
      setEditingClient(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este cliente? Esta ação é irreversível.')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Falha ao apagar cliente');
      
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Erro ao apagar cliente');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Falha ao atualizar estado');
      
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch (err) {
      alert('Erro ao atualizar estado do cliente');
    }
  };

  const handleActivateProduction = async (id: string) => {
    if (!confirm('Deseja ativar o modo de produção para este cliente?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${id}/activate-production`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Falha ao ativar produção');
      
      alert('Produção ativada com sucesso!');
      await fetchClients();
    } catch (err) {
      alert('Erro ao ativar produção');
    }
  };

  const filteredClients = clients.filter(client => 
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState message="A carregar lista de clientes..." className="h-[60vh]" />;
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ErrorState message={error} />
        <button 
          onClick={fetchClients}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h1>
          <p className="text-slate-500 font-medium">Administre os utilizadores da plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Novo Cliente Trial (7 dias)</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTrial} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefone (E164)</label>
                  <input 
                    type="text" 
                    placeholder="+351912345678"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                    value={newClient.phone_e164}
                    onChange={e => setNewClient({...newClient, phone_e164: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Empresa</label>
                  <input 
                    type="text" 
                    placeholder="Empresa Lda"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                    value={newClient.company_name}
                    onChange={e => setNewClient({...newClient, company_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email (Opcional)</label>
                  <input 
                    type="email" 
                    placeholder="email@empresa.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                    value={newClient.email}
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={creating}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Cliente Trial"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Editar Cliente: {editingClient.company_name}</h3>
                <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateClient} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                      value={editingClient.company_name}
                      onChange={e => setEditingClient({...editingClient, company_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                      value={editingClient.email || ''}
                      onChange={e => setEditingClient({...editingClient, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefone</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                    value={editingClient.phone || ''}
                    onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instruções do Bot (Prompt)</label>
                  <textarea 
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-mono"
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
                    disabled={creating}
                    className="flex-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Alterações"}
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Bot</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano / Instância</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map((client) => (
                <motion.tr 
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{client.company_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          Bot: {client.bot_instructions?.substring(0, 30)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit",
                        client.trial_end ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {client.trial_end ? 'Trial' : 'Produção'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 mt-1">
                        Instância: {client.instance?.instance_name || 'Nenhuma'}
                        {client.instance?.is_hub && <span className="ml-1 text-[8px] bg-slate-100 px-1 rounded">HUB</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      client.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                      client.status === 'suspended' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {client.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : 
                       client.status === 'suspended' ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {client.status === 'active' ? 'Ativo' : client.status === 'suspended' ? 'Suspenso' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {client.trial_end && (
                        <button 
                          onClick={() => handleActivateProduction(client.id)}
                          className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                          title="Ativar Produção"
                        >
                          Ativar Prod
                        </button>
                      )}
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
                        onClick={() => window.location.href = `/admin/messages?client=${client.client_id}`}
                        className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
                        title="Ver Mensagens"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => window.location.href = `/admin/tickets?client=${client.client_id}`}
                        className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-orange-500 transition-all shadow-sm"
                        title="Ver Tickets"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingClient(client)}
                        className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-blue-500 transition-all shadow-sm"
                        title="Editar Cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-red-500 transition-all shadow-sm"
                        title="Apagar Cliente"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
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
    </div>
  );
}
