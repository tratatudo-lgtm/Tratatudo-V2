import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  User, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  FileText, 
  Users, 
  Ticket,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { AuditLog, PermissionModule } from '../../types/hub';
import { StatCard } from '../../components/app/StatCard';

import { apiGet } from '../../lib/api';

const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = '/api/client/audit?limit=100';
      if (moduleFilter !== 'all') url += `&module=${moduleFilter}`;
      if (actionFilter !== 'all') url += `&action=${actionFilter}`;
      
      const data = await apiGet(url);
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar logs de atividade');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModuleIcon = (module: PermissionModule) => {
    switch (module) {
      case 'tickets': return <Ticket className="w-4 h-4" />;
      case 'clients': return <Users className="w-4 h-4" />;
      case 'tasks': return <CheckCircle2 className="w-4 h-4" />;
      case 'documents': return <FileText className="w-4 h-4" />;
      case 'whatsapp': return <Zap className="w-4 h-4" />;
      case 'calendar': return <Calendar className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-emerald-600 bg-emerald-50';
      case 'update': return 'text-blue-600 bg-blue-50';
      case 'delete': return 'text-red-600 bg-red-50';
      case 'login': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">A carregar registos de atividade...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Atividade & Auditoria</h1>
          <p className="text-slate-500">Monitorização em tempo real de todas as ações no Hub.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchLogs}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Ações Hoje" 
          value={logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length} 
          icon={Activity} 
          color="bg-blue-600" 
        />
        <StatCard 
          label="Criações" 
          value={logs.filter(l => l.action_type === 'create').length} 
          icon={Zap} 
          color="bg-emerald-600" 
        />
        <StatCard 
          label="Utilizadores Ativos" 
          value={new Set(logs.map(l => l.actor_user_id)).size} 
          icon={Users} 
          color="bg-indigo-600" 
        />
        <StatCard 
          label="Módulo Principal" 
          value={logs.length > 0 ? (
            Object.entries(logs.reduce((acc: any, l) => {
              acc[l.module] = (acc[l.module] || 0) + 1;
              return acc;
            }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'
          ) : 'N/A'} 
          icon={Filter} 
          color="bg-slate-600" 
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por ação ou utilizador..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todos os Módulos</option>
            <option value="tickets">Tickets</option>
            <option value="clients">Clientes</option>
            <option value="tasks">Tarefas</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="documents">Documentos</option>
          </select>
          <select 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Todas as Ações</option>
            <option value="create">Criação</option>
            <option value="update">Atualização</option>
            <option value="delete">Eliminação</option>
            <option value="login">Login</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
              >
                <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", getActionColor(log.action_type))}>
                  {getModuleIcon(log.module)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{log.summary}</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        getActionColor(log.action_type)
                      )}>
                        {log.action_type}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <User size={12} className="text-slate-400" />
                      <span className="font-medium">{log.actor_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-medium uppercase tracking-tighter">{log.module}</span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
              </motion.div>
            ))
          ) : (
            <div className="p-20 text-center">
              <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum registo de atividade encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
