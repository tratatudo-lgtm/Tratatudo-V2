import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  AlertCircle,
  ChevronRight,
  X,
  FileText,
  ShieldAlert,
  Loader2,
  Bot,
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
import { apiFetch, apiPost, apiPatch } from '../../lib/api';

interface Ticket extends HubTicket {}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'client' | 'system' | 'ai';
  sender_name: string;
  message: string;
  created_at: string;
}

const SupportModal = ({ isOpen, onClose, onSubmit, initialType }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialType: OperationalArea;
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Geral');
  const [priority, setPriority] = useState<'baixa' | 'média' | 'alta' | 'urgente'>('média');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Por favor, preencha o assunto e a mensagem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ subject, message, category, priority, type: initialType });
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
                  AREA_CONFIG[initialType]?.bgLight || 'bg-slate-50',
                  AREA_CONFIG[initialType]?.textMain || 'text-slate-600'
                )}>
                  {initialType === 'requests' ? <ClipboardList className="w-6 h-6" /> :
                   initialType === 'complaints' ? <AlertCircle className="w-6 h-6" /> :
                   <TrendingUp className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Novo {AREA_CONFIG[initialType]?.label || 'Ticket'}</h3>
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
                    {initialType === 'sales' && <option value="Lead">Lead</option>}
                    {initialType === 'complaints' && <option value="Serviço">Serviço</option>}
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
                  placeholder={initialType === 'sales' ? "Ex: Novo Lead - Empresa X" : "Ex: Dúvida sobre faturas"}
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
                    AREA_CONFIG[initialType].bgMain,
                    AREA_CONFIG[initialType].bgHover,
                    AREA_CONFIG[initialType].shadowMain
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
                      Criar {AREA_CONFIG[initialType].label}
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

export function TicketBase({ area }: { area: OperationalArea }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const { can, canSee } = usePermissions();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      // Map OperationalArea to backend 'kind'
      const kindMap: Record<string, string> = {
        'requests': 'pedido',
        'complaints': 'reclamação',
        'sales': 'venda',
        'tickets': 'suporte'
      };
      
      const kind = kindMap[area];
      const params = new URLSearchParams();
      if (kind) params.append('kind', kind);
      
      const url = `/api/client/tickets${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiFetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      const rawTickets = extractArrayResponse<any>(data, 'tickets');
      setTickets(rawTickets.map(t => ({ ...t, type: area })));
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
      const response = await apiFetch(`/api/client/tickets/${ticketId}/messages`);
      const data = await response.json();
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
      const data = await apiPost(`/api/client/tickets/${ticketId}/analyze`, {});
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
      const res = await apiPatch(`/api/client/tickets/${ticketId}/status`, { status });
      if (res) {
        toast.success(`Estado: ${status}`);
        fetchTickets();
      }
    } catch (err) {
      toast.error('Erro ao atualizar.');
    }
  };

  const handleSupportSubmit = async (supportData: any) => {
    if (!can('tickets', 'create')) {
      toast.error('Sem permissão para criar.');
      return;
    }
    
    try {
      toast.loading('A processar...');
      const kindMap: Record<string, string> = {
        'requests': 'pedido',
        'complaints': 'reclamação',
        'sales': 'venda',
        'tickets': 'suporte'
      };

      const res = await apiPost('/api/client/tickets', {
        title: supportData.subject,
        description: supportData.message,
        category: supportData.category,
        priority: supportData.priority,
        kind: kindMap[area] || 'suporte'
      });
      
      toast.dismiss();
      if (res) {
        toast.success('Criado com sucesso!');
        fetchTickets();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [area]);

  useEffect(() => {
    if (selectedId) fetchTicketMessages(selectedId);
  }, [selectedId]);

  const selectedRequest = tickets.find(r => r.id === selectedId);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.tracking_code || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = (t.status || '').toLowerCase();
    const category = (t.category || '').toLowerCase();

    const matchesStatus = filter === 'Todos' || 
                         (filter === 'Em aberto' && ['novo', 'nova', 'novo lead', 'aberto'].includes(status)) ||
                         (filter === 'Em análise' && ['em análise', 'em investigação', 'contactado'].includes(status)) ||
                         (filter === 'Resolvidos' && ['concluído', 'resolvida', 'fechado ganho'].includes(status)) ||
                         t.status === filter;

    const matchesCategory = categoryFilter === 'Todas' || category === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const areaFilters = ['Todos', 'Em aberto', 'Em análise', 'Resolvidos', ...AREA_CONFIG[area].statuses];
  const categories = ['Todas', ...Array.from(new Set(tickets.map(t => t.category))).filter(Boolean)];

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
        <p className="text-slate-500">Não tem permissões para visualizar {AREA_CONFIG[area].label}.</p>
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
          <div className={cn("p-4 rounded-2xl", AREA_CONFIG[area].bgLight)}>
            {area === 'requests' ? <ClipboardList className={cn("w-8 h-8", AREA_CONFIG[area].textMain)} /> : 
             area === 'complaints' ? <AlertCircle className={cn("w-8 h-8", AREA_CONFIG[area].textMain)} /> : 
             <TrendingUp className={cn("w-8 h-8", AREA_CONFIG[area].textMain)} />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{AREA_CONFIG[area].label}</h1>
            <p className="text-slate-500 font-medium">Gestão de {AREA_CONFIG[area].label.toLowerCase()} em tempo real.</p>
          </div>
        </div>
        {can('tickets', 'create') && (
          <button 
            onClick={() => setIsSupportOpen(true)}
            className={cn(
              "w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]", 
              AREA_CONFIG[area].bgMain
            )}
          >
            <Plus className="w-5 h-5" /> Novo {AREA_CONFIG[area].label.slice(0, -1)}
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
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {areaFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                    filter === f ? `${AREA_CONFIG[area].bgMain} text-white shadow-md` : "bg-slate-50 text-slate-600"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide border-t border-slate-100 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center mr-2">Categorias:</span>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all",
                    categoryFilter === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
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
                        <div className={cn("w-2 h-2 rounded-full", ['novo', 'nova', 'novo lead', 'aberto'].includes((req.status || '').toLowerCase()) ? "bg-blue-500" : "bg-orange-500")}></div>
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
                        {AREA_CONFIG[area].statuses.map(s => <option key={s} value={s}>{s}</option>)}
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
                          <p>{m.message}</p>
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
                      area === 'requests' ? 'concluído' : 
                      area === 'complaints' ? 'resolvida' : 
                      'fechado ganho'
                    )} 
                    className={cn("flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-lg", AREA_CONFIG[area].bgMain)}
                  >
                    {area === 'requests' ? 'Concluir' : 
                     area === 'complaints' ? 'Resolver' : 
                     'Fechar (Ganho)'}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} onSubmit={handleSupportSubmit} initialType={area} />
    </div>
  );
}
