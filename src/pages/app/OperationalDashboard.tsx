import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Mail, 
  Zap,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { DashboardMetrics, RecentActivity } from '../../types/hub';
import { StatCard } from '../../components/app/StatCard';
import { cn } from '../../lib/utils';
import { apiFetch } from '../../lib/api';

const OperationalDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/client/dashboard/operational-metrics');
      const data = await res.json();
      if (data.ok) {
        setMetrics(data.metrics);
      } else {
        setError('Erro ao carregar métricas operacionais');
      }
    } catch (err) {
      setError('Erro de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-lg">A preparar o seu dashboard operacional...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ops! Algo correu mal</h2>
        <p className="text-slate-500 mb-6 max-w-md">{error || 'Não foi possível carregar os dados.'}</p>
        <button 
          onClick={fetchMetrics}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins}m`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays}d`;
    return date.toLocaleDateString('pt-PT');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cliente': return <Users className="w-4 h-4" />;
      case 'tarefa': return <CheckSquare className="w-4 h-4" />;
      case 'evento': return <Calendar className="w-4 h-4" />;
      case 'documento': return <FileText className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'automacao': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'cliente': return 'text-blue-600 bg-blue-50';
      case 'tarefa': return 'text-orange-600 bg-orange-50';
      case 'evento': return 'text-purple-600 bg-purple-50';
      case 'documento': return 'text-emerald-600 bg-emerald-50';
      case 'email': return 'text-indigo-600 bg-indigo-50';
      case 'automacao': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Operacional</h1>
          <p className="text-slate-500">Visão geral em tempo real de todos os módulos do Hub.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <Clock className="w-4 h-4" />
          Atualizado: {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          label="Clientes" 
          value={metrics.total_clients} 
          icon={Users} 
          color="bg-blue-600" 
          trend={{ value: metrics.new_clients_this_week || 0, label: 'esta semana', type: 'up' }}
        />
        <StatCard 
          label="Tarefas" 
          value={metrics.pending_tasks} 
          icon={CheckSquare} 
          color="bg-orange-500" 
          trend={{ value: metrics.completed_tasks_today || 0, label: 'hoje', type: 'up' }}
        />
        <StatCard 
          label="Eventos" 
          value={metrics.upcoming_events} 
          icon={Calendar} 
          color="bg-purple-500" 
          trend={{ value: metrics.events_today || 0, label: 'hoje', type: 'neutral' }}
        />
        <StatCard 
          label="Documentos" 
          value={metrics.total_documents} 
          icon={FileText} 
          color="bg-emerald-500" 
          trend={{ value: metrics.recent_documents || 0, label: 'recentes', type: 'up' }}
        />
        <StatCard 
          label="Emails" 
          value={metrics.total_emails} 
          icon={Mail} 
          color="bg-indigo-500" 
          trend={{ value: metrics.failed_emails || 0, label: 'falhas', type: 'down' }}
        />
        <StatCard 
          label="Automações" 
          value={metrics.active_automations || 0} 
          icon={Zap} 
          color="bg-amber-500" 
          trend={{ value: metrics.total_automations || 0, label: 'total', type: 'neutral' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Atividade Recente</h3>
              </div>
              <span className="text-xs font-medium text-slate-400">Últimas 20 ações</span>
            </div>
            <div className="divide-y divide-slate-50">
              {metrics.recent_activity.length > 0 ? (
                metrics.recent_activity.map((activity, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{formatTime(activity.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Sem atividade registada recentemente.</p>
                </div>
              )}
            </div>
            {metrics.recent_activity.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Ver Histórico Completo
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions / Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Novo Cliente', icon: Users, color: 'bg-blue-600', link: '/app/crm' },
              { label: 'Nova Tarefa', icon: CheckSquare, color: 'bg-orange-500', link: '/app/tasks' },
              { label: 'Enviar Email', icon: Mail, color: 'bg-indigo-500', link: '/app/emails' },
              { label: 'Upload Doc', icon: FileText, color: 'bg-emerald-500', link: '/app/documents' },
            ].map((action, i) => (
              <Link 
                key={i} 
                to={action.link}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group text-center"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg", action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Side Column: Health & Alerts */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Estado do Sistema
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Base de Dados', status: 'online', icon: CheckCircle2 },
                { label: 'WhatsApp API', status: 'online', icon: CheckCircle2 },
                { label: 'Serviço de Email', status: 'online', icon: CheckCircle2 },
                { label: 'Automações', status: metrics.failed_automations > 0 ? 'warning' : 'online', icon: metrics.failed_automations > 0 ? AlertCircle : CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      item.status === 'online' ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {item.status === 'online' ? 'Operacional' : 'Atenção'}
                    </span>
                    <item.icon className={cn("w-4 h-4", item.status === 'online' ? "text-emerald-500" : "text-amber-500")} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Tip */}
          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold">Dica de Produtividade</h3>
              </div>
              <p className="text-sm text-blue-50 leading-relaxed mb-4">
                Sabias que podes automatizar o envio de faturas? Configura uma automação para enviar emails automáticos assim que um documento financeiro for criado.
              </p>
              <Link 
                to="/app/automations" 
                className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                Explorar Automações
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Pending Tasks Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-orange-500" />
              Tarefas Pendentes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total Pendentes</span>
                <span className="font-bold text-slate-900">{metrics.pending_tasks}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, ((metrics.completed_tasks_today || 0) / (metrics.pending_tasks || 1)) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                {metrics.completed_tasks_today || 0} concluídas hoje de um total de {metrics.pending_tasks + (metrics.completed_tasks_today || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalDashboard;
