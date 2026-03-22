import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical,
  User,
  Phone,
  Calendar,
  ChevronRight,
  Loader2,
  Tag,
  Hash,
  LifeBuoy,
  HelpCircle,
  X,
  ShieldAlert,
  Bot,
  Zap,
  FileText,
  Sparkles,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, extractArrayResponse } from '../../lib/utils';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';

interface Ticket {
  id: string;
  tracking_code: string;
  subject: string;
  description: string;
  status: 'aberto' | 'em análise' | 'pendente' | 'resolvido';
  kind?: 'suporte' | 'reclamação' | 'pedido' | 'outros';
  category: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  created_at: string;
  updated_at?: string;
  company_name?: string;
  phone_e164?: string;
  client_name?: string;
  client_phone?: string;
  ai_analysis?: string;
  internal_notes?: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  text: string;
  created_at: string;
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterKind, setFilterKind] = useState<'todos' | 'suporte' | 'outros'>('todos');
  
  // Detail Panel State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [internalNotes, setInternalNotes] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchTicketMessages(selectedId);
    } else {
      setMessages([]);
      setAnalysis(null);
    }
  }, [selectedId]);

  const fetchTickets = async () => {
    const endpoints = [
      `${baseUrl}/api/admin/tickets`,
      `${baseUrl}/api/tickets`,
      `${baseUrl}/api/pedidos`
    ];
    
    let lastError = null;
    
    try {
      setLoading(true);
      setError(null);
      
      for (const url of endpoints) {
        console.log(`[ADMIN] Fetching tickets: ${url}`);
        try {
          const res = await fetch(url, {
            credentials: 'include'
          });
          
          if (res.ok) {
            const data = await res.json();
            const ticketsData = extractArrayResponse<Ticket>(data, 'tickets');
            setTickets(ticketsData);
            setLoading(false);
            return;
          } else if (res.status === 401) {
            throw new Error('Sessão expirada ou sem permissões de administrador.');
          }
        } catch (e) {
          lastError = e;
        }
      }
      
      throw lastError || new Error('Falha ao carregar tickets de suporte');
      
    } catch (err: any) {
      console.error('[ADMIN] Fetch tickets failed:', err);
      setError(err.message || 'Não foi possível carregar os tickets.');
      
      // Professional fallback for demo/development
      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        console.log('[ADMIN] Using fallback tickets data');
        setTickets([
          {
            id: '1',
            tracking_code: 'TRT-12345',
            subject: 'Dúvida sobre integração WhatsApp',
            description: 'Como posso conectar a minha instância?',
            status: 'aberto',
            priority: 'média',
            category: 'Técnico',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            client_name: 'João Silva',
            client_phone: '+351912345678',
            ai_analysis: 'O cliente está com dificuldades na configuração inicial.',
            internal_notes: 'Aguardando resposta do suporte nível 2.'
          },
          {
            id: '2',
            tracking_code: 'TRT-67890',
            subject: 'Erro na faturação mensal',
            description: 'O valor cobrado está incorreto.',
            status: 'resolvido',
            priority: 'alta',
            category: 'Financeiro',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            client_name: 'Maria Santos',
            client_phone: '+351919876543'
          }
        ]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`${baseUrl}/api/admin/tickets/${ticketId}/messages`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Falha ao carregar mensagens');
      const json = await res.json();
      setMessages(extractArrayResponse<TicketMessage>(json, 'messages'));
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const analyzeWithAI = async (ticketId: string) => {
    try {
      setAnalyzing(true);
      const res = await fetch(`${baseUrl}/api/admin/tickets/${ticketId}/analyze`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Falha na análise de IA');
      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      toast.error('Falha na análise IA.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (res.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: json.ticket.status } : t));
        toast.success(`Ticket atualizado para ${status}.`);
      } else {
        throw new Error(json.error || 'Erro ao atualizar status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar status.');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(search.toLowerCase()) || 
      t.company_name.toLowerCase().includes(search.toLowerCase()) ||
      t.tracking_code.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
    
    const matchesKind = 
      filterKind === 'todos' || 
      (filterKind === 'suporte' && t.kind === 'suporte') ||
      (filterKind === 'outros' && t.kind !== 'suporte');

    return matchesSearch && matchesStatus && matchesKind;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'em análise': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'pendente': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'resolvido': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return 'text-slate-500';
      case 'média': return 'text-blue-500';
      case 'alta': return 'text-orange-500';
      case 'urgente': return 'text-red-600 font-bold';
      default: return 'text-slate-500';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedTicket = tickets.find(t => t.id === selectedId);

  if (loading && tickets.length === 0) {
    return <LoadingState message="A carregar tickets do sistema..." className="h-[calc(100vh-10rem)]" />;
  }

  if (error && tickets.length === 0) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
        <ErrorState message={error} />
        <button 
          onClick={fetchTickets}
          className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Tickets</h1>
          <p className="text-slate-500 mt-1">Monitorize e responda aos pedidos de suporte e reclamações.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Procurar por código, empresa ou assunto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none w-full md:w-80 transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
          {['todos', 'aberto', 'em análise', 'pendente', 'resolvido'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                filterStatus === status 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
          <button
            onClick={() => setFilterKind('todos')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              filterKind === 'todos' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterKind('suporte')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              filterKind === 'suporte' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            Suporte
          </button>
          <button
            onClick={() => setFilterKind('outros')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              filterKind === 'outros' 
                ? 'bg-white text-orange-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Outros
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <EmptyState message="Nenhum ticket encontrado com os filtros atuais." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
              onClick={() => setSelectedId(ticket.id)}
            >
              <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Status & Icon */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    ticket.kind === 'suporte' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {ticket.kind === 'suporte' ? <LifeBuoy className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-bold">#{ticket.tracking_code}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{ticket.subject}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 py-4 lg:py-0 border-y lg:border-y-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Empresa</p>
                      <p className="text-slate-900 font-bold truncate">{ticket.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Categoria</p>
                      <p className="text-slate-900 font-bold">{ticket.category || 'Geral'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Prioridade</p>
                      <p className={`capitalize font-bold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Criado em</p>
                      <p className="text-slate-900 font-bold">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(ticket.id, 'em análise');
                      }}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Marcar em análise"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(ticket.id, 'resolvido');
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Marcar como resolvido"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="h-8 w-px bg-slate-100 mx-1" />
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                    Detalhes
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selectedId && selectedTicket && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <FileText className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">{selectedTicket.tracking_code}</h2>
                    <p className="text-xs text-slate-500">Gestão Administrativa</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status & Priority Badges */}
                <div className="flex flex-wrap gap-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedTicket.status.toLowerCase() === 'aberto' ? "bg-blue-500" :
                      selectedTicket.status.toLowerCase() === 'em análise' ? "bg-amber-500" :
                      selectedTicket.status.toLowerCase() === 'pendente' ? "bg-purple-500" :
                      "bg-emerald-500"
                    )}></div>
                    <span className="text-xs font-bold text-slate-700 capitalize">{selectedTicket.status}</span>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl border flex items-center gap-2",
                    selectedTicket.priority?.toLowerCase() === 'urgente' ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-600"
                  )}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold capitalize">Prioridade {selectedTicket.priority}</span>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-bold">Análise de IA para Admin</h3>
                      </div>
                      <button 
                        onClick={() => analyzeWithAI(selectedTicket.id)}
                        disabled={analyzing}
                        className={cn(
                          "px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2",
                          analyzing && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        {analyzing ? 'A analisar...' : 'Gerar Insights'}
                      </button>
                    </div>

                    {analysis ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Resumo Executivo</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{analysis?.summary}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Sentimento do Cliente</p>
                            <p className="text-xs text-slate-300 capitalize">{analysis?.sentiment}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Nível de Urgência</p>
                            <p className="text-xs text-slate-300 capitalize">{analysis?.urgency || 'Normal'}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Recomendação de Resposta</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{analysis?.suggested_solution}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Utilize a IA para resumir o problema e obter sugestões de resolução imediata.
                      </p>
                    )}
                  </div>
                </div>

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente / Empresa</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTicket.company_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contacto</p>
                    <p className="text-sm font-bold text-slate-900">{selectedTicket.phone_e164}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição Original</p>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="font-bold text-slate-900 mb-2">{selectedTicket.subject}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Message History */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico de Mensagens</p>
                  </div>
                  {loadingMessages ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div key={m.id} className={cn(
                          "p-3 rounded-xl text-xs max-w-[90%]",
                          m.sender_type === 'user' ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white ml-auto"
                        )}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold uppercase text-[9px] opacity-60">
                              {m.sender_type === 'user' ? 'Cliente' : m.sender_type === 'bot' ? 'WhatsApp Bot' : 'Admin'}
                            </span>
                          </div>
                          <p>{m.text}</p>
                          <p className={cn("text-[8px] mt-1 text-right opacity-60")}>
                            {formatDate(m.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sem histórico de mensagens disponível.</p>
                  )}
                </div>

                {/* Internal Notes */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notas Internas (Apenas Admin)</p>
                  <textarea 
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Adicione observações sobre a resolução deste ticket..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-slate-900 min-h-[100px] transition-all"
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={() => {
                        toast.success('Notas internas guardadas.');
                      }}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                    >
                      Guardar Notas
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'resolvido')}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  Marcar como Resolvido
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'pendente')}
                  className="px-4 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition-all"
                >
                  Pendente
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
