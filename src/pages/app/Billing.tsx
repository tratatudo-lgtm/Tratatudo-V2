import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Users, 
  Zap, 
  MessageSquare, 
  Ticket, 
  FileText, 
  TrendingUp, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { Subscription, UsageMetrics, BillingStats, ClientBillingSummary } from '../../types/hub';
import { StatCard } from '../../components/app/StatCard';
import { toast } from 'sonner';

const Billing: React.FC = () => {
  const { user, can } = useAuth();
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<ClientBillingSummary[]>([]);
  const [mySubscription, setMySubscription] = useState<Subscription | null>(null);
  const [myUsage, setMyUsage] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'admin' | 'client'>('client');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Determine view mode based on role
    // In a real SaaS, we might have a separate admin dashboard, 
    // but here we'll adapt the Billing page.
    if (isAdmin) {
      setViewMode('admin');
      fetchAdminData();
    } else {
      setViewMode('client');
      fetchClientData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, subsRes] = await Promise.all([
        fetch('/api/admin/billing/stats'),
        fetch('/api/admin/billing/subscriptions')
      ]);

      const [statsData, subsData] = await Promise.all([
        statsRes.json(),
        subsRes.json()
      ]);

      if (statsData.ok) setStats(statsData.stats);
      if (subsData.ok) {
        // For the admin view, we'll need to fetch usage for each client too 
        // or just show the subscription list. 
        // For now, let's map the subscriptions to the summary format.
        setSubscriptions(subsData.subscriptions.map((s: any) => ({
          client_id: s.client_id,
          company_name: s.company_name,
          subscription_status: s.status,
          current_plan: s.plan_name,
          monthly_value: s.price_monthly,
          renewal_date: s.renewal_date,
          usage: { // Placeholder usage if not returned by API
            total_users: 0,
            total_instances: 0,
            total_messages: 0,
            total_tickets: 0,
            total_documents: 0
          }
        })));
      }
    } catch (err) {
      setError('Erro ao carregar dados administrativos de faturação');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [subRes, usageRes] = await Promise.all([
        fetch('/api/client/billing/subscription'),
        fetch('/api/client/billing/usage')
      ]);

      const [subData, usageData] = await Promise.all([
        subRes.json(),
        usageRes.json()
      ]);

      if (subData.ok) setMySubscription(subData.subscription);
      if (usageData.ok) setMyUsage(usageData.usage);
    } catch (err) {
      setError('Erro ao carregar os seus dados de subscrição');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch = s.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.client_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">A carregar informações de faturação...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {viewMode === 'admin' ? 'Gestão SaaS & Billing' : 'A Minha Subscrição'}
          </h1>
          <p className="text-slate-500">
            {viewMode === 'admin' 
              ? 'Visão global de subscrições, planos e métricas operacionais.' 
              : 'Gira o seu plano, veja o consumo e histórico de faturação.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={viewMode === 'admin' ? fetchAdminData : fetchClientData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} />
          </button>
          {viewMode === 'client' && (
            <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              Mudar de Plano
            </button>
          )}
        </div>
      </div>

      {viewMode === 'admin' ? (
        <AdminView 
          stats={stats} 
          subscriptions={filteredSubscriptions} 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      ) : (
        <ClientView 
          subscription={mySubscription} 
          usage={myUsage} 
        />
      )}
    </div>
  );
};

// --- Admin View Components ---

const AdminView: React.FC<{
  stats: BillingStats | null;
  subscriptions: ClientBillingSummary[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}> = ({ stats, subscriptions, searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Clientes" 
          value={stats?.totalClients || 0} 
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          label="Subscrições Ativas" 
          value={stats?.activeSubscriptions || 0} 
          icon={CheckCircle2} 
          color="bg-emerald-600" 
        />
        <StatCard 
          label="Em Trial" 
          value={stats?.trialSubscriptions || 0} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="MRR Estimado" 
          value={`€${(stats?.estimatedMonthlyRevenue || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-indigo-600" 
        />
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900">Lista de Subscrições</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Todos os Estados</option>
              <option value="active">Ativos</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspensos</option>
              <option value="canceled">Cancelados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Renovação</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <tr key={sub.client_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{sub.company_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{sub.client_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-700 uppercase">{sub.current_plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sub.subscription_status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">€{sub.monthly_value.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">
                        {sub.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-10 h-10 text-slate-200" />
                      <p className="text-sm text-slate-400">Nenhuma subscrição encontrada.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Client View Components ---

const ClientView: React.FC<{
  subscription: Subscription | null;
  usage: UsageMetrics | null;
}> = ({ subscription, usage }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Current Plan Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-primary to-indigo-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary-foreground/80" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">Plano Atual</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight mb-2">
                  {subscription?.plan_name || 'Plano Gratuito'}
                </h2>
                <div className="flex items-center gap-3">
                  <StatusBadge status={subscription?.status || 'trial'} inverted />
                  <span className="text-sm font-medium text-white/80">
                    Desde {subscription ? new Date(subscription.start_date).toLocaleDateString() : 'sempre'}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-5xl font-black mb-1">
                  €{subscription?.price_monthly.toFixed(2) || '0.00'}
                  <span className="text-lg font-medium opacity-70">/mês</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                  Próxima renovação: {subscription?.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ciclo de Faturação</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-slate-900 capitalize">{subscription?.billing_cycle || 'Mensal'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Método de Pagamento</p>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-slate-900">Cartão de Crédito (**** 4242)</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Comercial</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900">Regularizado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Metrics Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Visão Operacional & Consumo</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Última atualização: {usage ? new Date(usage.last_updated).toLocaleTimeString() : '--:--'}
            </span>
          </div>
          
          <div className="p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <UsageCard label="Utilizadores" value={usage?.total_users || 0} icon={Users} color="blue" />
            <UsageCard label="Instâncias WA" value={usage?.total_instances || 0} icon={Smartphone} color="emerald" />
            <UsageCard label="Mensagens" value={usage?.total_messages || 0} icon={MessageSquare} color="indigo" />
            <UsageCard label="Tickets" value={usage?.total_tickets || 0} icon={Ticket} color="amber" />
            <UsageCard label="Documentos" value={usage?.total_documents || 0} icon={FileText} color="rose" />
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Limite de Utilização</p>
                  <p className="text-[10px] text-slate-500">Está a utilizar 45% da capacidade do seu plano.</p>
                </div>
              </div>
              <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Column: Actions & History */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
              <span className="text-sm font-bold text-slate-700">Ver Faturas</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
              <span className="text-sm font-bold text-slate-700">Alterar Cartão</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
              <span className="text-sm font-bold text-slate-700">Histórico de Pagamentos</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Operational Health */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Estado Operacional</h3>
          <div className="space-y-4">
            <HealthItem label="Cliente Ativo" status="success" />
            <HealthItem label="Instâncias Online" status="success" />
            <HealthItem label="Faturação em Dia" status="success" />
            <HealthItem label="Renovação Próxima" status="warning" />
          </div>
        </div>

        {/* Support Banner */}
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <h3 className="font-bold mb-2">Precisa de Ajuda?</h3>
          <p className="text-xs text-indigo-100 leading-relaxed mb-4">
            Tem dúvidas sobre o seu plano ou faturação? A nossa equipa financeira está disponível para ajudar.
          </p>
          <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
            Contactar Suporte
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const StatusBadge: React.FC<{ status: Subscription['status']; inverted?: boolean }> = ({ status, inverted }) => {
  const configs = {
    active: { label: 'Ativo', color: 'bg-emerald-50 text-emerald-600', inv: 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' },
    trial: { label: 'Trial', color: 'bg-blue-50 text-blue-600', inv: 'bg-blue-500/20 text-blue-100 border border-blue-500/30' },
    past_due: { label: 'Em Atraso', color: 'bg-red-50 text-red-600', inv: 'bg-red-500/20 text-red-100 border border-red-500/30' },
    suspended: { label: 'Suspenso', color: 'bg-amber-50 text-amber-600', inv: 'bg-amber-500/20 text-amber-100 border border-amber-500/30' },
    canceled: { label: 'Cancelado', color: 'bg-slate-100 text-slate-500', inv: 'bg-slate-500/20 text-slate-100 border border-slate-500/30' },
  };

  const config = configs[status] || configs.canceled;

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
      inverted ? config.inv : config.color
    )}>
      {config.label}
    </span>
  );
};

const UsageCard: React.FC<{ label: string; value: number; icon: any; color: string }> = ({ label, value, icon: Icon, color }) => {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50',
  };

  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-lg font-black text-slate-900">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      </div>
    </div>
  );
};

const HealthItem: React.FC<{ label: string; status: 'success' | 'warning' | 'error' }> = ({ label, status }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'success' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
        status === 'warning' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
        "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
      )} />
    </div>
  );
};

export default Billing;
