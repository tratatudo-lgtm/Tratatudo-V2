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
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  tracking_code: string;
  subject: string;
  description: string;
  status: 'aberto' | 'em análise' | 'pendente' | 'resolvido';
  kind: 'suporte' | 'reclamação' | 'pedido' | 'outros';
  category: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  created_at: string;
  company_name: string;
  phone_e164: string;
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterKind, setFilterKind] = useState<'todos' | 'suporte' | 'outros'>('todos');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets');
      const json = await res.json();
      if (json.ok) {
        setTickets(json.tickets);
      }
    } catch (err) {
      toast.error('Erro ao carregar tickets.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: json.ticket.status } : t));
        toast.success(`Ticket #${json.ticket.tracking_code} atualizado para ${status}.`);
      }
    } catch (err) {
      toast.error('Erro ao atualizar status.');
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-slate-900 mb-4" />
          <p className="text-slate-500 font-medium">A carregar tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum ticket encontrado</h3>
          <p className="text-slate-500">Tente ajustar os seus filtros ou termos de pesquisa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
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
                      onClick={() => updateStatus(ticket.id, 'em análise')}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Marcar em análise"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => updateStatus(ticket.id, 'resolvido')}
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
    </div>
  );
}
