
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Phone, 
  Bot, 
  User, 
  Send, 
  MoreVertical,
  Check,
  CheckCheck,
  ChevronRight,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';

interface Conversation {
  id: string;
  customer_name: string;
  phone: string;
  intent: string;
  step: string;
  last_user_message: string;
  last_bot_message: string;
  updated_at: string;
  unread: boolean;
}

export function RestaurantConversations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('all');

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.client_id) return;
      
      try {
        setLoading(true);
        // In a real scenario, we would call the backend with the real client_id
        // const data = await apiGet(`/api/restaurant/conversations?client_id=${user.client_id}`);
        
        // Mock data for conversations, but using the real client_id from session
        setTimeout(() => {
          setConversations([
            {
              id: '1',
              customer_name: 'João Silva',
              phone: '+351 912 345 678',
              intent: 'Pedido',
              step: 'Escolha de Itens',
              last_user_message: 'Quero um hambúrguer gourmet e batatas fritas.',
              last_bot_message: 'Com certeza! Gostaria de adicionar alguma bebida?',
              updated_at: new Date().toISOString(),
              unread: true
            },
            {
              id: '2',
              customer_name: 'Maria Santos',
              phone: '+351 934 567 890',
              intent: 'Reserva',
              step: 'Confirmação',
              last_user_message: 'Sim, para 4 pessoas às 20:30.',
              last_bot_message: 'Perfeito. A sua reserva está confirmada!',
              updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
              unread: false
            },
            {
              id: '3',
              customer_name: 'Pedro Oliveira',
              phone: '+351 965 432 109',
              intent: 'Informação',
              step: 'Horário',
              last_user_message: 'Até que horas estão abertos hoje?',
              last_bot_message: 'Estamos abertos até às 23:00.',
              updated_at: new Date(Date.now() - 120 * 60000).toISOString(),
              unread: false
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user?.client_id]);

  const filteredConversations = conversations.filter(conv => {
    const matchesIntent = intentFilter === 'all' || conv.intent === intentFilter;
    const matchesSearch = conv.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                          conv.phone.includes(search);
    return matchesIntent && matchesSearch;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6">
      {/* Sidebar - Conversations List */}
      <div className={cn(
        "w-full lg:w-96 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden",
        selectedConversation && "hidden lg:flex"
      )}>
        {/* List Header */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Conversas</h2>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'Pedido', 'Reserva', 'Informação'].map((intent) => (
              <button
                key={intent}
                onClick={() => setIntentFilter(intent)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  intentFilter === intent 
                    ? "bg-primary text-white" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {intent === 'all' ? 'Todas' : intent}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={cn(
                "p-4 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50/80",
                selectedConversation?.id === conv.id && "bg-slate-50 border-l-4 border-primary"
              )}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {conv.customer_name.charAt(0)}
                </div>
                {conv.unread && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    1
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{conv.customer_name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{formatTime(conv.updated_at)}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-1">{conv.last_user_message}</p>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest">
                    {conv.intent}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 truncate italic">{conv.step}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden",
        !selectedConversation && "hidden lg:flex"
      )}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-white rounded-xl transition-all text-slate-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
                  {selectedConversation.customer_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{selectedConversation.customer_name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedConversation.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-400 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                  Hoje
                </span>
              </div>

              {/* Bot Message */}
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">Olá! Bem-vindo ao {user?.company_name || 'nosso restaurante'}. Como posso ajudar hoje?</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">09:00</span>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="p-4 bg-primary text-white rounded-2xl rounded-tr-none shadow-lg shadow-primary/10">
                    <p className="text-sm leading-relaxed">{selectedConversation.last_user_message}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-slate-400 mr-1">
                    <span>{formatTime(selectedConversation.updated_at)}</span>
                    <CheckCheck className="w-3 h-3 text-primary" />
                  </div>
                </div>
              </div>

              {/* Bot Message */}
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedConversation.last_bot_message}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">{formatTime(selectedConversation.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input 
                  type="text" 
                  placeholder="Escreva uma mensagem..." 
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-medium text-slate-900"
                />
                <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-3">
                O Bot está a responder automaticamente
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
            <div className="w-20 h-20 bg-white rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Selecione uma conversa</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Escolha um cliente na lista lateral para ver o histórico de mensagens e intervir se necessário.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
