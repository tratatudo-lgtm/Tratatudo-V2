
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronRight, 
  MoreVertical,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { RestaurantStatusBadge } from '../../components/restaurant/RestaurantStatusBadge';
import { RestaurantPayment } from '../../types/restaurant';

export function RestaurantPayments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<RestaurantPayment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const data = await apiGet(`/api/restaurant/payments?client_id=${user.client_id}`);
        
        // Mock data for payments, but using the real client_id from session
        setTimeout(() => {
          setPayments([
            {
              id: 'p1',
              client_id: user.client_id,
              provider: 'Stripe',
              amount: 25.50,
              currency: 'EUR',
              status: 'paid',
              payment_method: 'Cartão',
              external_reference: 'ch_123456789',
              paid_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'p2',
              client_id: user.client_id,
              provider: 'MBWay',
              amount: 18.00,
              currency: 'EUR',
              status: 'paid',
              payment_method: 'MBWay',
              external_reference: 'mb_987654321',
              paid_at: new Date(Date.now() - 3600000).toISOString(),
              created_at: new Date(Date.now() - 3600000).toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'p3',
              client_id: user.client_id,
              provider: 'Stripe',
              amount: 35.00,
              currency: 'EUR',
              status: 'pending',
              payment_method: 'Cartão',
              created_at: new Date(Date.now() - 7200000).toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.client_id]);

  const filteredPayments = payments.filter(pay => {
    const matchesStatus = statusFilter === 'all' || pay.status === statusFilter;
    const matchesSearch = pay.external_reference?.toLowerCase().includes(search.toLowerCase()) || 
                          pay.id.includes(search) || 
                          pay.amount.toString().includes(search);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900">Histórico de Pagamentos</h1>
          <p className="text-slate-500 font-medium">Acompanhe as transações e o estado financeiro.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/10 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+12% vs ontem</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vendas Hoje</p>
              <h3 className="text-3xl font-display font-black">842.50€</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A aguardar</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pendente</p>
            <h3 className="text-3xl font-display font-black text-slate-900">125.00€</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Este Mês</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Recebido</p>
            <h3 className="text-3xl font-display font-black text-slate-900">12,450.80€</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por referência ou valor..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { label: 'Todos', value: 'all' },
              { label: 'Pagos', value: 'paid' },
              { label: 'Pendentes', value: 'pending' },
              { label: 'Falhados', value: 'failed' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                  statusFilter === f.value 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transação</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Método</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">
                        ID
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{pay.external_reference || 'Sem Ref.'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pay.provider}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold">
                        {pay.paid_at 
                          ? new Date(pay.paid_at).toLocaleDateString('pt-PT') 
                          : new Date(pay.created_at).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">{pay.payment_method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900">{pay.amount.toFixed(2)}€</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RestaurantStatusBadge status={pay.status} type="payment" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredPayments.map((pay) => (
            <div key={pay.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{pay.external_reference || 'Sem Ref.'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pay.provider} • {pay.payment_method}</p>
                </div>
                <RestaurantStatusBadge status={pay.status} type="payment" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">
                    {pay.paid_at 
                      ? new Date(pay.paid_at).toLocaleDateString('pt-PT') 
                      : new Date(pay.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <span className="text-lg font-black text-slate-900">{pay.amount.toFixed(2)}€</span>
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum pagamento encontrado</h3>
            <p className="text-sm text-slate-500">Tente ajustar os seus filtros de pesquisa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
