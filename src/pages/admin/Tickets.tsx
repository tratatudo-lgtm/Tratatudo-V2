import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   Clock, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   AlertCircle, 
import.meta.env.VITE_API_URL   MoreVertical,
import.meta.env.VITE_API_URL   User,
import.meta.env.VITE_API_URL   Phone,
import.meta.env.VITE_API_URL   Calendar,
import.meta.env.VITE_API_URL   ChevronRight,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   Tag,
import.meta.env.VITE_API_URL   Hash,
import.meta.env.VITE_API_URL   LifeBuoy,
import.meta.env.VITE_API_URL   HelpCircle,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   ShieldAlert,
import.meta.env.VITE_API_URL   Bot,
import.meta.env.VITE_API_URL   Zap,
import.meta.env.VITE_API_URL   FileText,
import.meta.env.VITE_API_URL   Sparkles,
import.meta.env.VITE_API_URL   Send
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { toast } from 'sonner';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Ticket {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   tracking_code: string;
import.meta.env.VITE_API_URL   subject: string;
import.meta.env.VITE_API_URL   description: string;
import.meta.env.VITE_API_URL   status: 'aberto' | 'em análise' | 'pendente' | 'resolvido';
import.meta.env.VITE_API_URL   kind?: 'suporte' | 'reclamação' | 'pedido' | 'outros';
import.meta.env.VITE_API_URL   category: string;
import.meta.env.VITE_API_URL   priority: 'baixa' | 'média' | 'alta' | 'urgente';
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   updated_at?: string;
import.meta.env.VITE_API_URL   company_name?: string;
import.meta.env.VITE_API_URL   phone_e164?: string;
import.meta.env.VITE_API_URL   client_name?: string;
import.meta.env.VITE_API_URL   client_phone?: string;
import.meta.env.VITE_API_URL   ai_analysis?: string;
import.meta.env.VITE_API_URL   internal_notes?: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface TicketMessage {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   ticket_id: string;
import.meta.env.VITE_API_URL   sender_type: 'user' | 'bot' | 'agent';
import.meta.env.VITE_API_URL   text: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export default function AdminTickets() {
import.meta.env.VITE_API_URL   const [tickets, setTickets] = useState<Ticket[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [search, setSearch] = useState('');
import.meta.env.VITE_API_URL   const [filterStatus, setFilterStatus] = useState<string>('todos');
import.meta.env.VITE_API_URL   const [filterKind, setFilterKind] = useState<'todos' | 'suporte' | 'outros'>('todos');
import.meta.env.VITE_API_URL   
import.meta.env.VITE_API_URL   // Detail Panel State
import.meta.env.VITE_API_URL   const [selectedId, setSelectedId] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [messages, setMessages] = useState<TicketMessage[]>([]);
import.meta.env.VITE_API_URL   const [loadingMessages, setLoadingMessages] = useState(false);
import.meta.env.VITE_API_URL   const [analyzing, setAnalyzing] = useState(false);
import.meta.env.VITE_API_URL   const [analysis, setAnalysis] = useState<any>(null);
import.meta.env.VITE_API_URL   const [internalNotes, setInternalNotes] = useState('');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchTickets();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     if (selectedId) {
import.meta.env.VITE_API_URL       fetchTicketMessages(selectedId);
import.meta.env.VITE_API_URL     } else {
import.meta.env.VITE_API_URL       setMessages([]);
import.meta.env.VITE_API_URL       setAnalysis(null);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }, [selectedId]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchTickets = async () => {
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${baseUrl}/api/admin/tickets`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/tickets`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/pedidos`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[ADMIN] Fetching tickets: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const data = await res.json();
import.meta.env.VITE_API_URL             const ticketsData = extractArrayResponse<Ticket>(data, 'tickets');
import.meta.env.VITE_API_URL             setTickets(ticketsData);
import.meta.env.VITE_API_URL             setLoading(false);
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           } else if (res.status === 401) {
import.meta.env.VITE_API_URL             throw new Error('Sessão expirada ou sem permissões de administrador.');
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar tickets de suporte');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[ADMIN] Fetch tickets failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Não foi possível carregar os tickets.');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Professional fallback for demo/development
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         console.log('[ADMIN] Using fallback tickets data');
import.meta.env.VITE_API_URL         setTickets([
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '1',
import.meta.env.VITE_API_URL             tracking_code: 'TRT-12345',
import.meta.env.VITE_API_URL             subject: 'Dúvida sobre integração WhatsApp',
import.meta.env.VITE_API_URL             description: 'Como posso conectar a minha instância?',
import.meta.env.VITE_API_URL             status: 'aberto',
import.meta.env.VITE_API_URL             priority: 'média',
import.meta.env.VITE_API_URL             category: 'Técnico',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             client_name: 'João Silva',
import.meta.env.VITE_API_URL             client_phone: '+351912345678',
import.meta.env.VITE_API_URL             ai_analysis: 'O cliente está com dificuldades na configuração inicial.',
import.meta.env.VITE_API_URL             internal_notes: 'Aguardando resposta do suporte nível 2.'
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '2',
import.meta.env.VITE_API_URL             tracking_code: 'TRT-67890',
import.meta.env.VITE_API_URL             subject: 'Erro na faturação mensal',
import.meta.env.VITE_API_URL             description: 'O valor cobrado está incorreto.',
import.meta.env.VITE_API_URL             status: 'resolvido',
import.meta.env.VITE_API_URL             priority: 'alta',
import.meta.env.VITE_API_URL             category: 'Financeiro',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             client_name: 'Maria Santos',
import.meta.env.VITE_API_URL             client_phone: '+351919876543'
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         ]);
import.meta.env.VITE_API_URL         setError(null);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchTicketMessages = async (ticketId: string) => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoadingMessages(true);
import.meta.env.VITE_API_URL       const res = await fetch(`${baseUrl}/api/admin/tickets/${ticketId}/messages`, {
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (!res.ok) throw new Error('Falha ao carregar mensagens');
import.meta.env.VITE_API_URL       const json = await res.json();
import.meta.env.VITE_API_URL       setMessages(extractArrayResponse<TicketMessage>(json, 'messages'));
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       console.error('Error fetching messages:', err);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoadingMessages(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const analyzeWithAI = async (ticketId: string) => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setAnalyzing(true);
import.meta.env.VITE_API_URL       const res = await fetch(`${baseUrl}/api/admin/tickets/${ticketId}/analyze`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (!res.ok) throw new Error('Falha na análise de IA');
import.meta.env.VITE_API_URL       const data = await res.json();
import.meta.env.VITE_API_URL       setAnalysis(data);
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('AI Analysis failed:', err);
import.meta.env.VITE_API_URL       toast.error('Falha na análise IA.');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setAnalyzing(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleUpdateStatus = async (id: string, status: string) => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const res = await fetch(`${baseUrl}/api/admin/tickets/${id}/status`, {
import.meta.env.VITE_API_URL         method: 'PATCH',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         credentials: 'include',
import.meta.env.VITE_API_URL         body: JSON.stringify({ status })
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       const json = await res.json();
import.meta.env.VITE_API_URL       if (res.ok) {
import.meta.env.VITE_API_URL         setTickets(tickets.map(t => t.id === id ? { ...t, status: json.ticket.status } : t));
import.meta.env.VITE_API_URL         toast.success(`Ticket atualizado para ${status}.`);
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         throw new Error(json.error || 'Erro ao atualizar status');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       toast.error(err.message || 'Erro ao atualizar status.');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredTickets = tickets.filter(t => {
import.meta.env.VITE_API_URL     const matchesSearch = 
import.meta.env.VITE_API_URL       t.subject.toLowerCase().includes(search.toLowerCase()) || 
import.meta.env.VITE_API_URL       t.company_name.toLowerCase().includes(search.toLowerCase()) ||
import.meta.env.VITE_API_URL       t.tracking_code.toLowerCase().includes(search.toLowerCase());
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     const matchesKind = 
import.meta.env.VITE_API_URL       filterKind === 'todos' || 
import.meta.env.VITE_API_URL       (filterKind === 'suporte' && t.kind === 'suporte') ||
import.meta.env.VITE_API_URL       (filterKind === 'outros' && t.kind !== 'suporte');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     return matchesSearch && matchesStatus && matchesKind;
import.meta.env.VITE_API_URL   });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const getStatusColor = (status: string) => {
import.meta.env.VITE_API_URL     switch (status) {
import.meta.env.VITE_API_URL       case 'aberto': return 'bg-blue-100 text-blue-700 border-blue-200';
import.meta.env.VITE_API_URL       case 'em análise': return 'bg-amber-100 text-amber-700 border-amber-200';
import.meta.env.VITE_API_URL       case 'pendente': return 'bg-purple-100 text-purple-700 border-purple-200';
import.meta.env.VITE_API_URL       case 'resolvido': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
import.meta.env.VITE_API_URL       default: return 'bg-slate-100 text-slate-700 border-slate-200';
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const getPriorityColor = (priority: string) => {
import.meta.env.VITE_API_URL     switch (priority) {
import.meta.env.VITE_API_URL       case 'baixa': return 'text-slate-500';
import.meta.env.VITE_API_URL       case 'média': return 'text-blue-500';
import.meta.env.VITE_API_URL       case 'alta': return 'text-orange-500';
import.meta.env.VITE_API_URL       case 'urgente': return 'text-red-600 font-bold';
import.meta.env.VITE_API_URL       default: return 'text-slate-500';
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const formatDate = (dateStr: string) => {
import.meta.env.VITE_API_URL     const date = new Date(dateStr);
import.meta.env.VITE_API_URL     return date.toLocaleDateString('pt-PT', { 
import.meta.env.VITE_API_URL       day: '2-digit', 
import.meta.env.VITE_API_URL       month: 'short', 
import.meta.env.VITE_API_URL       year: 'numeric',
import.meta.env.VITE_API_URL       hour: '2-digit',
import.meta.env.VITE_API_URL       minute: '2-digit'
import.meta.env.VITE_API_URL     });
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const selectedTicket = tickets.find(t => t.id === selectedId);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading && tickets.length === 0) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar tickets do sistema..." className="h-[calc(100vh-10rem)]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error && tickets.length === 0) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchTickets}
import.meta.env.VITE_API_URL           className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar Novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Tickets</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 mt-1">Monitorize e responda aos pedidos de suporte e reclamações.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL           <div className="relative">
import.meta.env.VITE_API_URL             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input
import.meta.env.VITE_API_URL               type="text"
import.meta.env.VITE_API_URL               placeholder="Procurar por código, empresa ou assunto..."
import.meta.env.VITE_API_URL               value={search}
import.meta.env.VITE_API_URL               onChange={(e) => setSearch(e.target.value)}
import.meta.env.VITE_API_URL               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none w-full md:w-80 transition-all"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600">
import.meta.env.VITE_API_URL             <Filter className="w-5 h-5" />
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Filters Bar */}
import.meta.env.VITE_API_URL       <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
import.meta.env.VITE_API_URL         <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
import.meta.env.VITE_API_URL           {['todos', 'aberto', 'em análise', 'pendente', 'resolvido'].map((status) => (
import.meta.env.VITE_API_URL             <button
import.meta.env.VITE_API_URL               key={status}
import.meta.env.VITE_API_URL               onClick={() => setFilterStatus(status)}
import.meta.env.VITE_API_URL               className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
import.meta.env.VITE_API_URL                 filterStatus === status 
import.meta.env.VITE_API_URL                   ? 'bg-white text-slate-900 shadow-sm' 
import.meta.env.VITE_API_URL                   : 'text-slate-500 hover:text-slate-700'
import.meta.env.VITE_API_URL               }`}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {status}
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="h-6 w-px bg-slate-200 mx-2" />
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
import.meta.env.VITE_API_URL           <button
import.meta.env.VITE_API_URL             onClick={() => setFilterKind('todos')}
import.meta.env.VITE_API_URL             className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
import.meta.env.VITE_API_URL               filterKind === 'todos' 
import.meta.env.VITE_API_URL                 ? 'bg-white text-slate-900 shadow-sm' 
import.meta.env.VITE_API_URL                 : 'text-slate-500 hover:text-slate-700'
import.meta.env.VITE_API_URL             }`}
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             Todos
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL           <button
import.meta.env.VITE_API_URL             onClick={() => setFilterKind('suporte')}
import.meta.env.VITE_API_URL             className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
import.meta.env.VITE_API_URL               filterKind === 'suporte' 
import.meta.env.VITE_API_URL                 ? 'bg-white text-emerald-700 shadow-sm' 
import.meta.env.VITE_API_URL                 : 'text-slate-500 hover:text-slate-700'
import.meta.env.VITE_API_URL             }`}
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <LifeBuoy className="w-4 h-4" />
import.meta.env.VITE_API_URL             Suporte
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL           <button
import.meta.env.VITE_API_URL             onClick={() => setFilterKind('outros')}
import.meta.env.VITE_API_URL             className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
import.meta.env.VITE_API_URL               filterKind === 'outros' 
import.meta.env.VITE_API_URL                 ? 'bg-white text-orange-700 shadow-sm' 
import.meta.env.VITE_API_URL                 : 'text-slate-500 hover:text-slate-700'
import.meta.env.VITE_API_URL             }`}
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <AlertCircle className="w-4 h-4" />
import.meta.env.VITE_API_URL             Outros
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Tickets List */}
import.meta.env.VITE_API_URL       {filteredTickets.length === 0 ? (
import.meta.env.VITE_API_URL         <EmptyState message="Nenhum ticket encontrado com os filtros atuais." />
import.meta.env.VITE_API_URL       ) : (
import.meta.env.VITE_API_URL         <div className="grid grid-cols-1 gap-4">
import.meta.env.VITE_API_URL           {filteredTickets.map((ticket) => (
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               key={ticket.id}
import.meta.env.VITE_API_URL               layout
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 10 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
import.meta.env.VITE_API_URL               onClick={() => setSelectedId(ticket.id)}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
import.meta.env.VITE_API_URL                 {/* Status & Icon */}
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-4 shrink-0">
import.meta.env.VITE_API_URL                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
import.meta.env.VITE_API_URL                     ticket.kind === 'suporte' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
import.meta.env.VITE_API_URL                   }`}>
import.meta.env.VITE_API_URL                     {ticket.kind === 'suporte' ? <LifeBuoy className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-2 mb-1">
import.meta.env.VITE_API_URL                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusColor(ticket.status)}`}>
import.meta.env.VITE_API_URL                         {ticket.status}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                       <span className="text-xs font-mono text-slate-400 font-bold">#{ticket.tracking_code}</span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <h3 className="font-bold text-slate-900 line-clamp-1">{ticket.subject}</h3>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Details */}
import.meta.env.VITE_API_URL                 <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 py-4 lg:py-0 border-y lg:border-y-0 border-slate-100">
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                     <User className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                     <div className="text-xs">
import.meta.env.VITE_API_URL                       <p className="text-slate-400 font-medium">Empresa</p>
import.meta.env.VITE_API_URL                       <p className="text-slate-900 font-bold truncate">{ticket.company_name}</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                     <Tag className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                     <div className="text-xs">
import.meta.env.VITE_API_URL                       <p className="text-slate-400 font-medium">Categoria</p>
import.meta.env.VITE_API_URL                       <p className="text-slate-900 font-bold">{ticket.category || 'Geral'}</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                     <Clock className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                     <div className="text-xs">
import.meta.env.VITE_API_URL                       <p className="text-slate-400 font-medium">Prioridade</p>
import.meta.env.VITE_API_URL                       <p className={`capitalize font-bold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                     <Calendar className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                     <div className="text-xs">
import.meta.env.VITE_API_URL                       <p className="text-slate-400 font-medium">Criado em</p>
import.meta.env.VITE_API_URL                       <p className="text-slate-900 font-bold">{new Date(ticket.created_at).toLocaleDateString()}</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Actions */}
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3 shrink-0">
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-1">
import.meta.env.VITE_API_URL                     <button 
import.meta.env.VITE_API_URL                       onClick={(e) => {
import.meta.env.VITE_API_URL                         e.stopPropagation();
import.meta.env.VITE_API_URL                         handleUpdateStatus(ticket.id, 'em análise');
import.meta.env.VITE_API_URL                       }}
import.meta.env.VITE_API_URL                       className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
import.meta.env.VITE_API_URL                       title="Marcar em análise"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <Clock className="w-5 h-5" />
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                     <button 
import.meta.env.VITE_API_URL                       onClick={(e) => {
import.meta.env.VITE_API_URL                         e.stopPropagation();
import.meta.env.VITE_API_URL                         handleUpdateStatus(ticket.id, 'resolvido');
import.meta.env.VITE_API_URL                       }}
import.meta.env.VITE_API_URL                       className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
import.meta.env.VITE_API_URL                       title="Marcar como resolvido"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <CheckCircle2 className="w-5 h-5" />
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="h-8 w-px bg-slate-100 mx-1" />
import.meta.env.VITE_API_URL                   <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
import.meta.env.VITE_API_URL                     Detalhes
import.meta.env.VITE_API_URL                     <ChevronRight className="w-4 h-4" />
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Detail Side Panel */}
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {selectedId && selectedTicket && (
import.meta.env.VITE_API_URL           <>
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               initial={{ opacity: 0 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1 }}
import.meta.env.VITE_API_URL               exit={{ opacity: 0 }}
import.meta.env.VITE_API_URL               onClick={() => setSelectedId(null)}
import.meta.env.VITE_API_URL               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               initial={{ x: '100%' }}
import.meta.env.VITE_API_URL               animate={{ x: 0 }}
import.meta.env.VITE_API_URL               exit={{ x: '100%' }}
import.meta.env.VITE_API_URL               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
import.meta.env.VITE_API_URL               className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {/* Detail Header */}
import.meta.env.VITE_API_URL               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
import.meta.env.VITE_API_URL                     <FileText className="w-5 h-5 text-slate-900" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <h2 className="font-bold text-slate-900 text-lg">{selectedTicket.tracking_code}</h2>
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-500">Gestão Administrativa</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => setSelectedId(null)}
import.meta.env.VITE_API_URL                   className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <X className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               {/* Detail Content */}
import.meta.env.VITE_API_URL               <div className="flex-1 overflow-y-auto p-6 space-y-8">
import.meta.env.VITE_API_URL                 {/* Status & Priority Badges */}
import.meta.env.VITE_API_URL                 <div className="flex flex-wrap gap-3">
import.meta.env.VITE_API_URL                   <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
import.meta.env.VITE_API_URL                     <div className={cn(
import.meta.env.VITE_API_URL                       "w-2 h-2 rounded-full",
import.meta.env.VITE_API_URL                       selectedTicket.status.toLowerCase() === 'aberto' ? "bg-blue-500" :
import.meta.env.VITE_API_URL                       selectedTicket.status.toLowerCase() === 'em análise' ? "bg-amber-500" :
import.meta.env.VITE_API_URL                       selectedTicket.status.toLowerCase() === 'pendente' ? "bg-purple-500" :
import.meta.env.VITE_API_URL                       "bg-emerald-500"
import.meta.env.VITE_API_URL                     )}></div>
import.meta.env.VITE_API_URL                     <span className="text-xs font-bold text-slate-700 capitalize">{selectedTicket.status}</span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className={cn(
import.meta.env.VITE_API_URL                     "px-4 py-2 rounded-2xl border flex items-center gap-2",
import.meta.env.VITE_API_URL                     selectedTicket.priority?.toLowerCase() === 'urgente' ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-600"
import.meta.env.VITE_API_URL                   )}>
import.meta.env.VITE_API_URL                     <ShieldAlert className="w-3.5 h-3.5" />
import.meta.env.VITE_API_URL                     <span className="text-xs font-bold capitalize">Prioridade {selectedTicket.priority}</span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* AI Analysis Section */}
import.meta.env.VITE_API_URL                 <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
import.meta.env.VITE_API_URL                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
import.meta.env.VITE_API_URL                   <div className="relative z-10">
import.meta.env.VITE_API_URL                     <div className="flex items-center justify-between mb-4">
import.meta.env.VITE_API_URL                       <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                         <Bot className="w-5 h-5 text-indigo-400" />
import.meta.env.VITE_API_URL                         <h3 className="font-bold">Análise de IA para Admin</h3>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         onClick={() => analyzeWithAI(selectedTicket.id)}
import.meta.env.VITE_API_URL                         disabled={analyzing}
import.meta.env.VITE_API_URL                         className={cn(
import.meta.env.VITE_API_URL                           "px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2",
import.meta.env.VITE_API_URL                           analyzing && "opacity-50 cursor-not-allowed"
import.meta.env.VITE_API_URL                         )}
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
import.meta.env.VITE_API_URL                         {analyzing ? 'A analisar...' : 'Gerar Insights'}
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                     {analysis ? (
import.meta.env.VITE_API_URL                       <motion.div 
import.meta.env.VITE_API_URL                         initial={{ opacity: 0, y: 10 }}
import.meta.env.VITE_API_URL                         animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL                         className="space-y-4"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Resumo Executivo</p>
import.meta.env.VITE_API_URL                           <p className="text-xs text-slate-300 leading-relaxed">{analysis?.summary}</p>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                         <div className="grid grid-cols-2 gap-3">
import.meta.env.VITE_API_URL                           <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                             <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Sentimento do Cliente</p>
import.meta.env.VITE_API_URL                             <p className="text-xs text-slate-300 capitalize">{analysis?.sentiment}</p>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                           <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                             <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Nível de Urgência</p>
import.meta.env.VITE_API_URL                             <p className="text-xs text-slate-300 capitalize">{analysis?.urgency || 'Normal'}</p>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                         <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Recomendação de Resposta</p>
import.meta.env.VITE_API_URL                           <p className="text-xs text-slate-300 leading-relaxed">{analysis?.suggested_solution}</p>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                       </motion.div>
import.meta.env.VITE_API_URL                     ) : (
import.meta.env.VITE_API_URL                       <p className="text-xs text-slate-400 italic">
import.meta.env.VITE_API_URL                         Utilize a IA para resumir o problema e obter sugestões de resolução imediata.
import.meta.env.VITE_API_URL                       </p>
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Client Info */}
import.meta.env.VITE_API_URL                 <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente / Empresa</p>
import.meta.env.VITE_API_URL                     <p className="text-sm font-bold text-slate-900">{selectedTicket.company_name}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contacto</p>
import.meta.env.VITE_API_URL                     <p className="text-sm font-bold text-slate-900">{selectedTicket.phone_e164}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Description */}
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição Original</p>
import.meta.env.VITE_API_URL                   <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
import.meta.env.VITE_API_URL                     <p className="font-bold text-slate-900 mb-2">{selectedTicket.subject}</p>
import.meta.env.VITE_API_URL                     <p className="text-sm text-slate-600 leading-relaxed">{selectedTicket.description}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Message History */}
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2 mb-4">
import.meta.env.VITE_API_URL                     <MessageSquare className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico de Mensagens</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   {loadingMessages ? (
import.meta.env.VITE_API_URL                     <div className="flex justify-center py-4">
import.meta.env.VITE_API_URL                       <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   ) : messages.length > 0 ? (
import.meta.env.VITE_API_URL                     <div className="space-y-3">
import.meta.env.VITE_API_URL                       {messages.map((m) => (
import.meta.env.VITE_API_URL                         <div key={m.id} className={cn(
import.meta.env.VITE_API_URL                           "p-3 rounded-xl text-xs max-w-[90%]",
import.meta.env.VITE_API_URL                           m.sender_type === 'user' ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white ml-auto"
import.meta.env.VITE_API_URL                         )}>
import.meta.env.VITE_API_URL                           <div className="flex justify-between items-center mb-1">
import.meta.env.VITE_API_URL                             <span className="font-bold uppercase text-[9px] opacity-60">
import.meta.env.VITE_API_URL                               {m.sender_type === 'user' ? 'Cliente' : m.sender_type === 'bot' ? 'WhatsApp Bot' : 'Admin'}
import.meta.env.VITE_API_URL                             </span>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                           <p>{m.text}</p>
import.meta.env.VITE_API_URL                           <p className={cn("text-[8px] mt-1 text-right opacity-60")}>
import.meta.env.VITE_API_URL                             {formatDate(m.created_at)}
import.meta.env.VITE_API_URL                           </p>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                       ))}
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   ) : (
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-400 italic">Sem histórico de mensagens disponível.</p>
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Internal Notes */}
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notas Internas (Apenas Admin)</p>
import.meta.env.VITE_API_URL                   <textarea 
import.meta.env.VITE_API_URL                     value={internalNotes}
import.meta.env.VITE_API_URL                     onChange={(e) => setInternalNotes(e.target.value)}
import.meta.env.VITE_API_URL                     placeholder="Adicione observações sobre a resolução deste ticket..."
import.meta.env.VITE_API_URL                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-slate-900 min-h-[100px] transition-all"
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                   <div className="mt-2 flex justify-end">
import.meta.env.VITE_API_URL                     <button 
import.meta.env.VITE_API_URL                       onClick={() => {
import.meta.env.VITE_API_URL                         toast.success('Notas internas guardadas.');
import.meta.env.VITE_API_URL                       }}
import.meta.env.VITE_API_URL                       className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       Guardar Notas
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               {/* Detail Footer */}
import.meta.env.VITE_API_URL               <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => handleUpdateStatus(selectedTicket.id, 'resolvido')}
import.meta.env.VITE_API_URL                   className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Marcar como Resolvido
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => handleUpdateStatus(selectedTicket.id, 'pendente')}
import.meta.env.VITE_API_URL                   className="px-4 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Pendente
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
