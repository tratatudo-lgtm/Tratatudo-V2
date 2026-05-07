
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  MoreVertical,
  ChevronRight,
  ArrowRight,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  score: number;
  type: string;
  last_interaction: string;
  total_orders: number;
  total_spent: number;
  notes?: string;
}

export function RestaurantCustomers() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const data = await apiGet(`/api/restaurant/customers?client_id=${user.client_id}`);
        
        // Mock data for customers, but using the real client_id from session
        setTimeout(() => {
          setCustomers([
            {
              id: '1',
              name: 'João Silva',
              phone: '+351 912 345 678',
              email: 'joao@email.com',
              city: 'Lisboa',
              score: 4.8,
              type: 'VIP',
              last_interaction: new Date().toISOString(),
              total_orders: 12,
              total_spent: 345.50,
              notes: 'Gosta de mesa perto da janela.'
            },
            {
              id: '2',
              name: 'Maria Santos',
              phone: '+351 934 567 890',
              email: 'maria@email.com',
              city: 'Porto',
              score: 4.2,
              type: 'Recorrente',
              last_interaction: new Date(Date.now() - 2 * 86400000).toISOString(),
              total_orders: 5,
              total_spent: 120.00
            },
            {
              id: '3',
              name: 'Pedro Oliveira',
              phone: '+351 965 432 109',
              city: 'Coimbra',
              score: 3.5,
              type: 'Novo',
              last_interaction: new Date(Date.now() - 7 * 86400000).toISOString(),
              total_orders: 1,
              total_spent: 25.50
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [user?.client_id]);

  const filteredCustomers = customers.filter(cust => {
    const matchesType = typeFilter === 'all' || cust.type === typeFilter;
    const matchesSearch = cust.name.toLowerCase().includes(search.toLowerCase()) || 
                          cust.phone.includes(search) || 
                          cust.email?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
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
          <h1 className="text-2xl font-display font-black text-slate-900">Base de Clientes</h1>
          <p className="text-slate-500 font-medium">Conheça os seus clientes e os seus hábitos de consumo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Clientes</span>
              <span className="text-sm font-black text-slate-900">1,254</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Novos (Mês)</span>
              <span className="text-sm font-black text-emerald-600">+45</span>
            </div>
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
              placeholder="Pesquisar por nome, telefone ou email..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { label: 'Todos', value: 'all' },
              { label: 'VIP', value: 'VIP' },
              { label: 'Recorrente', value: 'Recorrente' },
              { label: 'Novo', value: 'Novo' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                  typeFilter === f.value 
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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, idx) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shadow-lg shadow-primary/5">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 line-clamp-1">{customer.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black text-slate-900">{customer.score}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">{customer.type}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold truncate">{customer.email}</span>
                  </div>
                )}
                {customer.city && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold">{customer.city}</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-3 h-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pedidos</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{customer.total_orders}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gasto Total</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{customer.total_spent.toFixed(2)}€</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Última: {new Date(customer.last_interaction).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-2 transition-all">
                  Ver Perfil
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
