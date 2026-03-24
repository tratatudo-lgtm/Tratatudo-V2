import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  User, 
  Bot, 
  Send,
  X,
  ChevronRight,
  ShieldCheck,
  Activity,
  Zap,
  MoreHorizontal,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { LoadingState, ErrorState } from '../../components/States';

interface TicketData {
  id: string;
  client_id: string;
  subject?: string;
  title?: string;
  description?: string;
  text?: string;
  status: string;
  priority?: string;
  created_at: string;
  updated_at: string;
  internal_notes?: string;
}

interface TicketMessage {
  id: string;
  text: string;
  sender: 'client' | 'admin' | 'ai';
  created_at: string;
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { logout, fetchWithAuth } = useAdminAuth();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetchWithAuth('/api/admin/tickets');
      
      if (res.ok) {
        const data = await res.json();
        const ticketsData = extractArrayResponse<TicketData>(data);
        setTickets(ticketsData);
      } else if (res.status === 401) {
        await logout();
      } else {
        throw new Error('Falha ao carregar tickets de suporte');
      }
    } catch (err: any) {
      console.error('[ADMIN] Fetch tickets failed:', err);
      setError(err.message || 'Não foi possível carregar os tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTicketMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      // TODO: Backend endpoint /api/admin/tickets/:id/messages does not exist yet.
      setTicketMessages([]);
    } catch (err) {
      console.error('Failed to fetch messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketMessages(selectedTicket.id);
      setInternalNote(selectedTicket.internal_notes || '');
    }
  }, [selectedTicket]);

  const handleAnalyzeTicket = async () => {
    if (!selectedTicket) return;
    // TODO: Backend endpoint /api/admin/tickets/:id/analyze does not exist yet.
    toast.info('Análise de ticket (Admin) aguarda implementação no backend.');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      const response = await fetchWithAuth(`/api/admin/tickets/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Falha ao atualizar estado');

      setSelectedTicket({ ...selectedTicket, status: newStatus });
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
      toast.success(`Estado atualizado para ${newStatus}`);
    } catch (err) {
      toast.error('Erro ao atualizar estado');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedTicket) return;
    // TODO: Backend endpoint /api/admin/tickets/:id/notes does not exist yet.
    toast.info('Notas internas de tickets aguardam implementação no backend.');
  };

  const filteredTickets = tickets.filter(t => {
    const title = t.subject || t.title || `Ticket ${t.id}`;
    const matchesSearch = t.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading && tickets.length === 0) return <LoadingState message="A carregar tickets de suporte..." className="h-[60vh]" />;
  if (error && tickets.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suporte Técnico</h1>
          <p className="text-slate-500 font-medium">Gestão de tickets e assistência aos clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar tickets..." 
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

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Column */}
        <div className="lg:col-span-1 space-y-4">
          {filteredTickets.map((ticket, index) => {
            const title = ticket.subject || ticket.title || `Ticket ${ticket.id}`;
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTicket(ticket)}
                className={cn(
                  "p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden",
                  selectedTicket?.id === ticket.id 
                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
                    : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
                )}
              >
                {selectedTicket?.id === ticket.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                  />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                    selectedTicket?.id === ticket.id ? "bg-white/20 text-white" : 
                    ticket.priority === 'high' ? "bg-red-50 text-red-600" :
                    ticket.priority === 'medium' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {ticket.priority ? `Prioridade ${ticket.priority}` : 'Prioridade N/A'}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold",
                    selectedTicket?.id === ticket.id ? "text-white/60" : "text-slate-400"
                  )}>
                    #{ticket.id.slice(0, 8)}
                  </span>
                </div>

                <h3 className={cn(
                  "text-base font-black tracking-tight mb-1 line-clamp-1",
                  selectedTicket?.id === ticket.id ? "text-white" : "text-slate-900"
                )}>
                  {title}
                </h3>
                <p className={cn(
                  "text-xs font-bold uppercase tracking-widest mb-4",
                  selectedTicket?.id === ticket.id ? "text-white/70" : "text-slate-400"
                )}>
                  ID Cliente: {ticket.client_id}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-current/10">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      ticket.status === 'open' ? "bg-red-500" :
                      ticket.status === 'in_progress' ? "bg-orange-500" : "bg-emerald-500"
                    )} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      selectedTicket?.id === ticket.id ? "text-white" : "text-slate-600"
                    )}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold",
                    selectedTicket?.id === ticket.id ? "text-white/60" : "text-slate-400"
                  )}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center">
              <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-sm">Nenhum ticket encontrado.</p>
            </div>
          )}
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden sticky top-8"
              >
                {/* Detail Header */}
                <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                        <User className="w-7 h-7 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            {selectedTicket.subject || selectedTicket.title || `Ticket ${selectedTicket.id}`}
                          </h2>
                          <span className="text-[10px] font-bold text-slate-400">#{selectedTicket.id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID Cliente: {selectedTicket.client_id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(selectedTicket.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none focus:ring-2 transition-all cursor-pointer",
                          selectedTicket.status === 'open' ? "bg-red-50 text-red-600 focus:ring-red-200" :
                          selectedTicket.status === 'in_progress' ? "bg-orange-50 text-orange-600 focus:ring-orange-200" :
                          "bg-emerald-50 text-emerald-600 focus:ring-emerald-200"
                        )}
                      >
                        <option value="open">Aberto</option>
                        <option value="in_progress">Em Curso</option>
                        <option value="resolved">Resolvido</option>
                        <option value="closed">Fechado</option>
                      </select>
                      <button 
                        onClick={handleAnalyzeTicket}
                        disabled={isAnalyzing}
                        className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                        title="Análise AI"
                      >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                  {/* Messages Area */}
                  <div className="md:col-span-3 p-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Histórico de Mensagens
                    </h4>
                    
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                          {selectedTicket.description || selectedTicket.text || 'Sem descrição disponível.'}
                        </p>
                        <div className="mt-2 flex justify-end">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Descrição Inicial</span>
                        </div>
                      </div>

                      {loadingMessages ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : ticketMessages.length > 0 ? (
                        ticketMessages.map((msg) => (
                          <div 
                            key={msg.id}
                            className={cn(
                              "flex flex-col gap-1 max-w-[85%]",
                              msg.sender === 'client' ? "mr-auto" : "ml-auto items-end"
                            )}
                          >
                            <div className={cn(
                              "p-4 rounded-2xl text-sm font-medium leading-relaxed",
                              msg.sender === 'client' ? "bg-slate-100 text-slate-800 rounded-tl-none" : 
                              msg.sender === 'ai' ? "bg-blue-50 text-blue-700 border border-blue-100 rounded-tr-none" :
                              "bg-primary text-white rounded-tr-none"
                            )}>
                              {msg.text}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                              {msg.sender === 'ai' ? 'TrataTudo AI' : msg.sender === 'admin' ? 'Suporte' : 'Cliente'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                          <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-medium">Sem mensagens adicionais.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50">
                      <div className="relative">
                        <textarea 
                          placeholder="Responder ao cliente (Funcionalidade aguarda backend)..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-4 pr-14 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                          rows={2}
                          disabled
                        />
                        <button 
                          disabled
                          className="absolute right-3 bottom-3 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 opacity-50 cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Area */}
                  <div className="md:col-span-2 p-8 bg-slate-50/30 space-y-8">
                    {/* Internal Notes */}
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ClipboardList className="w-3 h-3" /> Notas Internas
                      </h4>
                      <textarea 
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Apenas visível para admins..."
                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                        rows={6}
                      />
                      <button 
                        onClick={handleSaveNote}
                        className="w-full mt-3 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                      >
                        Guardar Nota
                      </button>
                    </div>

                    {/* Client Info */}
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informação do Cliente</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Cliente</p>
                            <p className="text-xs font-black text-slate-900">{selectedTicket.client_id}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights Placeholder */}
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Insights AI</h4>
                      </div>
                      <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                        A análise AI pode ajudar a identificar a causa raiz do problema e sugerir respostas rápidas.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <ClipboardList className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Selecione um Ticket</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                  Escolha um ticket da lista lateral para visualizar o histórico e gerir a assistência.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
