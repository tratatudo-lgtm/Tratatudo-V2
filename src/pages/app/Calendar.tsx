import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Filter,
  User,
  MoreVertical,
  CalendarDays,
  Video,
  Phone,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { CalendarEvent } from '../../types/hub';
import { apiFetch } from '../../lib/api';
import { StatCard } from '../../components/app/StatCard';
import { StatusBadge } from '../../components/app/StatusBadge';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/client/calendar-events');
      const data = await res.json();
      if (data.ok) {
        setEvents(data.events);
      } else {
        toast.error('Erro ao carregar eventos');
      }
    } catch (error) {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'todos' || event.event_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.start_at) > new Date()).length,
    meetings: events.filter(e => e.event_type === 'reuniao').length,
    calls: events.filter(e => e.event_type === 'chamada').length,
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'reuniao': return <Users className="w-4 h-4 text-blue-500" />;
      case 'chamada': return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'visita': return <MapPin className="w-4 h-4 text-amber-500" />;
      default: return <CalendarIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  const columns = [
    {
      header: 'Evento',
      accessor: (event: CalendarEvent) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            {getEventIcon(event.event_type)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{event.title}</span>
            <span className="text-xs text-slate-500 capitalize">{event.event_type}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Data & Hora',
      accessor: (event: CalendarEvent) => {
        const start = new Date(event.start_at);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">
              {start.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
            </span>
            <span className="text-xs text-slate-500">
              {start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Localização',
      accessor: (event: CalendarEvent) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm truncate max-w-[150px]">{event.location || 'Não definida'}</span>
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessor: (event: CalendarEvent) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <User className="w-3.5 h-3.5" />
          <span className="text-sm">{event.client_profiles?.company_name || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Responsável',
      accessor: (event: CalendarEvent) => (
        <span className="text-sm text-slate-600">{event.client_users?.name || 'Não atribuído'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (event: CalendarEvent) => <StatusBadge status={event.status} />,
    },
    {
      header: '',
      accessor: () => (
        <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
      className: 'text-right w-10',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
          <p className="text-slate-500">Gere os teus compromissos e eventos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button className="p-2 hover:bg-slate-50 text-slate-600 border-r border-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-2 text-sm font-semibold text-slate-700">
              {new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
            </div>
            <button className="p-2 hover:bg-slate-50 text-slate-600 border-l border-slate-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ActionButton 
            label="Novo Evento" 
            icon={Plus} 
            onClick={() => toast.info('Funcionalidade em desenvolvimento')} 
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Eventos" 
          value={stats.total} 
          icon={CalendarDays} 
          color="bg-slate-600" 
        />
        <StatCard 
          label="Próximos Eventos" 
          value={stats.upcoming} 
          icon={Clock} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Reuniões" 
          value={stats.meetings} 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatCard 
          label="Chamadas" 
          value={stats.calls} 
          icon={Phone} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Pesquisar eventos..." 
        />
        <div className="flex items-center gap-4">
          <FilterDropdown
            label="Tipo"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              { label: 'Reunião', value: 'reuniao' },
              { label: 'Chamada', value: 'chamada' },
              { label: 'Visita', value: 'visita' },
              { label: 'Outro', value: 'outro' },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">A carregar agenda...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DataTable 
            columns={columns} 
            data={filteredEvents} 
            onRowClick={(event) => toast.info(`Detalhes do evento: ${event.title}`)}
          />
        </motion.div>
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title="Nenhum evento encontrado"
          description={search || typeFilter !== 'todos' 
            ? "Tenta ajustar os teus filtros de pesquisa." 
            : "Ainda não tens eventos agendados. Começa por marcar o primeiro!"}
          action={!(search || typeFilter !== 'todos') ? {
            label: "Agendar Evento",
            onClick: () => toast.info('Funcionalidade em desenvolvimento')
          } : undefined}
        />
      )}
    </div>
  );
};

export default Calendar;
