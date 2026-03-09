import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  X,
  MessageSquare,
  History,
  FileText,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Ticket {
  id: string;
  tracking_code: string;
  type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  text: string;
  created_at: string;
}

export function Requests() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/tickets`;
    console.log(`[APP] Fetching tickets: ${url}`);
    try {
      setLoading(true);
      const res = await fetch(url, {
        credentials: 'include'
      });
      console.log(`[APP] Fetch tickets status: ${res.status}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar tickets');
      }
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      console.error('[APP] Fetch tickets failed:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    const url = `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/messages`;
    console.log(`[APP] Fetching messages for ticket ${ticketId}: ${url}`);
    try {
      setLoadingMessages(true);
      const res = await fetch(url, {
        credentials: 'include'
      });
      console.log(`[APP] Fetch ticket messages status: ${res.status}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar mensagens do ticket');
      }
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      console.error(`[APP] Fetch ticket messages failed for ${ticketId}:`, err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchTicketMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  const selectedRequest = tickets.find(r => r.id === selectedId);

  const filters = ['Todos', 'Em aberto', 'Em análise', 'Resolvidos', 'Reclamações', 'Pedidos'];

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'Todos') return matchesSearch;
    if (filter === 'Em aberto') return matchesSearch && t.status.toLowerCase() === 'aberto';
    if (filter === 'Em análise') return matchesSearch && t.status.toLowerCase() === 'em análise';
    if (filter === 'Resolvidos') return matchesSearch && t.status.toLowerCase() === 'resolvido';
    if (filter === 'Reclamações') return matchesSearch && t.type.toLowerCase() === 'reclamação';
    if (filter === 'Pedidos') return matchesSearch && t.type.toLowerCase() === 'pedido';
    
    return matchesSearch;
  });

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

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">A carregar os seus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Erro ao carregar tickets</h3>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchTickets}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Pedidos e Solicitações</h1>
          <p className="text-slate-500">Acompanhe todos os tickets gerados pelo bot WhatsApp.</p>
        </div>
        <button className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all">
          <Plus className="w-4 h-4" /> Novo Ticket
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por código ou assunto..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  filter === f 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table/List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum pedido encontrado.</p>
              <p className="text-slate-400 text-sm">Tente ajustar os filtros ou pesquisar por outro termo.</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Assunto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Prioridade</th>
                  <th className="px-6 py-4">Criação</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTickets.map((req) => (
                  <tr 
                    key={req.id} 
                    className={cn(
                      "hover:bg-slate-50 transition-colors group cursor-pointer",
                      req.priority.toLowerCase() === 'alta' && req.status.toLowerCase() !== 'resolvido' ? "bg-red-50/30" : ""
                    )}
                    onClick={() => setSelectedId(req.id)}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{req.tracking_code}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        req.type.toLowerCase() === 'pedido' ? "bg-blue-50 text-blue-600" :
                        req.type.toLowerCase() === 'reclamação' ? "bg-red-50 text-red-600" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate">{req.subject}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          req.status.toLowerCase() === 'aberto' ? "bg-orange-500" :
                          req.status.toLowerCase() === 'em análise' ? "bg-blue-500" :
                          "bg-green-500"
                        )}></div>
                        <span className="font-medium text-slate-600">{req.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        req.priority.toLowerCase() === 'alta' ? "bg-red-500 text-white" :
                        req.priority.toLowerCase() === 'média' ? "bg-orange-50 text-orange-600" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{formatDate(req.created_at).split(',')[0]}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:bg-white hover:text-primary rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selectedId && selectedRequest && (
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
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">{selectedRequest.tracking_code}</h2>
                    <p className="text-xs text-slate-500">Detalhes do Ticket</p>
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
                      selectedRequest.status.toLowerCase() === 'aberto' ? "bg-orange-500" :
                      selectedRequest.status.toLowerCase() === 'em análise' ? "bg-blue-500" :
                      "bg-green-500"
                    )}></div>
                    <span className="text-xs font-bold text-slate-700">{selectedRequest.status}</span>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl border flex items-center gap-2",
                    selectedRequest.priority.toLowerCase() === 'alta' ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-600"
                  )}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Prioridade {selectedRequest.priority}</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
                    <p className="text-sm font-bold text-slate-900">{selectedRequest.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Criação</p>
                    <p className="text-sm font-bold text-slate-900">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assunto & Descrição</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-900 mb-2">{selectedRequest.subject}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Associated Messages */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mensagens Associadas</p>
                  </div>
                  {loadingMessages ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div key={m.id} className={cn(
                          "p-3 rounded-xl text-xs max-w-[90%]",
                          m.sender_type === 'user' ? "bg-slate-100 text-slate-700" : "bg-primary text-white ml-auto"
                        )}>
                          <p>{m.text}</p>
                          <p className={cn("text-[8px] mt-1 text-right", m.sender_type === 'user' ? "text-slate-400" : "text-white/60")}>
                            {formatDate(m.created_at).split(',')[1]?.trim() || formatDate(m.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhuma mensagem associada a este ticket.</p>
                  )}
                </div>

                {/* Observations */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Observações Internas</p>
                  <textarea 
                    placeholder="Adicione uma nota interna..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary min-h-[100px] transition-all"
                  />
                </div>
              </div>

              {/* Detail Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                  Resolver Pedido
                </button>
                <button className="px-4 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition-all">
                  Alterar Estado
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
