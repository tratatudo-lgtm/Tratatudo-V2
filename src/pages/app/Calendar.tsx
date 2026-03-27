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
import { apiFetch, apiPost } from '../../lib/api';
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
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'reuniao',
    status: 'confirmado',
    start_at: '',
    end_at: '',
    location: '',
    notes: ''
  });

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

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      event_type: 'reuniao',
      status: 'confirmado',
      start_at: '',
      end_at: '',
      location: '',
      notes: ''
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEvent.title || !newEvent.start_at) {
      toast.error('Título e data de início são obrigatórios');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...newEvent,
        end_at: newEvent.end_at || newEvent.start_at
      };

      const res = await apiPost('/api/client/calendar-events', payload);

      if ((res as any)?.ok) {
        toast.success('Evento criado com sucesso');
        setIsCreating(false);
        resetNewEvent();
        fetchEvents();
      } else {
        toast.error((res as any)?.error || 'Erro ao criar evento');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar evento');
    } finally {
      setSaving(false);
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
            onClick={() => setIsCreating(true)} 
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
            onClick: () => setIsCreating(true)
          } : undefined}
        />
      )}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Novo Evento</h3>
                <p className="text-sm text-slate-500">Cria um novo evento na agenda.</p>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  resetNewEvent();
                }}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Título do evento"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                >
                  <option value="reuniao">Reunião</option>
                  <option value="chamada">Chamada</option>
                  <option value="visita">Visita</option>
                  <option value="outro">Outro</option>
                </select>
                <input
                  type="datetime-local"
                  value={newEvent.start_at}
                  onChange={(e) => setNewEvent({ ...newEvent, start_at: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
                <input
                  type="datetime-local"
                  value={newEvent.end_at}
                  onChange={(e) => setNewEvent({ ...newEvent, end_at: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
                <input
                  type="text"
                  placeholder="Localização"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none md:col-span-2"
                />
                <textarea
                  placeholder="Descrição"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none md:col-span-2"
                />
                <textarea
                  placeholder="Notas"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none md:col-span-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetNewEvent();
                  }}
                  className="px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-70"
                >
                  {saving ? 'A guardar...' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
