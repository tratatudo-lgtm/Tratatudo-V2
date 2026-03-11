import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  ClipboardList, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bot,
  ShieldCheck,
  Zap,
  Activity,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, extractArrayResponse, extractObjectResponse } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { LoadingState, ErrorState } from '../../components/States';

interface DashboardData {
  stats: {
    messages?: number;
    totalMessages?: number;
    totalTickets?: number;
    openTickets?: number;
    complaints?: number;
    inProgressTickets?: number;
    resolvedTickets?: number;
  };
  instance: {
    name: string;
    type: string;
    status: string;
  } | null;
  subscription: {
    status: string;
    trial_end: string;
  } | null;
  activity: Array<{
    type: 'ticket' | 'message';
    title: string;
    status: string;
    created_at: string;
  }>;
}

const shortcuts = [
  { name: 'Ver Mensagens', href: '/app/mensagens', icon: MessageSquare, color: 'bg-blue-500' },
  { name: 'Ver Pedidos', href: '/app/pedidos', icon: ClipboardList, color: 'bg-orange-500' },
  { name: 'Ver Instância', href: '/app/instancia', icon: Smartphone, color: 'bg-green-500' },
  { name: 'Ver Subscrição', href: '/app/subscricao', icon: CreditCard, color: 'bg-purple-500' },
];

export function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Try both possible endpoints
      const endpoints = [
        `${import.meta.env.VITE_API_URL}/api/client/dashboard/stats`,
        `${import.meta.env.VITE_API_URL}/api/dashboard/stats`
      ];
      
      let lastError = null;
      
      for (const url of endpoints) {
        try {
          console.log(`[APP] Fetching dashboard stats: ${url}`);
          const response = await fetch(url, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`[APP] Dashboard data received from ${url}:`, result);
            
            // Map the response to our interface
            const mappedData: DashboardData = {
              stats: result.stats || {},
              instance: extractObjectResponse(result, 'instance'),
              subscription: extractObjectResponse(result, 'subscription'),
              activity: extractArrayResponse(result, 'activity')
            };
            
            setData(mappedData);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.error(`[APP] Fetch dashboard failed for ${url}:`, err);
          lastError = err;
        }
      }
      
      setError(lastError?.message || 'Falha ao carregar dados do painel');
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingState message="A carregar o seu painel..." className="h-[60vh]" />;
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ErrorState message={error} />
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const stats = [
    { 
      name: 'Total de Mensagens', 
      value: (data?.stats?.totalMessages ?? data?.stats?.messages ?? 0).toLocaleString() || '0', 
      change: '+0%', 
      trend: 'neutral', 
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      name: 'Pedidos em Aberto', 
      value: (data?.stats?.openTickets ?? 0).toString() || '0', 
      change: '0%', 
      trend: 'neutral', 
      icon: ClipboardList,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      name: 'Reclamações', 
      value: (data?.stats?.complaints ?? 0).toString() || '0', 
      change: '0%', 
      trend: 'neutral', 
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    { 
      name: 'Estado da Instância', 
      value: data?.instance?.status === 'online' ? 'Online' : 'Offline', 
      status: data?.instance?.status === 'online' ? 'success' : 'error',
      icon: Smartphone,
      color: data?.instance?.status === 'online' ? 'text-green-600' : 'text-slate-600',
      bg: data?.instance?.status === 'online' ? 'bg-green-50' : 'bg-slate-50'
    },
    { 
      name: 'Subscrição', 
      value: data?.subscription?.status === 'active' ? 'Ativa' : 'Inativa', 
      status: data?.subscription?.status === 'active' ? 'info' : 'warning',
      icon: CreditCard,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
      return date.toLocaleDateString('pt-PT');
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Painel de Controlo</h1>
          <p className="text-slate-500">Bem-vindo de volta. Aqui está o resumo da sua operação.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Clock className="w-4 h-4" />
          Última atualização: {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">{stat.name}</p>
              <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity & Shortcuts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900">Atividade Recente</h3>
              </div>
              <button className="text-xs text-primary font-bold hover:underline">Ver histórico completo</button>
            </div>
            <div className="divide-y divide-slate-50">
              {data?.activity.map((item, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={cn(
                    "p-2 rounded-lg bg-slate-50",
                    item.type === 'ticket' ? "text-orange-500" : "text-blue-500"
                  )}>
                    {item.type === 'ticket' ? <ClipboardList className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {item.type === 'ticket' ? 'Pedido: ' : 'Mensagem: '}
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">Estado: {item.status}</p>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                    {formatTime(item.created_at)}
                  </div>
                </div>
              ))}
              {data?.activity.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Nenhuma atividade recente encontrada.
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {shortcuts.map((shortcut, i) => (
              <Link
                key={i}
                to={shortcut.href}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group text-center"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-slate-200",
                  shortcut.color
                )}>
                  <shortcut.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
                  {shortcut.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Summaries */}
        <div className="space-y-6">
          {/* Instance Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Resumo da Instância</h3>
              <Link to="/app/instancia" className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md",
                  data?.instance?.status === 'online' ? "bg-green-500" : "bg-slate-400"
                )}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{data?.instance?.name || 'Sem Instância'}</p>
                  <p className="text-[10px] text-slate-500">{user?.phone_e164}</p>
                </div>
              </div>

              <div className="space-y-3 px-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Estado da Ligação</span>
                  <span className={cn(
                    "flex items-center gap-1.5 font-bold",
                    data?.instance?.status === 'online' ? "text-green-600" : "text-red-600"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      data?.instance?.status === 'online' ? "bg-green-500 animate-pulse" : "bg-red-500"
                    )}></div>
                    {data?.instance?.status === 'online' ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Tipo de Instância</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 capitalize">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    {data?.instance?.type || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Uptime (30 dias)</span>
                  <span className="font-bold text-slate-900">{data?.instance?.status === 'online' ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Summary */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-bold">Subscrição</h3>
              <Zap className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Plano Atual</p>
                <p className="text-xl font-display font-bold">
                  {data?.subscription?.plan || 'Sem subscrição ativa'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Estado</p>
                  <span className={cn(
                    "text-xs font-bold flex items-center gap-1",
                    data?.subscription?.status === 'active' ? "text-green-400" : "text-red-400"
                  )}>
                    {data?.subscription?.status === 'active' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Ativa</>
                    ) : (
                      <><AlertCircle className="w-3 h-3" /> Inativa</>
                    )}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Expira em</p>
                  <p className="text-xs font-bold">
                    {data?.subscription?.trial_end 
                      ? new Date(data.subscription.trial_end).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <Link 
                to="/app/subscricao"
                className="block w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-center text-xs font-bold transition-all"
              >
                Gerir Faturação
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
