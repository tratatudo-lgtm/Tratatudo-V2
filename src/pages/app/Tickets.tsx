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

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  urgent: number;
}

const Tickets: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [tickets, setTickets] = useState<HubTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  useEffect(() => {
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (priorityFilter !== 'all') queryParams.append('priority', priorityFilter);
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (search) queryParams.append('search', search);

      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`/api/client/tickets?${queryParams.toString()}`, { credentials: 'include' }),
        fetch('/api/client/tickets/stats', { credentials: 'include' })
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
  }, [statusFilter, priorityFilter, categoryFilter, search]);

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
          onClick={() => toast.info('Funcionalidade de criação em breve')}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          label="Total" 
          value={stats?.total || 0} 
          icon={Ticket}
          color="bg-slate-600"
        />
        <StatCard 
          label="Abertos" 
          value={stats?.open || 0} 
          icon={AlertCircle}
          color="bg-blue-600"
        />
        <StatCard 
          label="Em Tratamento" 
          value={stats?.in_progress || 0} 
          icon={Clock}
          color="bg-amber-600"
        />
        <StatCard 
          label="Concluídos" 
          value={stats?.completed || 0} 
          icon={CheckCircle2}
          color="bg-emerald-600"
        />
        <StatCard 
          label="Urgentes" 
          value={stats?.urgent || 0} 
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
              label="Categoria"
              value={categoryFilter}
              options={[
                { label: 'Todas', value: 'all' },
                { label: 'Pedidos', value: 'pedidos' },
                { label: 'Reclamações', value: 'reclamacoes' },
                { label: 'Vendas', value: 'vendas' },
                { label: 'Suporte', value: 'suporte' }
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
    </div>
  );
};

export default Tickets;
