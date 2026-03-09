import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Smartphone, 
  Bot, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/lib/auth/AuthContext';

interface Conversation {
  phone_e164: string;
  lastMsg: string;
  time: string;
  direction: string;
  type: string;
}

interface Message {
  text: string;
  direction: string;
  created_at: string;
  phone_e164: string;
  type?: string;
}

export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Todas');
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const { user } = useAuth();
  const clientId = user?.client_id;

  const fetchConversations = async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/messages/conversations`;
    console.log(`[APP] Fetching conversations: ${url}`);
    try {
      setLoading(true);
      const res = await fetch(url, {
        credentials: 'include'
      });
      console.log(`[APP] Fetch conversations status: ${res.status}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar conversas');
      }
      const data = await res.json();
      setConversations(data);
      if (data.length > 0 && !selectedPhone) {
        setSelectedPhone(data[0].phone_e164);
      }
    } catch (err: any) {
      console.error('[APP] Fetch conversations failed:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (phone: string) => {
    const url = `${import.meta.env.VITE_API_URL}/api/messages/history/${phone}`;
    console.log(`[APP] Fetching history for ${phone}: ${url}`);
    try {
      setLoadingHistory(true);
      const res = await fetch(url, {
        credentials: 'include'
      });
      console.log(`[APP] Fetch history status: ${res.status}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar histórico');
      }
      const data = await res.json();
      setHistory(data);
    } catch (err: any) {
      console.error(`[APP] Fetch history failed for ${phone}:`, err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      fetchHistory(selectedPhone);
    }
  }, [selectedPhone]);

  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel('wa_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wa_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // 1. Update history if it's the current conversation
          if (selectedPhone === newMessage.phone_e164) {
            setHistory((prev) => {
              // Avoid duplicates if fetchHistory is also running
              if (prev.some(m => m.created_at === newMessage.created_at && m.text === newMessage.text)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }

          // 2. Update conversation list
          setConversations((prev) => {
            const index = prev.findIndex((c) => c.phone_e164 === newMessage.phone_e164);
            const updatedConv: Conversation = {
              phone_e164: newMessage.phone_e164,
              lastMsg: newMessage.text,
              time: newMessage.created_at,
              direction: newMessage.direction,
              type: newMessage.type || 'Mensagem',
            };

            if (index !== -1) {
              // Move to top and update
              const newConvs = [...prev];
              newConvs.splice(index, 1);
              return [updatedConv, ...newConvs];
            } else {
              // New conversation, add to top
              return [updatedConv, ...prev];
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, selectedPhone]);

  const selectedConv = conversations.find(c => c.phone_e164 === selectedPhone);

  const filters = ['Todas', 'Recebidas', 'Enviadas', 'Pedidos', 'Reclamações'];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Ontem';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">A carregar as suas conversas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchConversations}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por número ou texto..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                filter === f 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        {/* Conversation List */}
        <div className={cn(
          "w-full lg:w-96 border-r border-slate-100 flex flex-col transition-all duration-300 absolute lg:relative inset-0 z-20 bg-white",
          !isMobileListOpen && "-translate-x-full lg:translate-x-0"
        )}>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900">Conversas Recentes</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {conversations.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Nenhuma conversa encontrada.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button 
                  key={conv.phone_e164} 
                  onClick={() => {
                    setSelectedPhone(conv.phone_e164);
                    setIsMobileListOpen(false);
                  }}
                  className={cn(
                    "w-full p-4 flex gap-4 hover:bg-slate-50 transition-all text-left group relative",
                    selectedPhone === conv.phone_e164 ? "bg-slate-50" : ""
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm text-slate-900 truncate">{conv.phone_e164}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{formatTime(conv.time)}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">{conv.lastMsg}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                        conv.type === 'Pedido' ? "bg-blue-50 text-blue-600" :
                        conv.type === 'Reclamação' ? "bg-red-50 text-red-600" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {conv.type}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Detail Panel */}
        <div className="flex-1 flex flex-col bg-slate-50/30 z-10">
          {selectedPhone ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsMobileListOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900">{selectedPhone}</p>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">WhatsApp Ativo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                    <Smartphone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {loadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-sm italic">Nenhuma mensagem nesta conversa.</p>
                  </div>
                ) : (
                  history.map((msg, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3 max-w-[85%] lg:max-w-[70%]",
                        msg.direction === 'received' ? "" : "ml-auto flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-sm",
                        msg.direction === 'received' ? "bg-white text-slate-400 border border-slate-100" : "bg-primary text-white"
                      )}>
                        {msg.direction === 'received' ? <User className="w-4 h-4" /> : (msg.direction === 'bot' ? <Bot className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />)}
                      </div>
                      <div className="space-y-1">
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm relative",
                          msg.direction === 'received' 
                            ? "bg-white border border-slate-100 rounded-tl-none" 
                            : "bg-primary text-white rounded-tr-none"
                        )}>
                          {msg.type && (
                            <span className={cn(
                              "absolute -top-2 right-4 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shadow-sm",
                              msg.type === 'Pedido' ? "bg-blue-500 text-white" : "bg-slate-700 text-white"
                            )}>
                              {msg.type}
                            </span>
                          )}
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className={cn(
                            "flex items-center gap-1 mt-2 justify-end",
                            msg.direction === 'received' ? "text-slate-400" : "text-white/60"
                          )}>
                            <span className="text-[9px] font-medium">{formatTime(msg.created_at)}</span>
                            {msg.direction !== 'received' && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <div className="flex-1 px-4 py-2 text-sm text-slate-400 italic">
                    O bot está a processar esta conversa automaticamente...
                  </div>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2">
                    Intervir Manualmente <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-center">
              <div>
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                  <MessageCircle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Selecione uma conversa</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Escolha um contacto na lista lateral para visualizar o histórico de mensagens.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Indicators Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recebidas</p>
            <p className="text-xl font-bold text-slate-900">
              {history.filter(m => m.direction === 'received').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 text-green-600 p-3 rounded-xl">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enviadas</p>
            <p className="text-xl font-bold text-slate-900">
              {history.filter(m => m.direction === 'sent').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automáticas (Bot)</p>
            <p className="text-xl font-bold text-slate-900">
              {history.filter(m => m.direction === 'bot').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
