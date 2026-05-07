
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Plus,
  Calendar,
  ArrowRight,
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { RestaurantStatusBadge } from '../../components/restaurant/RestaurantStatusBadge';
import { RestaurantReservation } from '../../types/restaurant';

export function RestaurantReservations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<RestaurantReservation[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const data = await apiGet(`/api/restaurant/reservations?client_id=${user.client_id}`);
        
        // Mock data for reservations, but using the real client_id from session
        setTimeout(() => {
          setReservations([
            {
              id: '1',
              client_id: user.client_id,
              customer_name: 'António Costa',
              phone: '+351 912 345 678',
              email: 'antonio@email.com',
              reservation_date: new Date().toISOString().split('T')[0],
              reservation_time: '20:00',
              people_count: 4,
              notes: 'Mesa perto da janela, se possível.',
              status: 'pending',
              source: 'WhatsApp Bot',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              client_id: user.client_id,
              customer_name: 'Isabel Pereira',
              phone: '+351 934 567 890',
              reservation_date: new Date().toISOString().split('T')[0],
              reservation_time: '21:30',
              people_count: 2,
              status: 'confirmed',
              source: 'WhatsApp Bot',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '3',
              client_id: user.client_id,
              customer_name: 'Ricardo Santos',
              phone: '+351 965 432 109',
              reservation_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              reservation_time: '13:00',
              people_count: 6,
              status: 'confirmed',
              source: 'WhatsApp Bot',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user?.client_id]);

  const filteredReservations = reservations.filter(res => {
    const matchesFilter = filter === 'all' || res.status === filter;
    const matchesSearch = res.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                          res.phone.includes(search);
    return matchesFilter && matchesSearch;
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
          <h1 className="text-2xl font-display font-black text-slate-900">Gestão de Reservas</h1>
          <p className="text-slate-500 font-medium">Controle as reservas e a ocupação do seu restaurante.</p>
        </div>
        <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Reserva
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente ou telefone..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { label: 'Todas', value: 'all' },
              { label: 'Pendentes', value: 'pending' },
              { label: 'Confirmadas', value: 'confirmed' },
              { label: 'Concluídas', value: 'completed' },
              { label: 'Canceladas', value: 'cancelled' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                  filter === f.value 
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

      {/* Reservations Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data & Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pessoas</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {res.customer_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{res.customer_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{res.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold">{new Date(res.reservation_date).toLocaleDateString('pt-PT')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold">{res.reservation_time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-black">{res.people_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RestaurantStatusBadge status={res.status} type="reservation" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {res.status === 'pending' && (
                        <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Confirmar">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Cancelar">
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredReservations.map((res) => (
            <div key={res.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {res.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{res.customer_name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{res.phone}</p>
                  </div>
                </div>
                <RestaurantStatusBadge status={res.status} type="reservation" />
              </div>
              
              <div className="flex items-center justify-between py-3 border-y border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{new Date(res.reservation_date).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{res.reservation_time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">{res.people_count}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {res.status === 'pending' && (
                  <button className="flex-1 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar
                  </button>
                )}
                <button className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <div className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma reserva encontrada</h3>
            <p className="text-sm text-slate-500">Tente ajustar os seus filtros de pesquisa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
