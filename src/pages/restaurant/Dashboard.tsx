
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  TrendingUp, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  ArrowRight,
  Zap,
  Activity,
  CreditCard,
  UtensilsCrossed
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
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { apiGet } from '../../lib/api';
import { RestaurantDashboardStats } from '../../types/restaurant';

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9C27B0'];

export function RestaurantDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RestaurantDashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const data = await apiGet(`/api/restaurant/dashboard/stats?client_id=${user.client_id}`);
        
        // For now, using mock data but ensuring it's tied to the real session
        setTimeout(() => {
          setStats({
            ordersToday: 24,
            salesToday: 842.50,
            reservationsToday: 8,
            pendingOrders: 5,
            preparingOrders: 3,
            completedOrders: 16,
            totalCustomers: 1254,
            topProducts: [
              { name: 'Hambúrguer Gourmet', quantity: 45 },
              { name: 'Pizza Margherita', quantity: 38 },
              { name: 'Salada Caesar', quantity: 22 },
              { name: 'Batata Frita XL', quantity: 60 },
              { name: 'Limonada Caseira', quantity: 35 },
            ],
            totalReceived: 12450.80,
            openComplaints: 2
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.client_id]);

  const kpis = [
    { label: 'Pedidos Hoje', value: stats?.ordersToday || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Vendas Hoje', value: `${stats?.salesToday.toFixed(2)}€` || '0.00€', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Reservas Hoje', value: stats?.reservationsToday || 0, icon: CalendarDays, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Clientes Captados', value: stats?.totalCustomers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const orderStats = [
    { label: 'Pendentes', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Em Preparação', value: stats?.preparingOrders || 0, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Concluídos', value: stats?.completedOrders || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Reclamações', value: stats?.openComplaints || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900">Olá, {user?.company_name || 'Restaurante'}!</h1>
          <p className="text-slate-500 font-medium">Aqui está o resumo da operação de hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bot Ativo</span>
          </div>
          <button className="p-2.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-display font-black text-slate-900">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Order Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-slate-900">Evolução de Vendas</h3>
            </div>
            <select className="bg-slate-50 border-none outline-none text-xs font-bold text-slate-500 rounded-xl px-4 py-2">
              <option>Hoje</option>
              <option>Últimos 7 dias</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { time: '08:00', value: 120 },
                { time: '10:00', value: 250 },
                { time: '12:00', value: 850 },
                { time: '14:00', value: 620 },
                { time: '16:00', value: 450 },
                { time: '18:00', value: 980 },
                { time: '20:00', value: 1250 },
                { time: '22:00', value: 750 },
              ]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}}
                  tickFormatter={(val) => `${val}€`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-slate-900">Mais Vendidos</h3>
          </div>
          <div className="space-y-6">
            {stats?.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{product.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{product.quantity}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">unid</span>
                </div>
              </div>
            ))}
          </div>
          <Link 
            to="/app/restaurant/menu" 
            className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all"
          >
            Ver Ementa Completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-slate-900">Últimos Pedidos</h3>
            </div>
            <Link to="/app/restaurant/orders" className="text-xs font-bold text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                    #{1024 + i}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Cliente Exemplo {i}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery • Há {i * 5} min</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{(25.50 * i).toFixed(2)}€</p>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold uppercase tracking-widest">Pendente</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-slate-900">Conversas WhatsApp</h3>
            </div>
            <Link to="/app/restaurant/conversations" className="text-xs font-bold text-primary hover:underline">Ver Inbox</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">+351 912 345 67{i}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intenção: Reserva • Há {i * 2} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
