import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Subscription {
  id: string;
  client_id: string;
  company_name: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  amount: number;
  next_billing: string;
  created_at: string;
}

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const url = `${import.meta.env.VITE_API_URL}/api/admin/subscriptions`;
      console.log(`[ADMIN] Fetching subscriptions: ${url}`);
      try {
        const response = await fetch(url, {
          credentials: 'include'
        });
        console.log(`[ADMIN] Fetch subscriptions status: ${response.status}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || 'Falha ao carregar subscrições');
        }
        const data = await response.json();
        setSubscriptions(data);
      } catch (err: any) {
        console.error('[ADMIN] Fetch subscriptions failed:', err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter(s => 
    s.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.client_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium tracking-tight">A carregar dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Subscrições</h1>
          <p className="text-slate-500 font-medium">Controlo de faturação e planos dos clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {filteredSubscriptions.map((sub, index) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all p-8 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                sub.plan === 'enterprise' ? "bg-purple-500 shadow-purple-500/20" : 
                sub.plan === 'pro' ? "bg-primary shadow-primary/20" : "bg-slate-500 shadow-slate-500/20"
              )}>
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                sub.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                sub.status === 'past_due' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
              )}>
                {sub.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : 
                 sub.status === 'past_due' ? <AlertCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {sub.status}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{sub.company_name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.client_id}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Plano</span>
                  <span className="text-xs font-black text-slate-900 tracking-tight uppercase">{sub.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Mensal</span>
                  <span className="text-xs font-black text-slate-900 tracking-tight">€{sub.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Próxima Fatura</span>
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    {new Date(sub.next_billing).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Gerir Faturação
                </button>
                <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium tracking-tight">Nenhuma subscrição encontrada.</p>
        </div>
      )}
    </div>
  );
}
