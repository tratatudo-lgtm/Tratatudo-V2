import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   Users, 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   MoreHorizontal, 
import.meta.env.VITE_API_URL   Edit2, 
import.meta.env.VITE_API_URL   ShieldAlert, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   XCircle,
import.meta.env.VITE_API_URL   Mail,
import.meta.env.VITE_API_URL   Phone,
import.meta.env.VITE_API_URL   Calendar,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   AlertCircle,
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   ExternalLink,
import.meta.env.VITE_API_URL   Smartphone,
import.meta.env.VITE_API_URL   Plus,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   MessageSquare,
import.meta.env.VITE_API_URL   ClipboardList
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import.meta.env.VITE_API_URL import { AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Client {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   client_id: string;
import.meta.env.VITE_API_URL   company_name: string;
import.meta.env.VITE_API_URL   email: string;
import.meta.env.VITE_API_URL   phone: string;
import.meta.env.VITE_API_URL   status: 'active' | 'suspended' | 'pending';
import.meta.env.VITE_API_URL   plan: string;
import.meta.env.VITE_API_URL   trial_end: string | null;
import.meta.env.VITE_API_URL   bot_instructions: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   instance: {
import.meta.env.VITE_API_URL     instance_name: string;
import.meta.env.VITE_API_URL     status: string;
import.meta.env.VITE_API_URL     is_hub: boolean;
import.meta.env.VITE_API_URL   } | null;
import.meta.env.VITE_API_URL   subscription: {
import.meta.env.VITE_API_URL     plan: string;
import.meta.env.VITE_API_URL     status: string;
import.meta.env.VITE_API_URL     ends_at: string | null;
import.meta.env.VITE_API_URL   } | null;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminClients() {
import.meta.env.VITE_API_URL   const [clients, setClients] = useState<Client[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [searchTerm, setSearchTerm] = useState('');
import.meta.env.VITE_API_URL   const [isModalOpen, setIsModalOpen] = useState(false);
import.meta.env.VITE_API_URL   const [editingClient, setEditingClient] = useState<Client | null>(null);
import.meta.env.VITE_API_URL   const [newClient, setNewClient] = useState({ phone_e164: '', company_name: '', contact_name: '', email: '', bot_instructions: '' });
import.meta.env.VITE_API_URL   const [creating, setCreating] = useState(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const { logout } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchClients = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${baseUrl}/api/admin/clients`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/clients`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[ADMIN] Fetching clients: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const data = await res.json();
import.meta.env.VITE_API_URL             const clientsData = extractArrayResponse<Client>(data, 'clients');
import.meta.env.VITE_API_URL             setClients(clientsData);
import.meta.env.VITE_API_URL             setLoading(false);
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           } else if (res.status === 401) {
import.meta.env.VITE_API_URL             console.warn('[ADMIN] Session expired, logging out...');
import.meta.env.VITE_API_URL             await logout();
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar lista de clientes');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[ADMIN] Fetch clients failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Não foi possível carregar os clientes.');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Professional fallback for demo/development
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         console.log('[ADMIN] Using fallback clients data');
import.meta.env.VITE_API_URL         setClients([
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '1',
import.meta.env.VITE_API_URL             client_id: 'C-1001',
import.meta.env.VITE_API_URL             company_name: 'João Silva Lda',
import.meta.env.VITE_API_URL             email: 'joao@silva.pt',
import.meta.env.VITE_API_URL             phone: '+351912345678',
import.meta.env.VITE_API_URL             status: 'active',
import.meta.env.VITE_API_URL             plan: 'Pro',
import.meta.env.VITE_API_URL             trial_end: null,
import.meta.env.VITE_API_URL             bot_instructions: 'Atendimento geral.',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             instance: { instance_name: 'TT-JOAO', status: 'connected', is_hub: true },
import.meta.env.VITE_API_URL             subscription: { plan: 'Pro', status: 'active', ends_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString() }
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '2',
import.meta.env.VITE_API_URL             client_id: 'C-1002',
import.meta.env.VITE_API_URL             company_name: 'Maria Santos Unipessoal',
import.meta.env.VITE_API_URL             email: 'maria@santos.pt',
import.meta.env.VITE_API_URL             phone: '+351919876543',
import.meta.env.VITE_API_URL             status: 'pending',
import.meta.env.VITE_API_URL             plan: 'Trial',
import.meta.env.VITE_API_URL             trial_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             bot_instructions: 'Suporte técnico.',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             instance: null,
import.meta.env.VITE_API_URL             subscription: { plan: 'Trial', status: 'active', ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         ]);
import.meta.env.VITE_API_URL         setError(null);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleCreateTrial = async (e: React.FormEvent) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL     if (!newClient.phone_e164 || !newClient.company_name || creating) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setCreating(true);
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/trial`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify(newClient),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!response.ok) {
import.meta.env.VITE_API_URL         const err = await response.json().catch(() => ({}));
import.meta.env.VITE_API_URL         throw new Error(err.error || 'Falha ao criar cliente trial');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       await fetchClients();
import.meta.env.VITE_API_URL       setIsModalOpen(false);
import.meta.env.VITE_API_URL       setNewClient({ phone_e164: '', company_name: '', contact_name: '', email: '', bot_instructions: '' });
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       alert(err.message);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setCreating(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleUpdateClient = async (e: React.FormEvent) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL     if (!editingClient || creating) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setCreating(true);
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${editingClient.id}`, {
import.meta.env.VITE_API_URL         method: 'PUT',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify(editingClient),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!response.ok) {
import.meta.env.VITE_API_URL         const err = await response.json().catch(() => ({}));
import.meta.env.VITE_API_URL         throw new Error(err.error || 'Falha ao atualizar cliente');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       await fetchClients();
import.meta.env.VITE_API_URL       setEditingClient(null);
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       alert(err.message);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setCreating(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleDeleteClient = async (id: string) => {
import.meta.env.VITE_API_URL     if (!confirm('Tem certeza que deseja apagar este cliente? Esta ação é irreversível.')) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${id}`, {
import.meta.env.VITE_API_URL         method: 'DELETE',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!response.ok) throw new Error('Falha ao apagar cliente');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       setClients(prev => prev.filter(c => c.id !== id));
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       alert('Erro ao apagar cliente');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchClients();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleToggleStatus = async (id: string, currentStatus: string) => {
import.meta.env.VITE_API_URL     const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${id}/status`, {
import.meta.env.VITE_API_URL         method: 'PATCH',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({ status: newStatus }),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!response.ok) throw new Error('Falha ao atualizar estado');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       alert('Erro ao atualizar estado do cliente');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleActivateProduction = async (id: string) => {
import.meta.env.VITE_API_URL     if (!confirm('Deseja ativar o modo de produção para este cliente?')) return;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/clients/${id}/activate-production`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!response.ok) throw new Error('Falha ao ativar produção');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       alert('Produção ativada com sucesso!');
import.meta.env.VITE_API_URL       await fetchClients();
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       alert('Erro ao ativar produção');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredClients = clients.filter(client => 
import.meta.env.VITE_API_URL     client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL     client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL     client.client_id.toLowerCase().includes(searchTerm.toLowerCase())
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar lista de clientes..." className="h-[60vh]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchClients}
import.meta.env.VITE_API_URL           className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8 max-w-7xl mx-auto">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium">Administre os utilizadores da plataforma</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL           <button 
import.meta.env.VITE_API_URL             onClick={() => setIsModalOpen(true)}
import.meta.env.VITE_API_URL             className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <Plus className="w-4 h-4" /> Criar Trial
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL           <div className="relative">
import.meta.env.VITE_API_URL             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input 
import.meta.env.VITE_API_URL               type="text" 
import.meta.env.VITE_API_URL               placeholder="Pesquisar cliente..." 
import.meta.env.VITE_API_URL               value={searchTerm}
import.meta.env.VITE_API_URL               onChange={(e) => setSearchTerm(e.target.value)}
import.meta.env.VITE_API_URL               className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
import.meta.env.VITE_API_URL             <Filter className="w-5 h-5" />
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {isModalOpen && (
import.meta.env.VITE_API_URL           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               initial={{ opacity: 0, scale: 0.95 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, scale: 1 }}
import.meta.env.VITE_API_URL               exit={{ opacity: 0, scale: 0.95 }}
import.meta.env.VITE_API_URL               className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
import.meta.env.VITE_API_URL                 <h3 className="font-bold text-slate-900">Novo Cliente Trial (7 dias)</h3>
import.meta.env.VITE_API_URL                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
import.meta.env.VITE_API_URL                   <X className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <form onSubmit={handleCreateTrial} className="p-6 space-y-4">
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefone (E164)</label>
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="text" 
import.meta.env.VITE_API_URL                     placeholder="+351912345678"
import.meta.env.VITE_API_URL                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
import.meta.env.VITE_API_URL                     value={newClient.phone_e164}
import.meta.env.VITE_API_URL                     onChange={e => setNewClient({...newClient, phone_e164: e.target.value})}
import.meta.env.VITE_API_URL                     required
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Empresa</label>
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="text" 
import.meta.env.VITE_API_URL                     placeholder="Empresa Lda"
import.meta.env.VITE_API_URL                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
import.meta.env.VITE_API_URL                     value={newClient.company_name}
import.meta.env.VITE_API_URL                     onChange={e => setNewClient({...newClient, company_name: e.target.value})}
import.meta.env.VITE_API_URL                     required
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email (Opcional)</label>
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="email" 
import.meta.env.VITE_API_URL                     placeholder="email@empresa.com"
import.meta.env.VITE_API_URL                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
import.meta.env.VITE_API_URL                     value={newClient.email}
import.meta.env.VITE_API_URL                     onChange={e => setNewClient({...newClient, email: e.target.value})}
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   type="submit"
import.meta.env.VITE_API_URL                   disabled={creating}
import.meta.env.VITE_API_URL                   className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Cliente Trial"}
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </form>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {editingClient && (
import.meta.env.VITE_API_URL           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               initial={{ opacity: 0, scale: 0.95 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, scale: 1 }}
import.meta.env.VITE_API_URL               exit={{ opacity: 0, scale: 0.95 }}
import.meta.env.VITE_API_URL               className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
import.meta.env.VITE_API_URL                 <h3 className="font-bold text-slate-900">Editar Cliente: {editingClient.company_name}</h3>
import.meta.env.VITE_API_URL                 <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-600">
import.meta.env.VITE_API_URL                   <X className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <form onSubmit={handleUpdateClient} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
import.meta.env.VITE_API_URL                 <div className="grid grid-cols-2 gap-4">
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa</label>
import.meta.env.VITE_API_URL                     <input 
import.meta.env.VITE_API_URL                       type="text" 
import.meta.env.VITE_API_URL                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
import.meta.env.VITE_API_URL                       value={editingClient.company_name}
import.meta.env.VITE_API_URL                       onChange={e => setEditingClient({...editingClient, company_name: e.target.value})}
import.meta.env.VITE_API_URL                       required
import.meta.env.VITE_API_URL                     />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
import.meta.env.VITE_API_URL                     <input 
import.meta.env.VITE_API_URL                       type="email" 
import.meta.env.VITE_API_URL                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
import.meta.env.VITE_API_URL                       value={editingClient.email || ''}
import.meta.env.VITE_API_URL                       onChange={e => setEditingClient({...editingClient, email: e.target.value})}
import.meta.env.VITE_API_URL                     />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefone</label>
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="text" 
import.meta.env.VITE_API_URL                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
import.meta.env.VITE_API_URL                     value={editingClient.phone || ''}
import.meta.env.VITE_API_URL                     onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instruções do Bot (Prompt)</label>
import.meta.env.VITE_API_URL                   <textarea 
import.meta.env.VITE_API_URL                     rows={6}
import.meta.env.VITE_API_URL                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-mono"
import.meta.env.VITE_API_URL                     value={editingClient.bot_instructions || ''}
import.meta.env.VITE_API_URL                     onChange={e => setEditingClient({...editingClient, bot_instructions: e.target.value})}
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex gap-3 pt-4">
import.meta.env.VITE_API_URL                   <button 
import.meta.env.VITE_API_URL                     type="button"
import.meta.env.VITE_API_URL                     onClick={() => setEditingClient(null)}
import.meta.env.VITE_API_URL                     className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     Cancelar
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                   <button 
import.meta.env.VITE_API_URL                     type="submit"
import.meta.env.VITE_API_URL                     disabled={creating}
import.meta.env.VITE_API_URL                     className="flex-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Alterações"}
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </form>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Clients Table */}
import.meta.env.VITE_API_URL       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
import.meta.env.VITE_API_URL         <div className="overflow-x-auto">
import.meta.env.VITE_API_URL           <table className="w-full text-left border-collapse">
import.meta.env.VITE_API_URL             <thead>
import.meta.env.VITE_API_URL               <tr className="bg-slate-50/50 border-b border-slate-100">
import.meta.env.VITE_API_URL                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Bot</th>
import.meta.env.VITE_API_URL                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano / Instância</th>
import.meta.env.VITE_API_URL                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
import.meta.env.VITE_API_URL                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
import.meta.env.VITE_API_URL               </tr>
import.meta.env.VITE_API_URL             </thead>
import.meta.env.VITE_API_URL             <tbody className="divide-y divide-slate-50">
import.meta.env.VITE_API_URL               {filteredClients.map((client) => (
import.meta.env.VITE_API_URL                 <motion.tr 
import.meta.env.VITE_API_URL                   key={client.id}
import.meta.env.VITE_API_URL                   initial={{ opacity: 0 }}
import.meta.env.VITE_API_URL                   animate={{ opacity: 1 }}
import.meta.env.VITE_API_URL                   className="group hover:bg-slate-50/50 transition-colors"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <td className="px-8 py-6">
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-4">
import.meta.env.VITE_API_URL                       <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
import.meta.env.VITE_API_URL                         <Users className="w-6 h-6" />
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                       <div>
import.meta.env.VITE_API_URL                         <p className="text-sm font-bold text-slate-900">{client.company_name}</p>
import.meta.env.VITE_API_URL                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
import.meta.env.VITE_API_URL                           Bot: {client.bot_instructions?.substring(0, 30)}...
import.meta.env.VITE_API_URL                         </p>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                   <td className="px-8 py-6">
import.meta.env.VITE_API_URL                     <div className="flex flex-col">
import.meta.env.VITE_API_URL                       <span className={cn(
import.meta.env.VITE_API_URL                         "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit",
import.meta.env.VITE_API_URL                         client.trial_end ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
import.meta.env.VITE_API_URL                       )}>
import.meta.env.VITE_API_URL                         {client.trial_end ? 'Trial' : 'Produção'}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                       <span className="text-xs font-bold text-slate-500 mt-1">
import.meta.env.VITE_API_URL                         Instância: {client.instance?.instance_name || 'Nenhuma'}
import.meta.env.VITE_API_URL                         {client.instance?.is_hub && <span className="ml-1 text-[8px] bg-slate-100 px-1 rounded">HUB</span>}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                   <td className="px-8 py-6">
import.meta.env.VITE_API_URL                     <span className={cn(
import.meta.env.VITE_API_URL                       "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
import.meta.env.VITE_API_URL                       client.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
import.meta.env.VITE_API_URL                       client.status === 'suspended' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
import.meta.env.VITE_API_URL                     )}>
import.meta.env.VITE_API_URL                       {client.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : 
import.meta.env.VITE_API_URL                        client.status === 'suspended' ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
import.meta.env.VITE_API_URL                       {client.status === 'active' ? 'Ativo' : client.status === 'suspended' ? 'Suspenso' : 'Pendente'}
import.meta.env.VITE_API_URL                     </span>
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                   <td className="px-8 py-6 text-right">
import.meta.env.VITE_API_URL                     <div className="flex items-center justify-end gap-2">
import.meta.env.VITE_API_URL                       {client.trial_end && (
import.meta.env.VITE_API_URL                         <button 
import.meta.env.VITE_API_URL                           onClick={() => handleActivateProduction(client.id)}
import.meta.env.VITE_API_URL                           className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
import.meta.env.VITE_API_URL                           title="Ativar Produção"
import.meta.env.VITE_API_URL                         >
import.meta.env.VITE_API_URL                           Ativar Prod
import.meta.env.VITE_API_URL                         </button>
import.meta.env.VITE_API_URL                       )}
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         onClick={() => handleToggleStatus(client.id, client.status)}
import.meta.env.VITE_API_URL                         className={cn(
import.meta.env.VITE_API_URL                           "p-2 rounded-xl border transition-all shadow-sm",
import.meta.env.VITE_API_URL                           client.status === 'active' 
import.meta.env.VITE_API_URL                             ? "bg-white border-red-100 text-red-500 hover:bg-red-50" 
import.meta.env.VITE_API_URL                             : "bg-white border-emerald-100 text-emerald-500 hover:bg-emerald-50"
import.meta.env.VITE_API_URL                         )}
import.meta.env.VITE_API_URL                         title={client.status === 'active' ? 'Suspender' : 'Ativar'}
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <ShieldAlert className="w-4 h-4" />
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         onClick={() => window.location.href = `/admin/messages?client=${client.client_id}`}
import.meta.env.VITE_API_URL                         className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm"
import.meta.env.VITE_API_URL                         title="Ver Mensagens"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <MessageSquare className="w-4 h-4" />
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         onClick={() => window.location.href = `/admin/tickets?client=${client.client_id}`}
import.meta.env.VITE_API_URL                         className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-orange-500 transition-all shadow-sm"
import.meta.env.VITE_API_URL                         title="Ver Tickets"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <ClipboardList className="w-4 h-4" />
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         onClick={() => setEditingClient(client)}
import.meta.env.VITE_API_URL                         className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-blue-500 transition-all shadow-sm"
import.meta.env.VITE_API_URL                         title="Editar Cliente"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <Edit2 className="w-4 h-4" />
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         onClick={() => handleDeleteClient(client.id)}
import.meta.env.VITE_API_URL                         className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-red-500 transition-all shadow-sm"
import.meta.env.VITE_API_URL                         title="Apagar Cliente"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <XCircle className="w-4 h-4" />
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                 </motion.tr>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL             </tbody>
import.meta.env.VITE_API_URL           </table>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         {filteredClients.length === 0 && (
import.meta.env.VITE_API_URL           <div className="p-20 text-center">
import.meta.env.VITE_API_URL             <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
import.meta.env.VITE_API_URL               <Search className="w-8 h-8" />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <p className="text-slate-500 font-medium">Nenhum cliente encontrado com estes critérios.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
