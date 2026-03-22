import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  User, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Send, 
  MoreVertical,
  Smartphone,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { Conversation, WAMessage, ClientInstance, WhatsAppStats } from '../../types/hub';
import { toast } from 'sonner';

const WhatsApp: React.FC = () => {
  const { can } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const [instances, setInstances] = useState<ClientInstance[]>([]);
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.phone_e164);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [convRes, instRes, statsRes] = await Promise.all([
        fetch('/api/client/whatsapp/conversations'),
        fetch('/api/client/whatsapp/instances'),
        fetch('/api/client/whatsapp/stats')
      ]);

      const [convData, instData, statsData] = await Promise.all([
        convRes.json(),
        instRes.json(),
        statsRes.json()
      ]);

      if (convData.ok) setConversations(convData.conversations);
      if (instData.ok) setInstances(instData.instances);
      if (statsData.ok) setStats(statsData.stats);

    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
      toast.error('Erro ao carregar dados do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (phone: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/client/whatsapp/conversations/${phone}/messages`);
      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = 
      c.phone_e164.includes(searchQuery) || 
      (c.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesInstance = selectedInstance === 'all' || c.instance === selectedInstance;
    
    return matchesSearch && matchesInstance;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <StatCard 
          label="Conversas" 
          value={stats?.totalConversations || 0} 
          icon={<MessageSquare size={20} />} 
          color="indigo" 
        />
        <StatCard 
          label="Mensagens Hoje" 
          value={stats?.messagesToday || 0} 
          icon={<RefreshCw size={20} />} 
          color="emerald" 
        />
        <StatCard 
          label="Instâncias Ativas" 
          value={stats?.activeInstances || 0} 
          icon={<Smartphone size={20} />} 
          color="blue" 
        />
        <StatCard 
          label="Com Ticket" 
          value={stats?.conversationsWithTickets || 0} 
          icon={<Ticket size={20} />} 
          color="amber" 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Conversas</h2>
              <button onClick={fetchInitialData} className="p-2 text-slate-400 hover:text-primary transition-colors">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setSelectedInstance('all')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                  selectedInstance === 'all' ? "bg-primary text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                Todas
              </button>
              {instances.map(inst => (
                <button 
                  key={inst.id}
                  onClick={() => setSelectedInstance(inst.instance_name)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    selectedInstance === inst.instance_name ? "bg-primary text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {inst.instance_name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 size={24} className="text-primary animate-spin" />
                <p className="text-xs text-slate-400">A carregar conversas...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.phone_e164}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-slate-50 transition-all flex gap-3 group",
                      selectedConversation?.phone_e164 === conv.phone_e164 && "bg-slate-50 border-l-4 border-primary"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <User size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 truncate">{conv.display_name}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(conv.last_message_at)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-1">{conv.last_message}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md font-medium">
                          {conv.instance}
                        </span>
                        {conv.linked_ticket_id && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-md font-bold flex items-center gap-1">
                            <Ticket size={10} />
                            {conv.ticket_tracking_code}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <MessageSquare size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">Nenhuma conversa encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/30">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedConversation.display_name}</h3>
                    <p className="text-[10px] text-slate-400">{selectedConversation.phone_e164}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 size={32} className="text-primary animate-spin" />
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          msg.direction === 'outbound' ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "px-4 py-2 rounded-2xl text-sm shadow-sm",
                          msg.direction === 'outbound' 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="Escreva uma mensagem... (Apenas visualização nesta fase)"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled
                  />
                  <button 
                    className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    disabled
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-slate-50">
                <MessageSquare size={40} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Selecione uma conversa</h3>
              <p className="text-slate-500 max-w-xs">
                Escolha uma conversa na lista lateral para visualizar o histórico de mensagens e o contexto operacional.
              </p>
            </div>
          )}
        </div>

        {/* Context Panel (Desktop Only) */}
        {selectedConversation && (
          <div className="hidden lg:flex w-72 border-l border-slate-100 flex-col h-full bg-white shrink-0">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Contexto</h3>
              
              <div className="space-y-6">
                {/* Client Info */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente Associado</p>
                  {selectedConversation.linked_client_id ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-primary" />
                        <span className="text-sm font-bold text-slate-900 truncate">{selectedConversation.display_name}</span>
                      </div>
                      <button className="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline">
                        Ver Perfil <ExternalLink size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-400 mb-2">Nenhum cliente associado</p>
                      <button className="text-[10px] text-primary font-bold hover:underline">Associar agora</button>
                    </div>
                  )}
                </div>

                {/* Ticket Info */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Ativo</p>
                  {selectedConversation.linked_ticket_id ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Ticket size={16} className="text-amber-600" />
                          <span className="text-sm font-bold text-amber-900">{selectedConversation.ticket_tracking_code}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md font-bold uppercase">
                          {selectedConversation.ticket_status}
                        </span>
                      </div>
                      <button className="text-[10px] text-amber-700 font-bold flex items-center gap-1 hover:underline">
                        Ver Ticket <ExternalLink size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-400 mb-2">Sem ticket em aberto</p>
                      <button className="text-[10px] text-primary font-bold hover:underline">Criar Ticket</button>
                    </div>
                  )}
                </div>

                {/* Instance Info */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instância</p>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Smartphone size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{selectedConversation.instance}</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 mt-auto">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900">Dica Operacional</span>
                </div>
                <p className="text-[10px] text-indigo-700 leading-relaxed">
                  Pode associar esta conversa a um ticket existente para manter o histórico centralizado.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'blue' | 'amber' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
};

export default WhatsApp;
