import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  MoreVertical,
  CheckSquare,
  ListTodo,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Task } from '../../types/hub';
import { StatCard } from '../../components/app/StatCard';
import { StatusBadge } from '../../components/app/StatusBadge';
import { PriorityBadge } from '../../components/app/PriorityBadge';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todos');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/client/tasks');
      const data = await res.json();
      if (data.ok) {
        setTasks(data.tasks);
      } else {
        toast.error('Erro ao carregar tarefas');
      }
    } catch (error) {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                         task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'todos' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pendente').length,
    inProgress: tasks.filter(t => t.status === 'em_progresso').length,
    completed: tasks.filter(t => t.status === 'concluída').length,
  };

  const columns = [
    {
      header: 'Tarefa',
      accessor: (task: Task) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{task.title}</span>
          {task.client_profiles && (
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3" />
              {task.client_profiles.company_name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Prioridade',
      accessor: (task: Task) => <PriorityBadge priority={task.priority} />,
    },
    {
      header: 'Status',
      accessor: (task: Task) => <StatusBadge status={task.status} />,
    },
    {
      header: 'Responsável',
      accessor: (task: Task) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
            {task.client_users?.name?.charAt(0) || '?'}
          </div>
          <span className="text-sm text-slate-600">{task.client_users?.name || 'Não atribuído'}</span>
        </div>
      ),
    },
    {
      header: 'Prazo',
      accessor: (task: Task) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar className="w-3.5 h-3.5" />
          <span>{task.due_at ? new Date(task.due_at).toLocaleDateString('pt-PT') : 'Sem prazo'}</span>
        </div>
      ),
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
          <h1 className="text-2xl font-bold text-slate-900">Tarefas</h1>
          <p className="text-slate-500">Gere as tuas atividades e da tua equipa.</p>
        </div>
        <ActionButton 
          label="Nova Tarefa" 
          icon={Plus} 
          onClick={() => toast.info('Funcionalidade em desenvolvimento')} 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Tarefas" 
          value={stats.total} 
          icon={ListTodo} 
          color="bg-slate-600" 
        />
        <StatCard 
          label="Pendentes" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Em Progresso" 
          value={stats.inProgress} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Concluídas" 
          value={stats.completed} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Pesquisar tarefas..." 
        />
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              { label: 'Pendente', value: 'pendente' },
              { label: 'Em Progresso', value: 'em_progresso' },
              { label: 'Concluída', value: 'concluída' },
              { label: 'Cancelada', value: 'cancelada' },
            ]}
          />
          <FilterDropdown
            label="Prioridade"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { label: 'Todas', value: 'todos' },
              { label: 'Baixa', value: 'baixa' },
              { label: 'Média', value: 'média' },
              { label: 'Alta', value: 'alta' },
              { label: 'Urgente', value: 'urgente' },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">A carregar tarefas...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DataTable 
            columns={columns} 
            data={filteredTasks} 
            onRowClick={(task) => toast.info(`Detalhes da tarefa: ${task.title}`)}
          />
        </motion.div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="Nenhuma tarefa encontrada"
          description={search || statusFilter !== 'todos' || priorityFilter !== 'todos' 
            ? "Tenta ajustar os teus filtros de pesquisa." 
            : "Ainda não tens tarefas criadas. Começa por criar a primeira!"}
          action={!(search || statusFilter !== 'todos' || priorityFilter !== 'todos') ? {
            label: "Criar Tarefa",
            onClick: () => toast.info('Funcionalidade em desenvolvimento')
          } : undefined}
        />
      )}
    </div>
  );
};

export default Tasks;
