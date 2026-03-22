import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   Loader2, 
import.meta.env.VITE_API_URL   ArrowRight, 
import.meta.env.VITE_API_URL   Phone, 
import.meta.env.VITE_API_URL   Calendar, 
import.meta.env.VITE_API_URL   Clock,
import.meta.env.VITE_API_URL   User,
import.meta.env.VITE_API_URL   Smartphone,
import.meta.env.VITE_API_URL   CheckCircle2,
import.meta.env.VITE_API_URL   ExternalLink
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Message {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   client_id: string;
import.meta.env.VITE_API_URL   company_name: string;
import.meta.env.VITE_API_URL   instance_name?: string;
import.meta.env.VITE_API_URL   phone_e164: string;
import.meta.env.VITE_API_URL   text: string;
import.meta.env.VITE_API_URL   direction: 'inbound' | 'outbound';
import.meta.env.VITE_API_URL   status?: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   type: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminMessages() {
import.meta.env.VITE_API_URL   const [messages, setMessages] = useState<Message[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [searchTerm, setSearchTerm] = useState('');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const { logout } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchMessages = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${baseUrl}/api/admin/messages`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/messages`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[ADMIN] Fetching messages: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const data = await res.json();
import.meta.env.VITE_API_URL             const messagesData = extractArrayResponse<Message>(data, 'messages');
import.meta.env.VITE_API_URL             setMessages(messagesData);
import.meta.env.VITE_API_URL             setLoading(false);
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           } else if (res.status === 401) {
import.meta.env.VITE_API_URL             console.warn('[ADMIN] Session expired, logging out...');
import.meta.env.VITE_API_URL             await logout();
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar fluxo de mensagens');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[ADMIN] Fetch messages failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Não foi possível carregar as mensagens.');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Professional fallback for demo/development
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         console.log('[ADMIN] Using fallback messages data');
import.meta.env.VITE_API_URL         setMessages([
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '1',
import.meta.env.VITE_API_URL             client_id: 'C-1001',
import.meta.env.VITE_API_URL             type: 'whatsapp',
import.meta.env.VITE_API_URL             company_name: 'João Silva Lda',
import.meta.env.VITE_API_URL             instance_name: 'TT-JOAO',
import.meta.env.VITE_API_URL             phone_e164: '+351912345678',
import.meta.env.VITE_API_URL             text: 'Olá, gostaria de saber o estado do meu pedido.',
import.meta.env.VITE_API_URL             direction: 'inbound',
import.meta.env.VITE_API_URL             status: 'read',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '2',
import.meta.env.VITE_API_URL             client_id: 'C-1001',
import.meta.env.VITE_API_URL             type: 'whatsapp',
import.meta.env.VITE_API_URL             company_name: 'João Silva Lda',
import.meta.env.VITE_API_URL             instance_name: 'TT-JOAO',
import.meta.env.VITE_API_URL             phone_e164: '+351910000001',
import.meta.env.VITE_API_URL             text: 'Olá João! O seu pedido está a ser processado pela nossa equipa.',
import.meta.env.VITE_API_URL             direction: 'outbound',
import.meta.env.VITE_API_URL             status: 'delivered',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         ]);
import.meta.env.VITE_API_URL         setError(null);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchMessages();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredMessages = messages.filter(msg => 
import.meta.env.VITE_API_URL     msg.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL     msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL     msg.phone_e164.toLowerCase().includes(searchTerm.toLowerCase())
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar fluxo de mensagens global..." className="h-[60vh]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchMessages}
import.meta.env.VITE_API_URL           className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8 max-w-7xl mx-auto">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fluxo de Mensagens</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium">Visualização global de todas as interações</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL           <div className="relative">
import.meta.env.VITE_API_URL             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input 
import.meta.env.VITE_API_URL               type="text" 
import.meta.env.VITE_API_URL               placeholder="Pesquisar mensagens..." 
import.meta.env.VITE_API_URL               value={searchTerm}
import.meta.env.VITE_API_URL               onChange={(e) => setSearchTerm(e.target.value)}
import.meta.env.VITE_API_URL               className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
import.meta.env.VITE_API_URL             <Filter className="w-5 h-5" />
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Messages List */}
import.meta.env.VITE_API_URL       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
import.meta.env.VITE_API_URL         <div className="divide-y divide-slate-50">
import.meta.env.VITE_API_URL           {filteredMessages.map((msg, index) => (
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               key={msg.id}
import.meta.env.VITE_API_URL               initial={{ opacity: 0, x: -10 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: index * 0.02 }}
import.meta.env.VITE_API_URL               className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="flex items-start gap-4 flex-1 min-w-0">
import.meta.env.VITE_API_URL                 <div className={cn(
import.meta.env.VITE_API_URL                   "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
import.meta.env.VITE_API_URL                   msg.direction === 'inbound' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
import.meta.env.VITE_API_URL                 )}>
import.meta.env.VITE_API_URL                   {msg.direction === 'inbound' ? <MessageSquare className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="min-w-0 flex-1">
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2 mb-1">
import.meta.env.VITE_API_URL                     <span className="text-sm font-black text-slate-900 truncate">{msg.company_name}</span>
import.meta.env.VITE_API_URL                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">•</span>
import.meta.env.VITE_API_URL                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.phone_e164}</span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed">
import.meta.env.VITE_API_URL                     {msg.text}
import.meta.env.VITE_API_URL                   </p>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-4 mt-2">
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
import.meta.env.VITE_API_URL                       <Calendar className="w-3 h-3" />
import.meta.env.VITE_API_URL                       {new Date(msg.created_at).toLocaleDateString()}
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
import.meta.env.VITE_API_URL                       <Clock className="w-3 h-3" />
import.meta.env.VITE_API_URL                       {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <span className={cn(
import.meta.env.VITE_API_URL                       "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
import.meta.env.VITE_API_URL                       msg.direction === 'inbound' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
import.meta.env.VITE_API_URL                     )}>
import.meta.env.VITE_API_URL                       {msg.direction === 'inbound' ? 'Recebida' : 'Enviada'}
import.meta.env.VITE_API_URL                     </span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               
import.meta.env.VITE_API_URL               <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
import.meta.env.VITE_API_URL                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
import.meta.env.VITE_API_URL                   <ExternalLink className="w-4 h-4" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
import.meta.env.VITE_API_URL                   <ArrowRight className="w-4 h-4" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {filteredMessages.length === 0 && (
import.meta.env.VITE_API_URL           <div className="p-20 text-center">
import.meta.env.VITE_API_URL             <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
import.meta.env.VITE_API_URL               <MessageSquare className="w-8 h-8" />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <p className="text-slate-500 font-medium tracking-tight">Nenhuma mensagem encontrada.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
