import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Clock, 
  Calendar, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  LayoutDashboard,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { LoadingState, ErrorState } from '../../components/States';

interface DashboardStats {
  total_clients: number;
  active_clients: number;
  trial_clients: number;
  total_messages_24h: number;
  active_instances: number;
  system_health: number;
  revenue_monthly: number;
  growth_rate: number;
  messages_chart: { date: string; count: number }[];
  clients_chart: { date: string; count: number }[];
}

interface AdminAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface RecentActivity {
  id: string;
  type: 'client_joined' | 'message_spike' | 'instance_error' | 'payment_success';
  title: string;
  description: string;
  timestamp: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const { logout } = useAdminAuth();

  const fetchDashboardData = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch Stats
      const statsRes = await fetch(`${baseUrl}/api/admin/dashboard/stats`, {
        credentials: 'include'
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else if (statsRes.status === 401) {
        await logout();
      } else {
        throw new Error('Falha ao carregar estatísticas do dashboard');
      }

      // Fetch Alerts
      const alertsRes = await fetch(`${baseUrl}/api/admin/alerts`, {
        credentials: 'include'
      });
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(extractArrayResponse<AdminAlert>(alertsData, 'alerts'));
      }

      // Fetch Recent Activity
      // TODO: Backend endpoint /api/admin/activity missing. 
      // This is prepared in UI but requires backend implementation.
      setActivities([]);

    } catch (err: any) {
      console.error('[ADMIN] Dashboard fetch failed:', err);
      setError(err.message || 'Não foi possível carregar os dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !stats) {
    return <LoadingState message="A preparar o seu centro de comando..." className="h-[80vh]" />;
  }

  if (error && !stats) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ErrorState message={error} />
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Clientes', 
      value: stats?.total_clients || 0, 
      trend: '+12%', 
      icon: Users, 
      color: 'blue',
      description: 'Crescimento acumulado'
    },
    { 
      label: 'Mensagens (24h)', 
      value: stats?.total_messages_24h || 0, 
      trend: '+24%', 
      icon: MessageSquare, 
      color: 'emerald',
      description: 'Volume de interações'
    },
    { 
      label: 'Instâncias Ativas', 
      value: stats?.active_instances || 0, 
      trend: 'Estável', 
      icon: Zap, 
      color: 'orange',
      description: 'Conexões em tempo real'
    },
    { 
      label: 'Saúde do Sistema', 
      value: `${stats?.system_health || 100}%`, 
      trend: 'Excelente', 
      icon: Activity, 
      color: 'indigo',
      description: 'Uptime global'
    }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Controlo</h1>
          </div>
          <p className="text-slate-500 font-medium">Monitorização global da infraestrutura TrataTudo</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-sm">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  timeRange === range ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchDashboardData}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110",
              `bg-${stat.color}-600`
            )} />
            
            <div className="flex items-center justify-between mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                stat.color === 'orange' ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
              )}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : null}
                {stat.trend}
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-[10px] font-medium text-slate-400">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Volume de Mensagens</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Atividade global do sistema</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound</span>
              </div>
              <div className="flex items-center gap-1.5 ml-4">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outbound</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.messages_chart || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0F172A" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Column */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Alertas Críticos</h3>
              <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {alerts.length} Ativos
              </span>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-200 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                      alert.type === 'error' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    )}>
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 mb-1 truncate">{alert.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-2">{alert.message}</p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tudo operacional</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
              Ver Todos os Alertas
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-primary p-8 rounded-[3rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <Zap className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black tracking-tight mb-2">Ações Rápidas</h3>
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-6">Gestão de emergência</p>
            
            <div className="space-y-3">
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left px-4 flex items-center justify-between">
                Verificar Instâncias <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left px-4 flex items-center justify-between">
                Logs de Erro <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Atividade Recente</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Últimos eventos do sistema</p>
            </div>
            <Activity className="w-6 h-6 text-slate-200" />
          </div>
          
          <div className="space-y-6">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                  <Clock className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0 border-b border-slate-50 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-slate-900">{activity.title}</p>
                    <span className="text-[10px] font-bold text-slate-400">{activity.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{activity.description}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Activity className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sem atividade recente registada</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">TODO: Backend endpoint /api/admin/activity missing</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health / Distribution */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Distribuição de Clientes</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Segmentação por estado</p>
            </div>
            <Users className="w-6 h-6 text-slate-200" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Ativos', value: stats?.active_clients || 0 },
                    { name: 'Trial', value: stats?.trial_clients || 0 },
                    { name: 'Inativos', value: (stats?.total_clients || 0) - (stats?.active_clients || 0) - (stats?.trial_clients || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#0F172A" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#E2E8F0" />
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-lg font-black text-slate-900">{stats?.active_clients || 0}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativos</p>
            </div>
            <div className="text-center border-x border-slate-50">
              <p className="text-lg font-black text-blue-600">{stats?.trial_clients || 0}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trial</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-400">{(stats?.total_clients || 0) - (stats?.active_clients || 0) - (stats?.trial_clients || 0)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outros</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
