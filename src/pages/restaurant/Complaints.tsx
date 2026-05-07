
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  MoreVertical,
  AlertTriangle,
  Send,
  Bot
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { RestaurantStatusBadge } from '../../components/restaurant/RestaurantStatusBadge';

interface Complaint {
  id: string;
  client_id: string;
  customer_name: string;
  phone: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  messages?: Array<{
    id: string;
    sender: 'customer' | 'staff' | 'bot';
    text: string;
    created_at: string;
  }>;
}

export function RestaurantComplaints() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const data = await apiGet(`/api/restaurant/complaints?client_id=${user.client_id}`);
        
        // Mock data for complaints, but using the real client_id from session
        setTimeout(() => {
          setComplaints([
            {
              id: 'T-101',
              client_id: user.client_id,
              customer_name: 'João Silva',
              phone: '+351 912 345 678',
              title: 'Atraso na Entrega',
              description: 'O meu pedido demorou mais de 1 hora a chegar e a comida estava fria.',
              status: 'pending',
              priority: 'high',
              created_at: new Date().toISOString(),
              messages: [
                { id: '1', sender: 'customer', text: 'O meu pedido demorou mais de 1 hora a chegar e a comida estava fria.', created_at: new Date().toISOString() },
                { id: '2', sender: 'bot', text: 'Lamentamos imenso o sucedido. Iremos analisar a situação com a equipa de entregas.', created_at: new Date().toISOString() }
              ]
            },
            {
              id: 'T-102',
              client_id: user.client_id,
              customer_name: 'Maria Santos',
              phone: '+351 934 567 890',
              title: 'Item em Falta',
              description: 'Faltava a bebida que pedi no meu takeaway.',
              status: 'completed',
              priority: 'medium',
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user?.client_id]);

  const filteredComplaints = complaints.filter(comp => {
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    const matchesSearch = comp.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                          comp.id.includes(search) || 
                          comp.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-100';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'low': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
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
          <h1 className="text-2xl font-display font-black text-slate-900">Reclamações & Incidências</h1>
          <p className="text-slate-500 font-medium">Gira o feedback e as reclamações dos seus clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">2 Pendentes</span>
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
              placeholder="Pesquisar por cliente, título ou ID..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { label: 'Todas', value: 'all' },
              { label: 'Pendentes', value: 'pending' },
              { label: 'Em Análise', value: 'preparing' },
              { label: 'Concluídas', value: 'completed' },
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

      {/* Complaints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.map((comp) => (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
            onClick={() => setSelectedComplaint(comp)}
          >
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-[10px]">
                    {comp.id}
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                    getPriorityColor(comp.priority)
                  )}>
                    {comp.priority}
                  </span>
                </div>
                <RestaurantStatusBadge status={comp.status} />
              </div>

              <div>
                <h3 className="font-black text-slate-900 line-clamp-1">{comp.title}</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">{comp.description}</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {comp.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{comp.customer_name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{new Date(comp.created_at).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{comp.messages?.length || 0} Mensagens</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Complaint Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedComplaint(null)}
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
                    onClick={() => setSelectedComplaint(null)}
                    className="p-2 hover:bg-white rounded-xl transition-all text-slate-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedComplaint.title}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      ID {selectedComplaint.id} • {new Date(selectedComplaint.created_at).toLocaleString('pt-PT')}
                    </p>
                  </div>
                </div>
                <RestaurantStatusBadge status={selectedComplaint.status} className="scale-110" />
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Description */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Descrição da Reclamação</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">"{selectedComplaint.description}"</p>
                </div>

                {/* Messages History */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico de Respostas</h4>
                  <div className="space-y-4">
                    {selectedComplaint.messages?.map((msg) => (
                      <div key={msg.id} className={cn(
                        "flex flex-col gap-1",
                        msg.sender === 'customer' ? "items-start" : "items-end"
                      )}>
                        <div className={cn(
                          "p-4 rounded-2xl max-w-[80%] text-sm font-medium",
                          msg.sender === 'customer' ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none" : 
                          msg.sender === 'bot' ? "bg-slate-900 text-white rounded-tr-none" : "bg-primary text-white rounded-tr-none"
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.sender === 'bot' && <Bot className="w-3 h-3 text-primary" />}
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                              {msg.sender === 'customer' ? selectedComplaint.customer_name : msg.sender === 'bot' ? 'Bot TrataTudo' : 'Equipa'}
                            </span>
                          </div>
                          {msg.text}
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 px-1">
                          {new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer - Reply */}
              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-4 p-2 bg-white rounded-[24px] border border-slate-200 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input 
                    type="text" 
                    placeholder="Responder ao cliente..." 
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-medium text-slate-900"
                  />
                  <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar como Resolvido
                  </button>
                  <div className="w-px h-3 bg-slate-200"></div>
                  <button className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                    <XCircle className="w-3.5 h-3.5" />
                    Cancelar Incidência
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
