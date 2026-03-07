import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Smartphone, 
  MessageSquare, 
  ClipboardList, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
  Loader2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface AdminDashboardData {
  stats: {
    totalClients: number;
    onlineInstances: number;
    messagesToday: number;
    openTickets: number;
  };
  recentActivity: Array<{
    type: 'client' | 'ticket' | 'instance';
    title: string;
    status: string;
    created_at: string;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    lastBackup: string;
  };
}

interface SystemAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  instance_name?: string;
  message: string;
  created_at: string;
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/alerts')
        ]);

        if (!statsRes.ok) throw new Error('Falha ao carregar dados do painel admin');
        const statsData = await statsRes.json();
        setData(statsData);

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium tracking-tight">A carregar o painel administrativo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Ups! Algo correu mal</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Clientes', 
      value: data?.stats.totalClients || 0, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: '+12%',
      isUp: true
    },
    { 
      label: 'Instâncias Online', 
      value: data?.stats.onlineInstances || 0, 
      icon: Smartphone, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: '98%',
      isUp: true
    },
    { 
      label: 'Mensagens Hoje', 
      value: data?.stats.messagesToday || 0, 
      icon: MessageSquare, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      trend: '+24%',
      isUp: true
    },
    { 
      label: 'Tickets Abertos', 
      value: data?.stats.openTickets || 0, 
      icon: ClipboardList, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      trend: '-5%',
      isUp: false
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-tight uppercase">Alertas Críticos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={cn(
                  "p-4 rounded-2xl border flex items-start gap-4 shadow-sm transition-all",
                  alert.severity === 'high' ? "bg-red-50 border-red-100 text-red-900" : "bg-orange-50 border-orange-100 text-orange-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl shrink-0",
                  alert.severity === 'high' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                )}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold truncate">{alert.message}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 shrink-0">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {alert.instance_name && (
                    <p className="text-xs font-medium opacity-70 mt-1">Instância: {alert.instance_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Global</h1>
          <p className="text-slate-500 font-medium">Visão geral da plataforma TrataTudo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Última atualização: Agora</span>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Relatório Global
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                stat.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Estado do Sistema</h2>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Servidores</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Operacional</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">99.9%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">WhatsApp API</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Conectado</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">12ms</span>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-500">Uptime Global</span>
                  <span className="font-black text-slate-900">{data?.systemHealth.uptime}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[99.8%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Atividade Recente</h2>
              <Link to="/admin/logs" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                Ver todos os logs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {data?.recentActivity.map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                      item.type === 'client' ? "bg-blue-50 text-blue-600" : 
                      item.type === 'ticket' ? "bg-orange-50 text-orange-600" : "bg-purple-50 text-purple-600"
                    )}>
                      {item.type === 'client' ? <Users className="w-6 h-6" /> : 
                       item.type === 'ticket' ? <ClipboardList className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                          item.status === 'online' || item.status === 'resolvido' || item.status === 'novo' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-primary">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
