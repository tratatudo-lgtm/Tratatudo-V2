import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  AlertCircle,
  ChevronRight,
  X,
  MessageSquare,
  FileText,
  ShieldAlert,
  Loader2,
  Bot,
  Zap,
  Send,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, extractArrayResponse } from '../../lib/utils';
import { LoadingState, ErrorState } from '../../components/States';
import { toast } from 'sonner';
import { OperationalArea, HubTicket, AREA_CONFIG } from '../../types/hub';
import { usePermissions } from '../../lib/usePermissions';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';

interface Ticket extends HubTicket {}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  text: string;
  created_at: string;
}

const SupportModal = ({ isOpen, onClose, onSubmit, initialType }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialType?: OperationalArea;
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<OperationalArea>(initialType || 'pedidos');
  const [category, setCategory] = useState('Geral');
  const [priority, setPriority] = useState<'baixa' | 'média' | 'alta' | 'urgente'>('média');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialType) setType(initialType);
  }, [initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Por favor, preencha o assunto e a mensagem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ subject, message, category, priority, type });
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  type === 'pedidos' ? "bg-blue-100 text-blue-600" :
                  type === 'reclamacoes' ? "bg-red-100 text-red-600" :
                  "bg-emerald-100 text-emerald-600"
                )}>
                  {type === 'pedidos' ? <ClipboardList className="w-6 h-6" /> :
                   type === 'reclamacoes' ? <AlertCircle className="w-6 h-6" /> :
                   <TrendingUp className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Novo {AREA_CONFIG[type].label}</h3>
                  <p className="text-sm text-slate-500">Crie uma nova entrada no sistema.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tipo de Fluxo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(AREA_CONFIG) as OperationalArea[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setType(key)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1",
                        type === key 
                          ? `${AREA_CONFIG[key].bgLight} ${AREA_CONFIG[key].borderLight} ${AREA_CONFIG[key].textMain}`
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {key === 'pedidos' ? <ClipboardList className="w-4 h-4" /> :
                       key === 'reclamacoes' ? <AlertCircle className="w-4 h-4" /> :
                       <TrendingUp className="w-4 h-4" />}
                      {AREA_CONFIG[key].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Sugestão">Sugestão</option>
                    {type === 'vendas' && <option value="Lead">Lead</option>}
                    {type === 'reclamacoes' && <option value="Serviço">Serviço</option>}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Assunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={type === 'vendas' ? "Ex: Novo Lead - Empresa X" : "Ex: Dúvida sobre faturas"}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mensagem detalhada</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva os detalhes..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-3.5 px-6 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                    AREA_CONFIG[type].bgMain,
                    AREA_CONFIG[type].bgHover,
                    AREA_CONFIG[type].shadowMain
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      A criar...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Criar {AREA_CONFIG[type].label}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export function Requests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<OperationalArea>('pedidos');
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const { can, canSee } = usePermissions();

  useEffect(() => {
    const area = searchParams.get('area') as OperationalArea;
    if (area && ['pedidos', 'reclamacoes', 'vendas'].includes(area)) {
      setActiveArea(area);
    } else {
      setSearchParams({ area: 'pedidos' });
      setActiveArea('pedidos');
    }
  }, [searchParams, setSearchParams]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/api/client/tickets`, {
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Falha ao carregar tickets do servidor.');
      
      const data = await res.json();
      const rawTickets = extractArrayResponse<any>(data, 'tickets');
      
      const ticketsData: Ticket[] = rawTickets.map(t => {
        let normalizedType: OperationalArea = 'pedidos';
        const rawType = (t.type || t.kind || 'pedidos' || '').toLowerCase();
        
        if (rawType.includes('reclam') || rawType === 'complaint' || rawType === 'reclamacao') normalizedType = 'reclamacoes';
        else if (rawType.includes('vend') || rawType === 'sale' || rawType === 'lead' || rawType === 'venda') normalizedType = 'vendas';
        else normalizedType = 'pedidos';

        return { ...t, type: normalizedType };
      });

      setTickets(ticketsData);
    } catch (err: any) {
      console.error('[HUB] Fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      setAnalysis(null);
      const res = await fetch(`${BASE_URL}/api/client/tickets/${ticketId}/messages`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Erro ao carregar histórico.');
      const data = await res.json();
      setMessages(extractArrayResponse<TicketMessage>(data, 'messages'));
    } catch (err: any) {
      console.error(`[HUB] Messages failed:`, err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const analyzeWithAI = async (ticketId: string) => {
    try {
      setAnalyzing(true);
      const res = await fetch(`${BASE_URL}/api/client/tickets/${ticketId}/analyze`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('IA indisponível.');
      const data = await res.json();
      setAnalysis(data?.analysis || data);
    } catch (err: any) {
      toast.error('IA em ativação ou erro de conexão.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    if (!can('tickets', 'edit')) {
      toast.error('Sem permissão para alterar estado.');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/client/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Estado: ${status}`);
        fetchTickets();
      } else {
        toast.error('Erro ao atualizar.');
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    }
  };

  const handleSupportSubmit = async (supportData: any) => {
    if (!can('tickets', 'create')) {
      toast.error('Sem permissão para criar.');
      return;
    }
    
    try {
      toast.loading('A processar...');
      const res = await fetch(`${BASE_URL}/api/client/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: supportData.subject,
          description: supportData.message,
          category: supportData.category,
          priority: supportData.priority,
          type: supportData.type === 'pedidos' ? 'pedido' : 
                supportData.type === 'reclamacoes' ? 'reclamacao' : 
                'venda'
        })
      });
      
      toast.dismiss();
      if (res.ok) {
        toast.success('Criado com sucesso!');
        fetchTickets();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedId) fetchTicketMessages(selectedId);
  }, [selectedId]);

  const selectedRequest = tickets.find(r => r.id === selectedId);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.tracking_code || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = t.type === activeArea;
    if (!matchesArea) return false;

    const status = (t.status || '').toLowerCase();

    if (filter === 'Todos') return matchesSearch;
    if (filter === 'Em aberto') return matchesSearch && ['novo', 'nova', 'novo lead'].includes(status);
    if (filter === 'Em análise') return matchesSearch && ['em análise', 'em investigação', 'contactado'].includes(status);
    if (filter === 'Resolvidos') return matchesSearch && ['concluído', 'resolvida', 'fechado ganho'].includes(status);
    return matchesSearch && t.status === filter;
  });

  const areaFilters = ['Todos', 'Em aberto', 'Em análise', 'Resolvidos', ...AREA_CONFIG[activeArea].statuses];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!canSee('tickets')) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Acesso Restrito</h2>
        <p className="text-slate-500">Não tem permissões para visualizar {AREA_CONFIG[activeArea].label}.</p>
      </div>
    );
  }

  if (loading) return <LoadingState message="A carregar..." className="h-[calc(100vh-10rem)]" />;
  
  if (error) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-6">
        <ErrorState message={error} />
        <button 
          onClick={fetchTickets}
          className="mt-4 flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-2xl", AREA_CONFIG[activeArea].bgLight)}>
            {activeArea === 'pedidos' ? <ClipboardList className={cn("w-8 h-8", AREA_CONFIG[activeArea].textMain)} /> : 
             activeArea === 'reclamacoes' ? <AlertCircle className={cn("w-8 h-8", AREA_CONFIG[activeArea].textMain)} /> : 
             <TrendingUp className={cn("w-8 h-8", AREA_CONFIG[activeArea].textMain)} />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{AREA_CONFIG[activeArea].label}</h1>
            <p className="text-slate-500 font-medium">Gestão de {AREA_CONFIG[activeArea].label.toLowerCase()} em tempo real.</p>
          </div>
        </div>
        {can('tickets', 'create') && (
          <button 
            onClick={() => setIsSupportOpen(true)}
            className={cn(
              "w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]", 
              AREA_CONFIG[activeArea].bgMain
            )}
          >
            <Plus className="w-5 h-5" /> Novo {AREA_CONFIG[activeArea].label.slice(0, -1)}
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {areaFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  filter === f ? `${AREA_CONFIG[activeArea].bgMain} text-white shadow-md` : "bg-slate-50 text-slate-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhum registo encontrado.</div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Assunto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Prioridade</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTickets.map((req) => (
                  <tr key={req.id} onClick={() => can('tickets', 'view') && setSelectedId(req.id)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{req.tracking_code}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 truncate max-w-xs">{req.title}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", ['novo', 'nova', 'novo lead'].includes((req.status || '').toLowerCase()) ? "bg-blue-500" : "bg-orange-500")}></div>
                        <span className="font-bold capitalize">{req.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase", req.priority === 'urgente' ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600")}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right"><ChevronRight className="w-4 h-4 ml-auto text-slate-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedId && selectedRequest && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-slate-900">{selectedRequest.tracking_code}</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedId(null)} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Estado</p>
                    {can('tickets', 'edit') ? (
                      <select value={selectedRequest.status} onChange={(e) => handleUpdateStatus(selectedRequest.id, e.target.value)} className="w-full p-2 rounded-xl border text-xs font-bold bg-slate-50">
                        {AREA_CONFIG[selectedRequest.type].statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : <div className="p-2 bg-slate-50 rounded-xl text-xs font-bold">{selectedRequest.status}</div>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Prioridade</p>
                    <div className="p-2 bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> {selectedRequest.priority}</div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /><h3 className="font-bold">Análise IA</h3></div>
                    <button onClick={() => analyzeWithAI(selectedRequest.id)} disabled={analyzing} className="px-3 py-1.5 bg-primary rounded-xl text-[10px] font-bold">{analyzing ? 'A analisar...' : 'Analisar'}</button>
                  </div>
                  {analysis ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-2 bg-white/5 rounded-lg"><p className="text-primary font-bold mb-1">Resumo</p><p className="text-slate-300">{analysis.summary}</p></div>
                      <div className="p-2 bg-emerald-500/10 rounded-lg"><p className="text-emerald-400 font-bold mb-1">Sugestão</p><p className="text-emerald-100">{analysis.suggested_solution}</p></div>
                    </div>
                  ) : <p className="text-[10px] text-slate-500 italic">Análise inteligente em ativação...</p>}
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Descrição</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm leading-relaxed">{selectedRequest.description}</div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Mensagens</p>
                  {loadingMessages ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map(m => (
                        <div key={m.id} className={cn("p-3 rounded-xl text-xs max-w-[90%]", m.sender_type === 'user' ? "bg-slate-100" : "bg-primary text-white ml-auto")}>
                          <p>{m.text}</p>
                          <p className="text-[8px] mt-1 opacity-50 text-right">{formatDate(m.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-400 italic">Sem histórico.</p>}
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50/50 flex gap-3">
                {can('tickets', 'edit') && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedRequest.id, 
                      selectedRequest.type === 'pedidos' ? 'concluído' : 
                      selectedRequest.type === 'reclamacoes' ? 'resolvida' : 
                      'fechado ganho'
                    )} 
                    className={cn("flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-lg", AREA_CONFIG[selectedRequest.type].bgMain)}
                  >
                    {selectedRequest.type === 'pedidos' ? 'Concluir' : 
                     selectedRequest.type === 'reclamacoes' ? 'Resolver' : 
                     'Fechar (Ganho)'}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} onSubmit={handleSupportSubmit} initialType={activeArea} />
    </div>
  );
}
