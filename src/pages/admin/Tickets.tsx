import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  ArrowRight,
  MoreVertical,
  Edit2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Ticket {
  id: string;
  client_id: string;
  company_name: string;
  subject: string;
  description: string;
  status: 'aberto' | 'em análise' | 'resolvido' | 'fechado';
  type: 'suporte' | 'financeiro' | 'reclamação' | 'outro';
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  created_at: string;
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/admin/tickets');
        if (!response.ok) throw new Error('Falha ao carregar tickets');
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Falha ao atualizar estado');
      
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    } catch (err) {
      alert('Erro ao atualizar estado do ticket');
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium tracking-tight">A carregar todos os tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Tickets</h1>
          <p className="text-slate-500 font-medium">Controlo centralizado de pedidos de suporte</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all p-8 group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                  ticket.type === 'reclamação' ? "bg-red-500 shadow-red-500/20" : 
                  ticket.type === 'financeiro' ? "bg-blue-500 shadow-blue-500/20" : "bg-primary shadow-primary/20"
                )}>
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{ticket.id.slice(0, 8)}</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                      ticket.priority === 'urgente' ? "bg-red-50 text-red-600" : 
                      ticket.priority === 'alta' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">{ticket.subject}</h3>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                ticket.status === 'aberto' ? "bg-emerald-50 text-emerald-600" : 
                ticket.status === 'em análise' ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"
              )}>
                {ticket.status === 'aberto' ? <AlertCircle className="w-3 h-3" /> : 
                 ticket.status === 'resolvido' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {ticket.status}
              </div>
            </div>

            <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
              {ticket.description}
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{ticket.company_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{new Date(ticket.created_at).toLocaleDateString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data de Abertura</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleUpdateStatus(ticket.id, 'resolvido')}
                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolver
              </button>
              <button 
                onClick={() => handleUpdateStatus(ticket.id, 'em análise')}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                Analisar
              </button>
              <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium tracking-tight">Nenhum ticket encontrado.</p>
        </div>
      )}
    </div>
  );
}
