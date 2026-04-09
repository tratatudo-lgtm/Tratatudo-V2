import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Calendar,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Automation } from '../../types/hub';
import { apiFetch, apiPost } from '../../lib/api';
import { StatCard } from '../../components/app/StatCard';
import { SearchInput } from '../../components/app/SearchInput';
import { FilterDropdown } from '../../components/app/FilterDropdown';
import { ActionButton } from '../../components/app/ActionButton';
import { DataTable } from '../../components/app/DataTable';
import { EmptyState } from '../../components/app/EmptyState';
import { StatusBadge } from '../../components/app/StatusBadge';

const Automations: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [triggerFilter, setTriggerFilter] = useState('todos');
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    template_key: 'ticket_auto_assign',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/client/automations');
      const data = await res.json();
      if (data.ok) {
        setAutomations(data.automations);
      } else {
        toast.error('Erro ao carregar automações');
      }
    } catch (error) {
      toast.error('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const resetNewAutomation = () => {
    setNewAutomation({
      template_key: 'ticket_auto_assign',
      name: '',
      description: ''
    });
  };

  const getTemplateDefaults = (templateKey: string) => {
    if (templateKey === 'urgent_escalation') {
      return {
        name: 'Escalação Automática de Urgência',
        description: 'Escala automaticamente tickets com prioridade alta ou urgente.'
      };
    }

    if (templateKey === 'stale_followup') {
      return {
        name: 'Follow-up por Falta de Resposta',
        description: 'Assinala tickets parados e prepara escalação interna.'
      };
    }

    return {
      name: 'Encaminhamento Inteligente por Categoria',
      description: 'Atribui automaticamente novos tickets com base na categoria e prioridade.'
    };
  };

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const defaults = getTemplateDefaults(newAutomation.template_key);

      const payload = {
        template_key: newAutomation.template_key,
        name: newAutomation.name || defaults.name,
        description: newAutomation.description || defaults.description
      };

      const res = await apiPost('/api/client/automations', payload);

      if ((res as any)?.ok) {
        toast.success('Automação criada com sucesso');
        setIsCreating(false);
        resetNewAutomation();
        fetchAutomations();
      } else {
        toast.error((res as any)?.error || 'Erro ao criar automação');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar automação');
    } finally {
      setSaving(false);
    }
  };

  const filteredAutomations = automations.filter(auto => {
    const matchesSearch = auto.name.toLowerCase().includes(search.toLowerCase()) ||
                         (auto.description?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'todos' || auto.status === statusFilter;
    const matchesTrigger = triggerFilter === 'todos' || auto.trigger_type === triggerFilter;
    return matchesSearch && matchesStatus && matchesTrigger;
  });

  const stats = {
    total: automations.length,
    active: automations.filter(a => a.status === 'ativa').length,
    paused: automations.filter(a => a.status === 'pausada').length,
    failed: automations.filter(a => a.status === 'falha').length,
  };

  const columns = [
    {
      header: 'Automação',
      accessor: (auto: Automation) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${auto.status === 'ativa' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{auto.name}</span>
            <span className="text-xs text-slate-500 truncate max-w-xs">{auto.description || 'Sem descrição'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Gatilho / Ação',
      accessor: (auto: Automation) => (
        <div className="flex flex-col">
          <span className="text-sm text-slate-700 capitalize">Trigger: {auto.trigger_type.replace('_', ' ')}</span>
          <span className="text-xs text-slate-500 capitalize">Ação: {auto.action_type.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      header: 'Execuções',
      accessor: (auto: Automation) => (
        <div className="flex flex-col">
          <span className="text-xs text-slate-600">Última: {auto.last_run_at ? new Date(auto.last_run_at).toLocaleString('pt-PT') : 'Nunca'}</span>
          <span className="text-xs text-slate-500">Próxima: {auto.next_run_at ? new Date(auto.next_run_at).toLocaleString('pt-PT') : 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (auto: Automation) => (
        <div className="flex items-center gap-2">
          {auto.status === 'ativa' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {auto.status === 'pausada' && <Pause className="w-4 h-4 text-amber-500" />}
          {auto.status === 'falha' && <AlertCircle className="w-4 h-4 text-red-500" />}
          <StatusBadge status={auto.status} />
        </div>
      ),
    },
    {
      header: '',
      accessor: (auto: Automation) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toast.info(`A configurar automação: ${auto.name}`);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right w-20',
    },
  ];

  const triggerTypes = Array.from(new Set(automations.map(a => a.trigger_type)));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automações</h1>
          <p className="text-slate-500">Automatiza os teus fluxos de trabalho e poupa tempo.</p>
        </div>
        <ActionButton 
          label="Nova Automação" 
          icon={Plus} 
          onClick={() => setIsCreating(true)} 
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Automações" 
          value={stats.total} 
          icon={Zap} 
          color="bg-slate-600" 
        />
        <StatCard 
          label="Ativas" 
          value={stats.active} 
          icon={Play} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="Pausadas" 
          value={stats.paused} 
          icon={Pause} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Com Falha" 
          value={stats.failed} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Pesquisar por nome ou descrição..." 
        />
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <FilterDropdown
            label="Estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              { label: 'Ativa', value: 'ativa' },
              { label: 'Pausada', value: 'pausada' },
              { label: 'Falha', value: 'falha' },
            ]}
          />
          <FilterDropdown
            label="Gatilho"
            value={triggerFilter}
            onChange={setTriggerFilter}
            options={[
              { label: 'Todos', value: 'todos' },
              ...triggerTypes.map(t => ({ label: t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' '), value: t }))
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">A carregar automações...</p>
        </div>
      ) : filteredAutomations.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DataTable 
            columns={columns} 
            data={filteredAutomations} 
            onRowClick={(auto) => toast.info(`A configurar automação: ${auto.name}`)}
          />
        </motion.div>
      ) : (
        <EmptyState
          icon={Zap}
          title="Nenhuma automação encontrada"
          description={search || statusFilter !== 'todos' || triggerFilter !== 'todos' 
            ? "Tenta ajustar os teus filtros de pesquisa." 
            : "Ainda não tens automações configuradas."}
          action={!(search || statusFilter !== 'todos' || triggerFilter !== 'todos') ? {
            label: "Criar Primeira Automação",
            onClick: () => setIsCreating(true)
          } : undefined}
        />
      )}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Nova Automação</h3>
                <p className="text-sm text-slate-500">Escolhe um template pronto para ativar no sistema.</p>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  resetNewAutomation();
                }}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateAutomation} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Template</label>
                <select
                  value={newAutomation.template_key}
                  onChange={(e) => setNewAutomation({ ...newAutomation, template_key: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                >
                  <option value="ticket_auto_assign">Encaminhamento Inteligente por Categoria</option>
                  <option value="urgent_escalation">Escalação Automática de Urgência</option>
                  <option value="stale_followup">Follow-up por Falta de Resposta</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nome da automação</label>
                <input
                  type="text"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                  placeholder="Deixa em branco para usar o nome do template"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Descrição</label>
                <textarea
                  value={newAutomation.description}
                  onChange={(e) => setNewAutomation({ ...newAutomation, description: e.target.value })}
                  rows={3}
                  placeholder="Deixa em branco para usar a descrição do template"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                <strong className="text-slate-900">Canal preferencial:</strong> WhatsApp. O bot continua a criar os tickets, e esta automação trata do encaminhamento, prioridade e seguimento.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetNewAutomation();
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
                  {saving ? 'A guardar...' : 'Criar Automação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automations;
