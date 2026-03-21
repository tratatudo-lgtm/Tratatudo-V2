import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Loader2,
  Bot,
  Zap,
  ChevronLeft,
  Tag,
  Sparkles,
  Send,
  LifeBuoy,
  TrendingUp,
  Target,
  Handshake,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, extractArrayResponse } from '../../lib/utils';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { toast } from 'sonner';
import { HubArea, HubTicket, AREA_CONFIG } from '../../types/hub';

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
  initialType?: HubArea;
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<HubArea>(initialType || 'pedidos');
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
                  {(Object.keys(AREA_CONFIG) as HubArea[]).map((key) => (
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
  const [activeArea, setActiveArea] = useState<HubArea>((searchParams.get('area') as HubArea) || 'pedidos');
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    const area = searchParams.get('area') as HubArea;
    if (area && (area === 'pedidos' || area === 'reclamacoes' || area === 'vendas')) {
      setActiveArea(area);
    }
  }, [searchParams]);

  const handleAreaChange = (area: HubArea) => {
    setSearchParams({ area });
    setActiveArea(area);
    setFilter('Todos');
  };

  const fetchTickets = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    const endpoints = [
      `${baseUrl}/api/client/tickets`,
      `${baseUrl}/api/tickets`,
      `${baseUrl}/api/pedidos`
    ];
    
    let lastError = null;
    
    try {
      setLoading(true);
      setError(null);
      
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            credentials: 'include'
          });
          
          if (res.ok) {
            const data = await res.json();
            const rawTickets = extractArrayResponse<any>(data, 'tickets');
            
            // Normalize types from backend
            const ticketsData: Ticket[] = rawTickets.map(t => {
              let normalizedType: HubArea = 'pedidos';
              const rawType = (t.type || t.kind || 'pedidos').toLowerCase();
              
              if (rawType.includes('reclam') || rawType === 'complaint') {
                normalizedType = 'reclamacoes';
              } else if (rawType.includes('vend') || rawType === 'sale' || rawType === 'lead') {
                normalizedType = 'vendas';
              } else if (rawType.includes('pedid') || rawType === 'request' || rawType === 'suporte' || rawType === 'support') {
                normalizedType = 'pedidos';
              }

              return {
                ...t,
                type: normalizedType
              };
            });

            setTickets(ticketsData);
            setLoading(false);
            return;
          } else if (res.status === 401) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          }
        } catch (e) {
          lastError = e;
        }
      }
      
      throw lastError || new Error('Falha ao carregar tickets');
      
    } catch (err: any) {
      console.error('[APP] Fetch tickets failed:', err);
      setError(err.message || 'Não foi possível carregar os dados.');
      
      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        setTickets([
          {
            id: '1',
            tracking_code: 'PED-1001',
            type: 'pedidos',
            subject: 'Instalação de Ar Condicionado',
            description: 'Necessito de instalação em 2 quartos.',
            status: 'em execução',
            priority: 'média',
            category: 'Técnico',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            ai_analysis: 'O cliente tem urgência para antes do verão.'
          },
          {
            id: '2',
            tracking_code: 'REC-2001',
            type: 'reclamacoes',
            subject: 'Atraso na entrega',
            description: 'O material não chegou no dia combinado.',
            status: 'em investigação',
            priority: 'alta',
            category: 'Logística',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            tracking_code: 'VEN-3001',
            type: 'vendas',
            subject: 'Interesse em Plano Enterprise',
            description: 'Empresa com 50 funcionários quer proposta.',
            status: 'novo lead',
            priority: 'urgente',
            category: 'Vendas',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    const url = `${baseUrl}/api/client/tickets/${ticketId}/messages`;
    console.log(`[APP] Fetching messages for ticket ${ticketId}: ${url}`);
    try {
      setLoadingMessages(true);
      setAnalysis(null); // Reset analysis when changing ticket
      const res = await fetch(url, {
        credentials: 'include'
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar mensagens do ticket');
      }
      const data = await res.json();
      setMessages(extractArrayResponse<TicketMessage>(data, 'messages'));
    } catch (err: any) {
      console.error(`[APP] Fetch ticket messages failed for ${ticketId}:`, err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const analyzeWithAI = async (ticketId: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    const url = `${baseUrl}/api/client/tickets/${ticketId}/analyze`;
    try {
      setAnalyzing(true);
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Falha na análise de IA');
      const data = await res.json();
      setAnalysis(data?.analysis || data);
    } catch (err: any) {
      console.error('[APP] AI Analysis failed:', err);
      toast.error('Falha na análise IA.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
      const res = await fetch(`${baseUrl}/api/client/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Estado atualizado para ${status}`);
        fetchTickets();
      } else {
        toast.error('Erro ao atualizar estado.');
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    }
  };

  const handleSupportSubmit = async (supportData: any) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    
    try {
      toast.loading('A criar o seu pedido de suporte...');
      const res = await fetch(`${baseUrl}/api/client/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: supportData.subject,
          description: supportData.message,
          category: supportData.category,
          priority: supportData.priority,
          type: supportData.type === 'pedidos' ? 'pedido' : 
                supportData.type === 'reclamacoes' ? 'reclamacao' : 
                'venda'
        })
      });
      
      toast.dismiss();
      const json = await res.json();
      
      if (json.ok || json.ticket) {
        toast.success(`Pedido criado com sucesso! Código: ${json.ticket?.tracking_code || 'N/A'}`);
        fetchTickets();
      } else {
        throw new Error(json.error || 'Erro ao criar pedido');
      }
    } catch (err: any) {
      toast.dismiss();
      console.error('[APP] Support submission failed:', err);
      toast.error(err.message || 'Erro ao criar pedido de suporte.');
      
      // Fallback for demo
      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        toast.info('Modo Demo: O pedido seria enviado para o suporte em produção.');
        setIsSupportOpen(false);
      }
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
    
    const matchesArea = t.type === activeArea;
    
    if (!matchesArea) return false;

    if (filter === 'Todos') return matchesSearch;
    if (filter === 'Em aberto') return matchesSearch && ['novo', 'nova', 'novo lead'].includes(t.status.toLowerCase());
    if (filter === 'Em análise') return matchesSearch && ['em análise', 'em investigação', 'contactado'].includes(t.status.toLowerCase());
    if (filter === 'Resolvidos') return matchesSearch && ['concluído', 'resolvida', 'fechado ganho'].includes(t.status.toLowerCase());
    
    return matchesSearch && t.status === filter;
  });

  const areaFilters = ['Todos', 'Em aberto', 'Em análise', 'Resolvidos', ...AREA_CONFIG[activeArea].statuses];

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
    return <LoadingState message="A carregar os seus pedidos..." className="h-[calc(100vh-10rem)]" />;
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
        <ErrorState message={error} />
        <button 
          onClick={fetchTickets}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hub Area Selector */}
      <div className="grid grid-cols-3 gap-3 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        {(Object.keys(AREA_CONFIG) as HubArea[]).map((area) => {
          const config = AREA_CONFIG[area as HubArea];
          const Icon = area === 'pedidos' ? ClipboardList : area === 'reclamacoes' ? AlertCircle : TrendingUp;
          const isActive = activeArea === area;
          
          return (
            <button
              key={area}
              onClick={() => handleAreaChange(area as HubArea)}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all",
                isActive 
                  ? `bg-white ${config.textMain} shadow-sm border border-slate-200` 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{config.label}</span>
              <span className="sm:hidden">{config.label.charAt(0)}</span>
              <div className={cn(
                "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black",
                isActive ? `${config.bgLight} ${config.textMain}` : "bg-slate-200 text-slate-500"
              )}>
                {tickets.filter(t => t.type === area).length}
              </div>
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            Hub de {AREA_CONFIG[activeArea].label}
          </h1>
          <p className="text-slate-500">
            {activeArea === 'pedidos' && "Gestão de solicitações e ordens de serviço."}
            {activeArea === 'reclamacoes' && "Tratamento de incidências e satisfação de cliente."}
            {activeArea === 'vendas' && "Pipeline comercial e gestão de leads."}
          </p>
        </div>
        <button 
          onClick={() => setIsSupportOpen(true)}
          className={cn(
            "w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all text-white",
            AREA_CONFIG[activeArea].bgMain,
            AREA_CONFIG[activeArea].bgHover,
            AREA_CONFIG[activeArea].shadowMain
          )}
        >
          <Plus className="w-4 h-4" /> Novo {AREA_CONFIG[activeArea].label.slice(0, -1)}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Pesquisar em ${AREA_CONFIG[activeArea].label.toLowerCase()}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {areaFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  filter === f 
                    ? `${AREA_CONFIG[activeArea].bgMain} text-white shadow-lg ${AREA_CONFIG[activeArea].shadowMain}` 
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
              <div className={cn(
                "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center",
                AREA_CONFIG[activeArea].bgLight,
                AREA_CONFIG[activeArea].textMain
              )}>
                {activeArea === 'pedidos' ? <ClipboardList className="w-8 h-8" /> :
                 activeArea === 'reclamacoes' ? <AlertCircle className="w-8 h-8" /> :
                 <TrendingUp className="w-8 h-8" />}
              </div>
              <p className="text-slate-500 font-medium">Nenhum registo encontrado em {AREA_CONFIG[activeArea].label}.</p>
              <p className="text-slate-400 text-sm">Tente ajustar os filtros ou criar um novo registo.</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Código</th>
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
                      req.priority?.toLowerCase() === 'urgente' ? "bg-red-50/30" : ""
                    )}
                    onClick={() => setSelectedId(req.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900">{req.tracking_code}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{req.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate">{req.subject}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          ['novo', 'nova', 'novo lead'].includes(req.status.toLowerCase()) ? "bg-blue-500" :
                          ['concluído', 'resolvida', 'fechado ganho'].includes(req.status.toLowerCase()) ? "bg-emerald-500" :
                          ['cancelado', 'encerrada', 'fechado perdido'].includes(req.status.toLowerCase()) ? "bg-slate-400" :
                          "bg-orange-500"
                        )}></div>
                        <span className="font-bold text-slate-700 capitalize">{req.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        req.priority?.toLowerCase() === 'urgente' ? "bg-red-600 text-white" :
                        req.priority?.toLowerCase() === 'alta' ? "bg-red-100 text-red-600" :
                        req.priority?.toLowerCase() === 'média' ? "bg-orange-100 text-orange-600" :
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
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Atual</p>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => handleUpdateStatus(selectedRequest.id, e.target.value)}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl border font-bold text-xs transition-all outline-none",
                        ['novo', 'nova', 'novo lead'].includes(selectedRequest.status.toLowerCase()) ? "bg-blue-50 border-blue-200 text-blue-600" :
                        ['concluído', 'resolvida', 'fechado ganho'].includes(selectedRequest.status.toLowerCase()) ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                        "bg-orange-50 border-orange-200 text-orange-600"
                      )}
                    >
                      {AREA_CONFIG[selectedRequest.type].statuses.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[150px] space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prioridade</p>
                    <div className={cn(
                      "px-4 py-2 rounded-xl border flex items-center gap-2 h-[38px]",
                      selectedRequest.priority?.toLowerCase() === 'urgente' ? "bg-red-50 border-red-200 text-red-600" : 
                      selectedRequest.priority?.toLowerCase() === 'alta' ? "bg-red-50 border-red-100 text-red-500" : 
                      "bg-slate-50 border-slate-100 text-slate-600"
                    )}>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold capitalize">{selectedRequest.priority}</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">Análise Inteligente</h3>
                      </div>
                      <button 
                        onClick={() => analyzeWithAI(selectedRequest.id)}
                        disabled={analyzing}
                        className={cn(
                          "px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2",
                          analyzing && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        {analyzing ? 'A analisar...' : 'Analisar com IA'}
                      </button>
                    </div>

                    {analysis ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Resumo</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{analysis?.summary}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Causa Provável</p>
                            <p className="text-xs text-slate-300">{analysis?.probable_cause}</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Sentimento</p>
                            <p className="text-xs text-slate-300 capitalize">{analysis?.sentiment}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Solução Sugerida</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{analysis?.suggested_solution}</p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Próximos Passos</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Array.isArray(analysis?.next_steps) ? analysis?.next_steps.map((step: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] text-emerald-100 border border-white/5">
                                {step}
                              </span>
                            )) : <p className="text-xs text-emerald-100">{analysis?.next_steps}</p>}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Clica no botão para obter uma análise detalhada deste ticket utilizando Inteligência Artificial.
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Área Operacional</p>
                    <p className="text-sm font-bold text-slate-900 capitalize">{AREA_CONFIG[selectedRequest.type].label}</p>
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
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Adicione uma nota interna..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary min-h-[100px] transition-all"
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={() => {
                        toast.info('Funcionalidade de notas internas em desenvolvimento.');
                      }}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
                    >
                      Guardar Notas
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={() => handleUpdateStatus(selectedRequest.id, 
                    selectedRequest.type === 'pedidos' ? 'concluído' : 
                    selectedRequest.type === 'reclamacoes' ? 'resolvida' : 
                    'fechado ganho'
                  )}
                  className={cn(
                    "flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-lg transition-all",
                    AREA_CONFIG[selectedRequest.type].bgMain,
                    AREA_CONFIG[selectedRequest.type].bgHover,
                    AREA_CONFIG[selectedRequest.type].shadowMain
                  )}
                >
                  {selectedRequest.type === 'pedidos' ? 'Concluir Pedido' : 
                   selectedRequest.type === 'reclamacoes' ? 'Resolver Reclamação' : 
                   'Fechar Venda (Ganho)'}
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedRequest.id, 
                    selectedRequest.type === 'pedidos' ? 'cancelado' : 
                    selectedRequest.type === 'reclamacoes' ? 'encerrada' : 
                    'fechado perdido'
                  )}
                  className="px-4 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition-all"
                >
                  {selectedRequest.type === 'pedidos' ? 'Cancelar' : 
                   selectedRequest.type === 'reclamacoes' ? 'Encerrar' : 
                   'Fechar (Perdido)'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)}
        onSubmit={handleSupportSubmit}
        initialType={activeArea}
      />
    </div>
  );
}
