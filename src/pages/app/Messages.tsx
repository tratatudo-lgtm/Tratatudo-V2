import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   MoreHorizontal, 
import.meta.env.VITE_API_URL   User, 
import.meta.env.VITE_API_URL   Smartphone, 
import.meta.env.VITE_API_URL   Bot, 
import.meta.env.VITE_API_URL   MessageCircle, 
import.meta.env.VITE_API_URL   Send, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   Clock, 
import.meta.env.VITE_API_URL   AlertCircle,
import.meta.env.VITE_API_URL   ChevronRight,
import.meta.env.VITE_API_URL   ArrowLeft,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   X
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { supabase } from '../../lib/supabase';
import.meta.env.VITE_API_URL import { useAuth } from '../../lib/auth/AuthContext';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Conversation {
import.meta.env.VITE_API_URL   phone_e164: string;
import.meta.env.VITE_API_URL   lastMsg: string;
import.meta.env.VITE_API_URL   time: string;
import.meta.env.VITE_API_URL   direction: string;
import.meta.env.VITE_API_URL   type: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Message {
import.meta.env.VITE_API_URL   text: string;
import.meta.env.VITE_API_URL   direction: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   phone_e164: string;
import.meta.env.VITE_API_URL   type?: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Messages() {
import.meta.env.VITE_API_URL   const [conversations, setConversations] = useState<Conversation[]>([]);
import.meta.env.VITE_API_URL   const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [history, setHistory] = useState<Message[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [loadingHistory, setLoadingHistory] = useState(false);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [filter, setFilter] = useState('Todas');
import.meta.env.VITE_API_URL   const [isMobileListOpen, setIsMobileListOpen] = useState(true);
import.meta.env.VITE_API_URL   const [newMessage, setNewMessage] = useState('');
import.meta.env.VITE_API_URL   const [sending, setSending] = useState(false);
import.meta.env.VITE_API_URL   const [summarizing, setSummarizing] = useState(false);
import.meta.env.VITE_API_URL   const [chatSummary, setChatSummary] = useState<any>(null);
import.meta.env.VITE_API_URL   const { user } = useAuth();
import.meta.env.VITE_API_URL   const clientId = user?.client_id;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchConversations = async () => {
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${import.meta.env.VITE_API_URL}/api/client/messages`,
import.meta.env.VITE_API_URL       `${import.meta.env.VITE_API_URL}/api/messages`,
import.meta.env.VITE_API_URL       `${import.meta.env.VITE_API_URL}/api/messages/conversations`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[APP] Fetching conversations: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const data = await res.json();
import.meta.env.VITE_API_URL             const extracted = extractArrayResponse<Conversation>(data, 'messages');
import.meta.env.VITE_API_URL             setConversations(extracted);
import.meta.env.VITE_API_URL             // Don't auto-select on mobile to keep list open
import.meta.env.VITE_API_URL             if (extracted.length > 0 && !selectedPhone && window.innerWidth > 1024) {
import.meta.env.VITE_API_URL               setSelectedPhone(extracted[0].phone_e164);
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL             setLoading(false);
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar conversas');
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[APP] Fetch conversations failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Erro desconhecido');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchHistory = async (phone: string) => {
import.meta.env.VITE_API_URL     const url = `${import.meta.env.VITE_API_URL}/api/client/messages/history/${encodeURIComponent(phone)}`;
import.meta.env.VITE_API_URL     console.log(`[APP] Fetching history for ${phone}: ${url}`);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoadingHistory(true);
import.meta.env.VITE_API_URL       setChatSummary(null); // Reset summary when changing conversation
import.meta.env.VITE_API_URL       const res = await fetch(url, {
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (!res.ok) {
import.meta.env.VITE_API_URL         const errorData = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL         throw new Error(errorData.message || errorData.error || 'Falha ao carregar histórico');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       const data = await res.json();
import.meta.env.VITE_API_URL       setHistory(extractArrayResponse<Message>(data, 'messages'));
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error(`[APP] Fetch history failed for ${phone}:`, err);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoadingHistory(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const summarizeChat = async () => {
import.meta.env.VITE_API_URL     if (!selectedPhone || summarizing) return;
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setSummarizing(true);
import.meta.env.VITE_API_URL       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/client/ai/summarize-chat`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({ phone: selectedPhone }),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (res.ok) {
import.meta.env.VITE_API_URL         const data = await res.json();
import.meta.env.VITE_API_URL         setChatSummary(data);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       console.error("[APP] Chat summary failed:", err);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setSummarizing(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSendMessage = async (e: React.FormEvent) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL     if (!selectedPhone || !newMessage.trim() || sending) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setSending(true);
import.meta.env.VITE_API_URL       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/client/messages/send`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({ phone: selectedPhone, text: newMessage }),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (!res.ok) {
import.meta.env.VITE_API_URL         const err = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL         throw new Error(err.error || 'Falha ao enviar mensagem');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const data = await res.json();
import.meta.env.VITE_API_URL       setHistory(prev => [...prev, data.message]);
import.meta.env.VITE_API_URL       setNewMessage('');
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[APP] Send message failed:', err);
import.meta.env.VITE_API_URL       alert(err.message);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setSending(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchConversations();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     if (selectedPhone) {
import.meta.env.VITE_API_URL       fetchHistory(selectedPhone);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }, [selectedPhone]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     if (!clientId) return;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     const channel = supabase
import.meta.env.VITE_API_URL       .channel('wa_messages_realtime')
import.meta.env.VITE_API_URL       .on(
import.meta.env.VITE_API_URL         'postgres_changes',
import.meta.env.VITE_API_URL         {
import.meta.env.VITE_API_URL           event: 'INSERT',
import.meta.env.VITE_API_URL           schema: 'public',
import.meta.env.VITE_API_URL           table: 'wa_messages',
import.meta.env.VITE_API_URL           filter: `client_id=eq.${clientId}`,
import.meta.env.VITE_API_URL         },
import.meta.env.VITE_API_URL         (payload) => {
import.meta.env.VITE_API_URL           const newMessage = payload.new as Message;
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           // 1. Update history if it's the current conversation
import.meta.env.VITE_API_URL           if (selectedPhone === newMessage.phone_e164) {
import.meta.env.VITE_API_URL             setHistory((prev) => {
import.meta.env.VITE_API_URL               // Avoid duplicates if fetchHistory is also running
import.meta.env.VITE_API_URL               if (prev.some(m => m.created_at === newMessage.created_at && m.text === newMessage.text)) {
import.meta.env.VITE_API_URL                 return prev;
import.meta.env.VITE_API_URL               }
import.meta.env.VITE_API_URL               return [...prev, newMessage];
import.meta.env.VITE_API_URL             });
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           // 2. Update conversation list
import.meta.env.VITE_API_URL           setConversations((prev) => {
import.meta.env.VITE_API_URL             const index = prev.findIndex((c) => c.phone_e164 === newMessage.phone_e164);
import.meta.env.VITE_API_URL             const updatedConv: Conversation = {
import.meta.env.VITE_API_URL               phone_e164: newMessage.phone_e164,
import.meta.env.VITE_API_URL               lastMsg: newMessage.text,
import.meta.env.VITE_API_URL               time: newMessage.created_at,
import.meta.env.VITE_API_URL               direction: newMessage.direction,
import.meta.env.VITE_API_URL               type: newMessage.type || 'Mensagem',
import.meta.env.VITE_API_URL             };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             if (index !== -1) {
import.meta.env.VITE_API_URL               // Move to top and update
import.meta.env.VITE_API_URL               const newConvs = [...prev];
import.meta.env.VITE_API_URL               newConvs.splice(index, 1);
import.meta.env.VITE_API_URL               return [updatedConv, ...newConvs];
import.meta.env.VITE_API_URL             } else {
import.meta.env.VITE_API_URL               // New conversation, add to top
import.meta.env.VITE_API_URL               return [updatedConv, ...prev];
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       )
import.meta.env.VITE_API_URL       .subscribe();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     return () => {
import.meta.env.VITE_API_URL       supabase.removeChannel(channel);
import.meta.env.VITE_API_URL     };
import.meta.env.VITE_API_URL   }, [clientId, selectedPhone]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const selectedConv = conversations.find(c => c.phone_e164 === selectedPhone);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filters = ['Todas', 'Recebidas', 'Enviadas', 'Pedidos', 'Reclamações'];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const formatTime = (dateStr: string) => {
import.meta.env.VITE_API_URL     const date = new Date(dateStr);
import.meta.env.VITE_API_URL     const now = new Date();
import.meta.env.VITE_API_URL     const diff = now.getTime() - date.getTime();
import.meta.env.VITE_API_URL     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
import.meta.env.VITE_API_URL     if (days === 1) return 'Ontem';
import.meta.env.VITE_API_URL     if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
import.meta.env.VITE_API_URL     return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar as suas conversas..." className="h-[calc(100vh-10rem)]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchConversations}
import.meta.env.VITE_API_URL           className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar Novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="h-[calc(100vh-10rem)] flex flex-col space-y-4">
import.meta.env.VITE_API_URL       {/* Search & Filter Header */}
import.meta.env.VITE_API_URL       <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
import.meta.env.VITE_API_URL         <div className="relative w-full md:w-96">
import.meta.env.VITE_API_URL           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL           <input 
import.meta.env.VITE_API_URL             type="text" 
import.meta.env.VITE_API_URL             placeholder="Pesquisar por número ou texto..." 
import.meta.env.VITE_API_URL             className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
import.meta.env.VITE_API_URL           />
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
import.meta.env.VITE_API_URL           {filters.map((f) => (
import.meta.env.VITE_API_URL             <button
import.meta.env.VITE_API_URL               key={f}
import.meta.env.VITE_API_URL               onClick={() => setFilter(f)}
import.meta.env.VITE_API_URL               className={cn(
import.meta.env.VITE_API_URL                 "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
import.meta.env.VITE_API_URL                 filter === f 
import.meta.env.VITE_API_URL                   ? "bg-primary text-white shadow-lg shadow-primary/20" 
import.meta.env.VITE_API_URL                   : "bg-slate-50 text-slate-600 hover:bg-slate-100"
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {f}
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="flex-1 flex bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
import.meta.env.VITE_API_URL         {/* Conversation List */}
import.meta.env.VITE_API_URL         <div className={cn(
import.meta.env.VITE_API_URL           "w-full lg:w-96 border-r border-slate-100 flex flex-col transition-all duration-300 absolute lg:relative inset-0 z-20 bg-white",
import.meta.env.VITE_API_URL           !isMobileListOpen && "-translate-x-full lg:translate-x-0"
import.meta.env.VITE_API_URL         )}>
import.meta.env.VITE_API_URL           <div className="p-4 border-b border-slate-100 flex justify-between items-center">
import.meta.env.VITE_API_URL             <h2 className="font-bold text-slate-900">Conversas Recentes</h2>
import.meta.env.VITE_API_URL             <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {conversations.length}</span>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
import.meta.env.VITE_API_URL             {conversations.length === 0 ? (
import.meta.env.VITE_API_URL               <div className="p-8 text-center">
import.meta.env.VITE_API_URL                 <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
import.meta.env.VITE_API_URL                 <p className="text-slate-400 text-sm">Nenhuma conversa encontrada.</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             ) : (
import.meta.env.VITE_API_URL               conversations.map((conv) => (
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   key={conv.phone_e164} 
import.meta.env.VITE_API_URL                   onClick={() => {
import.meta.env.VITE_API_URL                     setSelectedPhone(conv.phone_e164);
import.meta.env.VITE_API_URL                     setIsMobileListOpen(false);
import.meta.env.VITE_API_URL                   }}
import.meta.env.VITE_API_URL                   className={cn(
import.meta.env.VITE_API_URL                     "w-full p-4 flex gap-4 hover:bg-slate-50 transition-all text-left group relative",
import.meta.env.VITE_API_URL                     selectedPhone === conv.phone_e164 ? "bg-slate-50" : ""
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
import.meta.env.VITE_API_URL                     <User className="w-6 h-6" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="flex-1 min-w-0">
import.meta.env.VITE_API_URL                     <div className="flex justify-between items-center mb-1">
import.meta.env.VITE_API_URL                       <p className="font-bold text-sm text-slate-900 truncate">{conv.phone_e164}</p>
import.meta.env.VITE_API_URL                       <span className="text-[10px] text-slate-400 font-medium">{formatTime(conv.time)}</span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-500 truncate leading-relaxed">{conv.lastMsg}</p>
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-2 mt-2">
import.meta.env.VITE_API_URL                       <span className={cn(
import.meta.env.VITE_API_URL                         "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
import.meta.env.VITE_API_URL                         conv.type === 'Pedido' ? "bg-blue-50 text-blue-600" :
import.meta.env.VITE_API_URL                         conv.type === 'Reclamação' ? "bg-red-50 text-red-600" :
import.meta.env.VITE_API_URL                         "bg-slate-100 text-slate-600"
import.meta.env.VITE_API_URL                       )}>
import.meta.env.VITE_API_URL                         {conv.type}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               ))
import.meta.env.VITE_API_URL             )}
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Chat Detail Panel */}
import.meta.env.VITE_API_URL         <div className={cn(
import.meta.env.VITE_API_URL           "flex-1 flex flex-col bg-slate-50/30 z-10 transition-all duration-300",
import.meta.env.VITE_API_URL           isMobileListOpen ? "hidden lg:flex" : "flex"
import.meta.env.VITE_API_URL         )}>
import.meta.env.VITE_API_URL           {selectedPhone ? (
import.meta.env.VITE_API_URL             <>
import.meta.env.VITE_API_URL               {/* Chat Header */}
import.meta.env.VITE_API_URL               <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <button 
import.meta.env.VITE_API_URL                     onClick={() => setIsMobileListOpen(true)}
import.meta.env.VITE_API_URL                     className="lg:hidden p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-lg"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     <ArrowLeft className="w-5 h-5" />
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
import.meta.env.VITE_API_URL                     <User className="w-5 h-5" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                       <p className="font-bold text-sm text-slate-900">{selectedPhone}</p>
import.meta.env.VITE_API_URL                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <p className="text-[10px] text-slate-500 font-mono">WhatsApp Ativo</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                   <button 
import.meta.env.VITE_API_URL                     onClick={summarizeChat}
import.meta.env.VITE_API_URL                     disabled={summarizing}
import.meta.env.VITE_API_URL                     className={cn(
import.meta.env.VITE_API_URL                       "flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all shadow-sm",
import.meta.env.VITE_API_URL                       summarizing && "opacity-50"
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     {summarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3 text-primary" />}
import.meta.env.VITE_API_URL                     {summarizing ? 'A resumir...' : 'Resumo IA'}
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                   <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
import.meta.env.VITE_API_URL                     <Smartphone className="w-5 h-5" />
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                   <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
import.meta.env.VITE_API_URL                     <MoreHorizontal className="w-5 h-5" />
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               {/* Messages Area */}
import.meta.env.VITE_API_URL               <div className="flex-1 p-6 overflow-y-auto space-y-6">
import.meta.env.VITE_API_URL                 {/* AI Summary Card */}
import.meta.env.VITE_API_URL                 <AnimatePresence>
import.meta.env.VITE_API_URL                   {chatSummary && (
import.meta.env.VITE_API_URL                     <motion.div 
import.meta.env.VITE_API_URL                       initial={{ opacity: 0, height: 0 }}
import.meta.env.VITE_API_URL                       animate={{ opacity: 1, height: 'auto' }}
import.meta.env.VITE_API_URL                       exit={{ opacity: 0, height: 0 }}
import.meta.env.VITE_API_URL                       className="mb-6"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-lg border border-primary/20 relative overflow-hidden">
import.meta.env.VITE_API_URL                         <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
import.meta.env.VITE_API_URL                         <div className="flex items-center justify-between mb-3">
import.meta.env.VITE_API_URL                           <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                             <Bot className="w-4 h-4 text-primary" />
import.meta.env.VITE_API_URL                             <span className="text-[10px] font-bold uppercase tracking-widest">Resumo da Conversa</span>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                           <button onClick={() => setChatSummary(null)} className="text-slate-500 hover:text-white transition-colors">
import.meta.env.VITE_API_URL                             <X className="w-4 h-4" />
import.meta.env.VITE_API_URL                           </button>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                         <div className="space-y-3">
import.meta.env.VITE_API_URL                           <p className="text-xs text-slate-300 leading-relaxed">{chatSummary?.summary}</p>
import.meta.env.VITE_API_URL                           <div className="grid grid-cols-2 gap-3">
import.meta.env.VITE_API_URL                             <div className="p-2 bg-white/5 rounded-lg border border-white/10">
import.meta.env.VITE_API_URL                               <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">Problema Principal</p>
import.meta.env.VITE_API_URL                               <p className="text-[10px] text-slate-300">{chatSummary?.main_issue}</p>
import.meta.env.VITE_API_URL                             </div>
import.meta.env.VITE_API_URL                             <div className="p-2 bg-white/5 rounded-lg border border-white/10">
import.meta.env.VITE_API_URL                               <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">Sentimento</p>
import.meta.env.VITE_API_URL                               <p className="text-[10px] text-slate-300">{chatSummary?.sentiment}</p>
import.meta.env.VITE_API_URL                             </div>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                           <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
import.meta.env.VITE_API_URL                             <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">Sugestão de Resposta</p>
import.meta.env.VITE_API_URL                             <p className="text-[10px] text-slate-200 italic">"{chatSummary?.suggested_reply}"</p>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                     </motion.div>
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 </AnimatePresence>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {loadingHistory ? (
import.meta.env.VITE_API_URL                   <div className="flex justify-center py-12">
import.meta.env.VITE_API_URL                     <Loader2 className="w-8 h-8 text-primary animate-spin" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 ) : history.length === 0 ? (
import.meta.env.VITE_API_URL                   <div className="text-center py-12">
import.meta.env.VITE_API_URL                     <p className="text-slate-400 text-sm italic">Nenhuma mensagem nesta conversa.</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 ) : (
import.meta.env.VITE_API_URL                   history.map((msg, idx) => (
import.meta.env.VITE_API_URL                     <motion.div 
import.meta.env.VITE_API_URL                       key={idx}
import.meta.env.VITE_API_URL                       initial={{ opacity: 0, y: 10 }}
import.meta.env.VITE_API_URL                       animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL                       className={cn(
import.meta.env.VITE_API_URL                         "flex gap-3 max-w-[85%] lg:max-w-[70%]",
import.meta.env.VITE_API_URL                         msg.direction === 'received' ? "" : "ml-auto flex-row-reverse"
import.meta.env.VITE_API_URL                       )}
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <div className={cn(
import.meta.env.VITE_API_URL                         "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-sm",
import.meta.env.VITE_API_URL                         msg.direction === 'received' ? "bg-white text-slate-400 border border-slate-100" : "bg-primary text-white"
import.meta.env.VITE_API_URL                       )}>
import.meta.env.VITE_API_URL                         {msg.direction === 'received' ? <User className="w-4 h-4" /> : (msg.direction === 'bot' ? <Bot className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />)}
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                       <div className="space-y-1">
import.meta.env.VITE_API_URL                         <div className={cn(
import.meta.env.VITE_API_URL                           "p-4 rounded-2xl shadow-sm relative",
import.meta.env.VITE_API_URL                           msg.direction === 'received' 
import.meta.env.VITE_API_URL                             ? "bg-white border border-slate-100 rounded-tl-none" 
import.meta.env.VITE_API_URL                             : "bg-primary text-white rounded-tr-none"
import.meta.env.VITE_API_URL                         )}>
import.meta.env.VITE_API_URL                           {msg.type && (
import.meta.env.VITE_API_URL                             <span className={cn(
import.meta.env.VITE_API_URL                               "absolute -top-2 right-4 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shadow-sm",
import.meta.env.VITE_API_URL                               msg.type === 'Pedido' ? "bg-blue-500 text-white" : "bg-slate-700 text-white"
import.meta.env.VITE_API_URL                             )}>
import.meta.env.VITE_API_URL                               {msg.type}
import.meta.env.VITE_API_URL                             </span>
import.meta.env.VITE_API_URL                           )}
import.meta.env.VITE_API_URL                           <p className="text-sm leading-relaxed">{msg.text}</p>
import.meta.env.VITE_API_URL                           <div className={cn(
import.meta.env.VITE_API_URL                             "flex items-center gap-1 mt-2 justify-end",
import.meta.env.VITE_API_URL                             msg.direction === 'received' ? "text-slate-400" : "text-white/60"
import.meta.env.VITE_API_URL                           )}>
import.meta.env.VITE_API_URL                             <span className="text-[9px] font-medium">{formatTime(msg.created_at)}</span>
import.meta.env.VITE_API_URL                             {msg.direction !== 'received' && <CheckCircle2 className="w-3 h-3" />}
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                     </motion.div>
import.meta.env.VITE_API_URL                   ))
import.meta.env.VITE_API_URL                 )}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               {/* Input Area */}
import.meta.env.VITE_API_URL               <div className="p-4 bg-white border-t border-slate-100">
import.meta.env.VITE_API_URL                 <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="text"
import.meta.env.VITE_API_URL                     value={newMessage}
import.meta.env.VITE_API_URL                     onChange={(e) => setNewMessage(e.target.value)}
import.meta.env.VITE_API_URL                     placeholder="Escreva a sua mensagem..."
import.meta.env.VITE_API_URL                     className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
import.meta.env.VITE_API_URL                     disabled={sending}
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                   <button 
import.meta.env.VITE_API_URL                     type="submit"
import.meta.env.VITE_API_URL                     disabled={sending || !newMessage.trim()}
import.meta.env.VITE_API_URL                     className="bg-primary text-white p-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </form>
import.meta.env.VITE_API_URL                 <div className="mt-2 flex justify-between items-center px-2">
import.meta.env.VITE_API_URL                   <p className="text-[10px] text-slate-400 italic">
import.meta.env.VITE_API_URL                     O bot está a processar esta conversa automaticamente. Intervenha se necessário.
import.meta.env.VITE_API_URL                   </p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </>
import.meta.env.VITE_API_URL           ) : (
import.meta.env.VITE_API_URL             <div className="flex-1 flex items-center justify-center p-12 text-center">
import.meta.env.VITE_API_URL               <div>
import.meta.env.VITE_API_URL                 <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
import.meta.env.VITE_API_URL                   <MessageCircle className="w-10 h-10" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <h3 className="text-lg font-bold text-slate-900 mb-2">Selecione uma conversa</h3>
import.meta.env.VITE_API_URL                 <p className="text-slate-500 text-sm max-w-xs mx-auto">
import.meta.env.VITE_API_URL                   Escolha um contacto na lista lateral para visualizar o histórico de mensagens.
import.meta.env.VITE_API_URL                 </p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           )}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Visual Indicators Summary */}
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
import.meta.env.VITE_API_URL         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
import.meta.env.VITE_API_URL           <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
import.meta.env.VITE_API_URL             <MessageCircle className="w-5 h-5" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recebidas</p>
import.meta.env.VITE_API_URL             <p className="text-xl font-bold text-slate-900">
import.meta.env.VITE_API_URL               {history.filter(m => m.direction === 'received').length}
import.meta.env.VITE_API_URL             </p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
import.meta.env.VITE_API_URL           <div className="bg-green-50 text-green-600 p-3 rounded-xl">
import.meta.env.VITE_API_URL             <Send className="w-5 h-5" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enviadas</p>
import.meta.env.VITE_API_URL             <p className="text-xl font-bold text-slate-900">
import.meta.env.VITE_API_URL               {history.filter(m => m.direction === 'sent').length}
import.meta.env.VITE_API_URL             </p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
import.meta.env.VITE_API_URL           <div className="bg-primary/10 text-primary p-3 rounded-xl">
import.meta.env.VITE_API_URL             <Bot className="w-5 h-5" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automáticas (Bot)</p>
import.meta.env.VITE_API_URL             <p className="text-xl font-bold text-slate-900">
import.meta.env.VITE_API_URL               {history.filter(m => m.direction === 'bot').length}
import.meta.env.VITE_API_URL             </p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
