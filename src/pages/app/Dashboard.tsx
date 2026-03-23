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
  Loader2,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { cn, extractArrayResponse, extractObjectResponse } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { LoadingState, ErrorState } from '../../components/States';
import { apiFetch, apiPost } from '../../lib/api';

interface DashboardData {
  stats: {
    messages?: number;
    totalMessages?: number;
    totalTickets?: number;
    openTickets?: number;
    complaints?: number;
    inProgressTickets?: number;
    resolvedTickets?: number;
    metrics?: {
      total_clients?: number;
      active_clients?: number;
      pending_tasks?: number;
      upcoming_events?: number;
      overdue_financial_documents?: number;
      total_documents?: number;
      total_emails?: number;
      total_automations?: number;
      active_automations?: number;
      failed_automations?: number;
      recent_activity?: any[];
    };
  };
  instance: {
    instance_name: string;
    is_hub: boolean;
    status: string;
  } | null;
  subscription: {
    status: string;
    plan: string;
    ends_at: string;
  } | null;
  activity: Array<{
    type: 'ticket' | 'message';
    title: string;
    status: string;
    created_at: string;
  }>;
  charts?: {
    daily: Array<{ date: string; tickets: number; complaints: number; resolved: number }>;
    statusDistribution: { aberto: number; analise: number; resolvido: number };
    typeDistribution: { pedido: number; reclamação: number; outro: number };
  };
}

const shortcuts = [
  { name: 'Ver Mensagens', href: '/app/messages', icon: MessageSquare, color: 'bg-blue-500' },
  { name: 'Ver Pedidos', href: '/app/tickets', icon: ClipboardList, color: 'bg-orange-500' },
  { name: 'Ver Definições', href: '/app/settings', icon: Smartphone, color: 'bg-green-500' },
  { name: 'Ver Subscrição', href: '/app/subscription', icon: CreditCard, color: 'bg-purple-500' },
];

export function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<{ insights: any[], summary: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchAIInsights = async () => {
    try {
      setLoadingAI(true);
      const data = await apiPost('/api/client/ai/insights', { context: 'dashboard' });
      if (data) {
        setAiInsights(data);
      }
    } catch (err) {
      console.error("[APP] AI Insights failed:", err);
      
      // Fallback for demo
      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        setAiInsights({
          summary: "O seu assistente de IA está a analisar o desempenho da sua conta.",
          insights: [
            { id: '1', type: 'opportunity', title: 'Aumento de Conversão', description: 'O bot está a converter 15% mais leads do que na semana passada.' },
            { id: '2', type: 'alert', title: 'Pico de Tráfego', description: 'Detetado um aumento de 30% nas mensagens entre as 18h e as 20h.' }
          ]
        });
      }
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try primary endpoint
        const response = await apiFetch('/api/client/dashboard/stats');
        const result = await response.json();
        
        if (result.ok) {
          // Map the response to our interface
          const mappedData: DashboardData = {
            stats: result.stats || {},
            instance: extractObjectResponse(result, 'instance'),
            subscription: extractObjectResponse(result, 'subscription'),
            activity: extractArrayResponse(result, 'activity')
          };
          
            try {
              const metricsRes = await apiFetch("/api/client/dashboard/operational-metrics");
              if (metricsRes.ok) {
                const metricsJson = await metricsRes.json();
                mappedData.metrics = metricsJson.metrics || {};
                if (Array.isArray(metricsJson?.metrics?.recent_activity)) {
                  mappedData.activity = metricsJson.metrics.recent_activity;
                }
              }
            } catch (e) {
              console.error("[APP] Failed to fetch operational metrics:", e);
            }

          // Fetch chart data
          try {
            const chartRes = await apiFetch('/api/client/dashboard/charts');
            if (chartRes.ok) {
              const chartData = await chartRes.json();
              mappedData.charts = chartData;
            }
          } catch (e) {
            console.error("[APP] Failed to fetch chart data:", e);
          }

          setData(mappedData);
          setLoading(false);
          fetchAIInsights();
        } else {
          throw new Error(result.error || 'Falha ao carregar dados do painel');
        }
        
      } catch (err: any) {
        console.error('[APP] Dashboard fetch failed:', err);
        setError(err.message || 'Não foi possível carregar os dados do painel.');
        
        // Professional fallback for demo/development
        if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
          console.log('[APP] Using fallback dashboard data');
          setData({
            stats: {
              totalMessages: 1250,
              openTickets: 3,
              resolvedTickets: 45
            },
            instance: {
              instance_name: 'TrataTudo-WhatsApp-01',
              is_hub: true,
              status: 'connected'
            },
            subscription: {
              status: 'active',
              plan: 'Pro',
              ends_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
            },
            activity: [
              { type: 'ticket', title: 'Novo pedido de suporte', status: 'open', created_at: new Date().toISOString() },
              { type: 'message', title: 'Mensagem recebida de cliente', status: 'delivered', created_at: new Date().toISOString() }
            ],
            charts: {
              daily: [
                { date: '2024-03-15', tickets: 5, complaints: 2, resolved: 4 },
                { date: '2024-03-16', tickets: 8, complaints: 1, resolved: 6 },
                { date: '2024-03-17', tickets: 12, complaints: 3, resolved: 8 }
              ],
              statusDistribution: { aberto: 10, analise: 5, resolvido: 35 },
              typeDistribution: { pedido: 25, reclamação: 15, outro: 10 }
            }
          });
          setError(null);
          fetchAIInsights();
        }
      } finally {
        setLoading(false);
      }
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
      name: 'Total de Clientes',
      value: (data?.metrics?.total_clients ?? 0).toString(),
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Clientes Ativos',
      value: (data?.metrics?.active_clients ?? 0).toString(),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      name: 'Tarefas Pendentes',
      value: (data?.metrics?.pending_tasks ?? 0).toString(),
      icon: ClipboardList,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      name: 'Eventos Próximos',
      value: (data?.metrics?.upcoming_events ?? 0).toString(),
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      name: 'Faturas em Atraso',
      value: (data?.metrics?.overdue_financial_documents ?? 0).toString(),
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
  ];

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
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

      {/* AI Insights Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assistente de IA TrataTudo</h2>
                <p className="text-slate-400 text-sm">Insights inteligentes sobre a sua operação em tempo real.</p>
              </div>
            </div>
            <button 
              onClick={fetchAIInsights}
              disabled={loadingAI}
              className={cn(
                "px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2",
                loadingAI && "opacity-50 cursor-not-allowed"
              )}
            >
              {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loadingAI ? 'A analisar...' : 'Atualizar Insights'}
            </button>
          </div>

          {aiInsights ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiInsights.insights?.map((insight: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-5 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02]",
                    insight.type === 'warning' ? "bg-orange-500/10 border-orange-500/20" :
                    insight.type === 'error' ? "bg-red-500/10 border-red-500/20" :
                    insight.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20" :
                    "bg-white/5 border-white/10"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      insight.type === 'warning' ? "bg-orange-500" :
                      insight.type === 'error' ? "bg-red-500" :
                      insight.type === 'success' ? "bg-emerald-500" :
                      "bg-primary"
                    )}></div>
                    <h4 className="font-bold text-sm">{insight.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
                </motion.div>
              ))}
              <div className="md:col-span-3 mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <p className="text-sm text-slate-300 italic">"{aiInsights.summary}"</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
              <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
              <p className="text-slate-400 text-sm">Clica em "Atualizar Insights" para gerar uma análise da tua operação.</p>
            </div>
          )}
        </div>
      </motion.div>

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Evolution Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900">Evolução de Pedidos</h3>
            </div>
            <select className="text-xs bg-slate-50 border-none rounded-lg px-2 py-1 outline-none font-bold text-slate-500">
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.daily || []}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}}
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tickets" 
                  name="Pedidos"
                  stroke="#4285F4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTickets)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="complaints" 
                  name="Reclamações"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900 text-sm">Estado dos Tickets</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Aberto', value: data?.charts?.statusDistribution.aberto || 0 },
                      { name: 'Análise', value: data?.charts?.statusDistribution.analise || 0 },
                      { name: 'Resolvido', value: data?.charts?.statusDistribution.resolvido || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#f97316" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-[10px] font-bold text-slate-500">Aberto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-bold text-slate-500">Análise</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-bold text-slate-500">Resolvido</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900 text-sm">Tipos de Pedido</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Pedidos', value: data?.charts?.typeDistribution.pedido || 0 },
                  { name: 'Reclamações', value: data?.charts?.typeDistribution.reclamação || 0 },
                  { name: 'Outros', value: data?.charts?.typeDistribution.outro || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#4285F4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
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
                {data?.activity?.map((item, i) => {
                  const iconClass =
                    item.type === "cliente" ? "text-blue-500" :
                    item.type === "tarefa" ? "text-amber-500" :
                    item.type === "evento" ? "text-indigo-500" :
                    item.type === "documento" ? "text-slate-500" :
                    item.type === "email" ? "text-cyan-500" :
                    item.type === "financeiro" ? "text-emerald-500" :
                    "text-primary";

                  const Icon =
                    item.type === "cliente" ? MessageSquare :
                    item.type === "tarefa" ? ClipboardList :
                    item.type === "evento" ? Clock :
                    item.type === "documento" ? BarChart3 :
                    item.type === "email" ? MessageSquare :
                    item.type === "financeiro" ? CreditCard :
                    Activity;

                  return (
                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className={cn("p-2 rounded-lg bg-slate-50", iconClass)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 truncate">{item.description || (item.status ? `Estado: ${item.status}` : "Sem descrição")}</p>
                      </div>
                      <div className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                        {formatTime(item.created_at)}
                      </div>
                    </div>
                  );
                })}
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
                  <p className="text-sm font-bold text-slate-900">{data?.instance?.instance_name || 'Sem Instância'}</p>
                  <p className="text-[10px] text-slate-500">{user?.phone_e164}</p>
                </div>
              </div>

              <div className="space-y-3 px-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Estado da Ligação</span>
                  <span className={cn(
                    "flex items-center gap-1.5 font-bold",
                    data?.instance?.status === 'conectado' ? "text-green-600" : "text-red-600"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      data?.instance?.status === 'conectado' ? "bg-green-500 animate-pulse" : "bg-red-500"
                    )}></div>
                    {data?.instance?.status === 'conectado' ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Tipo de Instância</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 capitalize">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    {data?.instance?.is_hub ? 'Hub Trial' : 'Instância Privada'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Uptime (30 dias)</span>
                  <span className="font-bold text-slate-900">{data?.instance?.status === 'online' ? '100%' : 'N/A'}</span>
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
                  {data?.subscription?.plan || 'Nenhum'}
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
                    {data?.subscription?.ends_at 
                      ? new Date(data.subscription.ends_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
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
