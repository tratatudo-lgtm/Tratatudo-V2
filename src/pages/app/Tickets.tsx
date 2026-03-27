import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreHorizontal,
  ArrowRight,
  User,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Link, useSearchParams } from 'react-router-dom';
import { HubTicket, AREA_CONFIG } from '../../types/hub';
import { StatCard } from '../../components/app/StatCard';
import { StatusBadge } from '../../components/app/StatusBadge';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';
import { apiFetch, apiPost } from '../../lib/api';

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  urgent: number;
}

const Tickets: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialKind = searchParams.get('kind') || 'all';
  const initialCategory = searchParams.get('category') || 'all';

  const [tickets, setTickets] = useState<HubTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'geral',
    priority: 'média'
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState(initialKind);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  useEffect(() => {
    setKindFilter(initialKind);
    setCategoryFilter(initialCategory);
  }, [initialKind, initialCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (priorityFilter !== 'all') queryParams.append('priority', priorityFilter);
      if (kindFilter !== 'all') queryParams.append('kind', kindFilter);
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (search) queryParams.append('search', search);

      const [ticketsRes, statsRes] = await Promise.all([
        apiFetch(`/api/client/tickets?${queryParams.toString()}`),
        apiFetch('/api/client/tickets/stats')
      ]);

      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();

      if (ticketsData.ok) setTickets(ticketsData.tickets);
      if (statsData.ok) setStats(statsData.stats);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, kindFilter, categoryFilter, search]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600 bg-red-50 border-red-100';
      case 'alta': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'média': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'baixa': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const columns = [
    {
      header: 'Ticket',
      accessor: (ticket: HubTicket) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 line-clamp-1">{ticket.title}</span>
          <span className="text-xs text-slate-500 font-mono uppercase">{ticket.tracking_code}</span>
        </div>
      )
    },
    {
      header: 'Cliente',
      accessor: (ticket: HubTicket) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-3 h-3 text-slate-500" />
          </div>
          <span className="text-sm text-slate-600">{ticket.client_name || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (ticket: HubTicket) => (
        <StatusBadge status={ticket.status} />
      )
    },
    {
      header: 'Prioridade',
      accessor: (ticket: HubTicket) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority}
        </span>
      )
    },
    {
      header: 'Responsável',
      accessor: (ticket: HubTicket) => (
        <span className="text-sm text-slate-600">{ticket.assigned_user_name || 'Não atribuído'}</span>
      )
    },
    {
      header: 'Data',
      accessor: (ticket: HubTicket) => (
        <span className="text-xs text-slate-500">
          {new Date(ticket.created_at).toLocaleDateString('pt-PT')}
        </span>
      )
    },
    {
      header: '',
      accessor: (ticket: HubTicket) => (
        <Link 
          to={`/app/tickets/${ticket.id}`}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600 flex items-center justify-center"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      )
    }
  ];

  const normalizeStatus = (value: any) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const normalizePriority = (value: any) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const computedStats = {
    total: tickets.length,
    open: tickets.filter((t: any) => ['aberto', 'open', 'novo'].includes(normalizeStatus(t.status))).length,
    in_progress: tickets.filter((t: any) => ['em tratamento', 'em analise', 'em análise', 'em execucao', 'em execução', 'in_progress', 'processing'].includes(normalizeStatus(t.status))).length,
    completed: tickets.filter((t: any) => ['concluido', 'concluído', 'resolved', 'done', 'closed'].includes(normalizeStatus(t.status))).length,
    urgent: tickets.filter((t: any) => ['urgente', 'urgent'].includes(normalizePriority(t.priority))).length,
  };

  const resetNewTicket = () => {
    setNewTicket({
      subject: '',
      description: '',
      category: 'geral',
      priority: 'média'
    });
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTicket.subject.trim()) {
      return;
    }

    try {
      setSavingTicket(true);

      const res = await apiPost('/api/client/tickets', {
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority
      });

      if ((res as any)?.ok) {
        setIsCreating(false);
        resetNewTicket();
        await fetchTickets();
      }
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
    } finally {
      setSavingTicket(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Central de Tickets</h1>
          <p className="text-slate-500 text-sm">Gira pedidos, reclamações e suporte num único local.</p>
        </div>
        <ActionButton 
          icon={Plus} 
          label="Novo Ticket" 
          onClick={() => setIsCreating(true)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          label="Total" 
          value={computedStats.total} 
          icon={Ticket}
          color="bg-slate-600"
        />
        <StatCard 
          label="Abertos" 
          value={computedStats.open} 
          icon={AlertCircle}
          color="bg-blue-600"
        />
        <StatCard 
          label="Em Tratamento" 
          value={computedStats.in_progress} 
          icon={Clock}
          color="bg-amber-600"
        />
        <StatCard 
          label="Concluídos" 
          value={computedStats.completed} 
          icon={CheckCircle2}
          color="bg-emerald-600"
        />
        <StatCard 
          label="Urgentes" 
          value={computedStats.urgent} 
          icon={AlertTriangle}
          color="bg-red-600"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput 
              placeholder="Pesquisar por código (TT-XXXXXX) ou título..." 
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterDropdown 
              label="Estado"
              value={statusFilter}
              options={[
                { label: 'Todos', value: 'all' },
                { label: 'Aberto', value: 'aberto' },
                { label: 'Em Análise', value: 'em análise' },
                { label: 'Em Execução', value: 'em execução' },
                { label: 'Concluído', value: 'concluído' },
                { label: 'Cancelado', value: 'cancelado' }
              ]}
              onChange={setStatusFilter}
            />
            <FilterDropdown 
              label="Prioridade"
              value={priorityFilter}
              options={[
                { label: 'Todas', value: 'all' },
                { label: 'Urgente', value: 'urgente' },
                { label: 'Alta', value: 'alta' },
                { label: 'Média', value: 'média' },
                { label: 'Baixa', value: 'baixa' }
              ]}
              onChange={setPriorityFilter}
            />
            <FilterDropdown 
              label="Tipo"
              value={kindFilter}
              options={[
                { label: 'Todos', value: 'all' },
                { label: 'Pedidos', value: 'pedido' },
                { label: 'Reclamações', value: 'reclamação' },
                { label: 'Vendas', value: 'venda' },
                { label: 'Suporte', value: 'suporte' }
              ]}
              onChange={setKindFilter}
            />
            <FilterDropdown 
              label="Categoria"
              value={categoryFilter}
              options={[
                { label: 'Todas', value: 'all' },
                { label: 'Geral', value: 'Geral' },
                { label: 'Iluminação Pública', value: 'Iluminação Pública' },
                { label: 'Outros', value: 'Outros' }
              ]}
              onChange={setCategoryFilter}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 animate-pulse">A carregar tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={tickets} 
          />
        ) : (
          <EmptyState 
            icon={Ticket}
            title="Nenhum ticket encontrado"
            description="Não existem tickets que correspondam aos filtros selecionados."
            action={{
              label: "Limpar Filtros",
              onClick: () => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setSearch('');
              }
            }}
          />
        )}
      </div>
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Novo Ticket</h3>
                <p className="text-sm text-slate-500">Registar novo pedido, reclamação ou suporte.</p>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  resetNewTicket();
                }}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assunto</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Ex: Reclamação - Iluminação pública"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Descrição</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={4}
                  placeholder="Descreva o pedido ou problema"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Categoria</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  >
                    <option value="geral">Geral</option>
                    <option value="iluminacao">Iluminação</option>
                    <option value="agua">Água</option>
                    <option value="limpeza_residuos">Limpeza e Resíduos</option>
                    <option value="documentos">Documentos</option>
                    <option value="vendas">Vendas</option>
                    <option value="suporte">Suporte</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Prioridade</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetNewTicket();
                  }}
                  className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTicket}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70"
                >
                  {savingTicket ? 'A guardar...' : 'Criar Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
