
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Printer,
  MoreVertical,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { RestaurantStatusBadge } from '../../components/restaurant/RestaurantStatusBadge';
import { RestaurantOrder } from '../../types/restaurant';

export function RestaurantOrders() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const data = await apiGet(`/api/restaurant/orders?client_id=${user.client_id}`);
        
        // Mock data for orders, but using the real client_id from session
        setTimeout(() => {
          setOrders([
            {
              id: '1024',
              client_id: user.client_id,
              customer_name: 'João Silva',
              phone: '+351 912 345 678',
              email: 'joao@email.com',
              requested_time: '20:30',
              notes: 'Sem cebola no hambúrguer, por favor.',
              order_type: 'delivery',
              status: 'pending',
              source: 'WhatsApp Bot',
              subtotal: 22.50,
              total: 25.50,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              items: [
                { id: '1', order_id: '1024', menu_item_id: 'm1', item_name: 'Hambúrguer Gourmet', quantity: 1, unit_price: 12.50, line_total: 12.50, created_at: '' },
                { id: '2', order_id: '1024', menu_item_id: 'm2', item_name: 'Batata Frita XL', quantity: 1, unit_price: 4.50, line_total: 4.50, created_at: '' },
                { id: '3', order_id: '1024', menu_item_id: 'm3', item_name: 'Limonada Caseira', quantity: 1, unit_price: 3.50, line_total: 3.50, created_at: '' },
              ]
            },
            {
              id: '1025',
              client_id: user.client_id,
              customer_name: 'Maria Santos',
              phone: '+351 934 567 890',
              order_type: 'takeaway',
              status: 'preparing',
              source: 'WhatsApp Bot',
              subtotal: 18.00,
              total: 18.00,
              created_at: new Date(Date.now() - 15 * 60000).toISOString(),
              updated_at: new Date().toISOString(),
              items: [
                { id: '4', order_id: '1025', menu_item_id: 'm4', item_name: 'Pizza Margherita', quantity: 1, unit_price: 14.00, line_total: 14.00, created_at: '' },
                { id: '5', order_id: '1025', menu_item_id: 'm5', item_name: 'Coca-Cola', quantity: 2, unit_price: 2.00, line_total: 4.00, created_at: '' },
              ]
            },
            {
              id: '1026',
              client_id: user.client_id,
              customer_name: 'Pedro Oliveira',
              phone: '+351 965 432 109',
              order_type: 'dine_in',
              status: 'ready',
              source: 'WhatsApp Bot',
              subtotal: 35.00,
              total: 35.00,
              created_at: new Date(Date.now() - 45 * 60000).toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.client_id]);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                          order.id.includes(search) || 
                          order.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery': return 'Entrega';
      case 'takeaway': return 'Takeaway';
      case 'dine_in': return 'No Local';
      default: return type;
    }
  };

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
          <h1 className="text-2xl font-display font-black text-slate-900">Gestão de Pedidos</h1>
          <p className="text-slate-500 font-medium">Acompanhe e gira os pedidos em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir Todos
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por cliente, ID ou telefone..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { label: 'Todos', value: 'all' },
              { label: 'Pendentes', value: 'pending' },
              { label: 'Preparação', value: 'preparing' },
              { label: 'Prontos', value: 'ready' },
              { label: 'Concluídos', value: 'completed' },
              { label: 'Cancelados', value: 'cancelled' },
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

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      #{order.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{order.customer_name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getOrderTypeLabel(order.order_type)}</p>
                    </div>
                  </div>
                  <RestaurantStatusBadge status={order.status} />
                </div>

                <div className="flex items-center justify-between py-4 border-y border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold">{new Date(order.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">{order.total.toFixed(2)}€</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{order.source}</span>
                  </div>
                  <button className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Pedido #{selectedOrder.id}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {getOrderTypeLabel(selectedOrder.order_type)} • {new Date(selectedOrder.created_at).toLocaleString('pt-PT')}
                    </p>
                  </div>
                </div>
                <RestaurantStatusBadge status={selectedOrder.status} className="scale-110" />
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{selectedOrder.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{selectedOrder.source}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens do Pedido</h4>
                  <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100/50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qtd</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-900">{item.item_name}</p>
                              {item.notes && <p className="text-[10px] text-orange-500 font-bold italic">Nota: {item.notes}</p>}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs font-black text-slate-900">
                                {item.quantity}x
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-black text-slate-900">{item.line_total.toFixed(2)}€</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Observações do Cliente</h4>
                    <p className="text-sm text-orange-900 font-medium italic">"{selectedOrder.notes}"</p>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">Subtotal</span>
                    <span className="text-slate-900 font-black">{selectedOrder.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-bold">Taxa de Entrega</span>
                    <span className="text-slate-900 font-black">{(selectedOrder.total - selectedOrder.subtotal).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-lg font-black text-slate-900">Total</span>
                    <span className="text-2xl font-display font-black text-primary">{selectedOrder.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Actions */}
              <div className="p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                <button 
                  className="py-4 bg-white text-slate-600 rounded-2xl font-bold border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircle className="w-5 h-5" />
                  Cancelar Pedido
                </button>
                <button className="py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {selectedOrder.status === 'pending' ? 'Iniciar Preparação' : 
                   selectedOrder.status === 'preparing' ? 'Marcar como Pronto' : 'Concluir Pedido'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
