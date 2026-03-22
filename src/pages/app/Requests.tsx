import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   ClipboardList, 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   Plus, 
import.meta.env.VITE_API_URL   MoreVertical, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   Clock, 
import.meta.env.VITE_API_URL   AlertCircle,
import.meta.env.VITE_API_URL   ChevronRight,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   MessageSquare,
import.meta.env.VITE_API_URL   History,
import.meta.env.VITE_API_URL   FileText,
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   ShieldAlert,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   Bot,
import.meta.env.VITE_API_URL   Zap,
import.meta.env.VITE_API_URL   ChevronLeft,
import.meta.env.VITE_API_URL   Tag,
import.meta.env.VITE_API_URL   Sparkles,
import.meta.env.VITE_API_URL   Send,
import.meta.env.VITE_API_URL   LifeBuoy
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import.meta.env.VITE_API_URL import { toast } from 'sonner';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Ticket {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   tracking_code: string;
import.meta.env.VITE_API_URL   type: string;
import.meta.env.VITE_API_URL   subject: string;
import.meta.env.VITE_API_URL   description: string;
import.meta.env.VITE_API_URL   status: string;
import.meta.env.VITE_API_URL   priority: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   updated_at?: string;
import.meta.env.VITE_API_URL   category?: string;
import.meta.env.VITE_API_URL   ai_analysis?: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface TicketMessage {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   ticket_id: string;
import.meta.env.VITE_API_URL   sender_type: 'user' | 'bot' | 'agent';
import.meta.env.VITE_API_URL   text: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const SupportModal = ({ isOpen, onClose, onSubmit }: { 
import.meta.env.VITE_API_URL   isOpen: boolean; 
import.meta.env.VITE_API_URL   onClose: () => void;
import.meta.env.VITE_API_URL   onSubmit: (data: any) => Promise<void>;
import.meta.env.VITE_API_URL }) => {
import.meta.env.VITE_API_URL   const [subject, setSubject] = useState('');
import.meta.env.VITE_API_URL   const [message, setMessage] = useState('');
import.meta.env.VITE_API_URL   const [category, setCategory] = useState('Geral');
import.meta.env.VITE_API_URL   const [priority, setPriority] = useState('média');
import.meta.env.VITE_API_URL   const [isSubmitting, setIsSubmitting] = useState(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSubmit = async (e: React.FormEvent) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL     if (!subject || !message) {
import.meta.env.VITE_API_URL       toast.error('Por favor, preencha o assunto e a mensagem.');
import.meta.env.VITE_API_URL       return;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     setIsSubmitting(true);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       await onSubmit({ subject, message, category, priority });
import.meta.env.VITE_API_URL       setSubject('');
import.meta.env.VITE_API_URL       setMessage('');
import.meta.env.VITE_API_URL       onClose();
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       console.error('Error submitting support ticket:', error);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setIsSubmitting(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <AnimatePresence>
import.meta.env.VITE_API_URL       {isOpen && (
import.meta.env.VITE_API_URL         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
import.meta.env.VITE_API_URL           <motion.div
import.meta.env.VITE_API_URL             initial={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, scale: 1, y: 0 }}
import.meta.env.VITE_API_URL             exit={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                 <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
import.meta.env.VITE_API_URL                   <LifeBuoy className="w-6 h-6" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <h3 className="text-xl font-bold text-slate-900">Novo Pedido de Suporte</h3>
import.meta.env.VITE_API_URL                   <p className="text-sm text-slate-500">Como podemos ajudar hoje?</p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <button 
import.meta.env.VITE_API_URL                 onClick={onClose}
import.meta.env.VITE_API_URL                 className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <X className="w-5 h-5" />
import.meta.env.VITE_API_URL               </button>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <form onSubmit={handleSubmit} className="p-6 space-y-4">
import.meta.env.VITE_API_URL               <div className="grid grid-cols-2 gap-4">
import.meta.env.VITE_API_URL                 <div className="space-y-1.5">
import.meta.env.VITE_API_URL                   <label className="text-sm font-semibold text-slate-700">Categoria</label>
import.meta.env.VITE_API_URL                   <select
import.meta.env.VITE_API_URL                     value={category}
import.meta.env.VITE_API_URL                     onChange={(e) => setCategory(e.target.value)}
import.meta.env.VITE_API_URL                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     <option value="Geral">Geral</option>
import.meta.env.VITE_API_URL                     <option value="Financeiro">Financeiro</option>
import.meta.env.VITE_API_URL                     <option value="Técnico">Técnico</option>
import.meta.env.VITE_API_URL                     <option value="Sugestão">Sugestão</option>
import.meta.env.VITE_API_URL                   </select>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="space-y-1.5">
import.meta.env.VITE_API_URL                   <label className="text-sm font-semibold text-slate-700">Prioridade</label>
import.meta.env.VITE_API_URL                   <select
import.meta.env.VITE_API_URL                     value={priority}
import.meta.env.VITE_API_URL                     onChange={(e) => setPriority(e.target.value)}
import.meta.env.VITE_API_URL                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     <option value="baixa">Baixa</option>
import.meta.env.VITE_API_URL                     <option value="média">Média</option>
import.meta.env.VITE_API_URL                     <option value="alta">Alta</option>
import.meta.env.VITE_API_URL                     <option value="urgente">Urgente</option>
import.meta.env.VITE_API_URL                   </select>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="space-y-1.5">
import.meta.env.VITE_API_URL                 <label className="text-sm font-semibold text-slate-700">Assunto</label>
import.meta.env.VITE_API_URL                 <input
import.meta.env.VITE_API_URL                   type="text"
import.meta.env.VITE_API_URL                   value={subject}
import.meta.env.VITE_API_URL                   onChange={(e) => setSubject(e.target.value)}
import.meta.env.VITE_API_URL                   placeholder="Ex: Dúvida sobre faturas"
import.meta.env.VITE_API_URL                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="space-y-1.5">
import.meta.env.VITE_API_URL                 <label className="text-sm font-semibold text-slate-700">Mensagem detalhada</label>
import.meta.env.VITE_API_URL                 <textarea
import.meta.env.VITE_API_URL                   value={message}
import.meta.env.VITE_API_URL                   onChange={(e) => setMessage(e.target.value)}
import.meta.env.VITE_API_URL                   placeholder="Descreva o seu problema ou dúvida..."
import.meta.env.VITE_API_URL                   rows={4}
import.meta.env.VITE_API_URL                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="pt-4">
import.meta.env.VITE_API_URL                 <button
import.meta.env.VITE_API_URL                   type="submit"
import.meta.env.VITE_API_URL                   disabled={isSubmitting}
import.meta.env.VITE_API_URL                   className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   {isSubmitting ? (
import.meta.env.VITE_API_URL                     <>
import.meta.env.VITE_API_URL                       <Loader2 className="w-5 h-5 animate-spin" />
import.meta.env.VITE_API_URL                       A enviar...
import.meta.env.VITE_API_URL                     </>
import.meta.env.VITE_API_URL                   ) : (
import.meta.env.VITE_API_URL                     <>
import.meta.env.VITE_API_URL                       <Send className="w-5 h-5" />
import.meta.env.VITE_API_URL                       Enviar Mensagem
import.meta.env.VITE_API_URL                     </>
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </form>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL     </AnimatePresence>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Requests() {
import.meta.env.VITE_API_URL   const [tickets, setTickets] = useState<Ticket[]>([]);
import.meta.env.VITE_API_URL   const [selectedId, setSelectedId] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [messages, setMessages] = useState<TicketMessage[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [loadingMessages, setLoadingMessages] = useState(false);
import.meta.env.VITE_API_URL   const [analyzing, setAnalyzing] = useState(false);
import.meta.env.VITE_API_URL   const [analysis, setAnalysis] = useState<any>(null);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [filter, setFilter] = useState('Todos');
import.meta.env.VITE_API_URL   const [searchQuery, setSearchQuery] = useState('');
import.meta.env.VITE_API_URL   const [isSupportOpen, setIsSupportOpen] = useState(false);
import.meta.env.VITE_API_URL   const [internalNotes, setInternalNotes] = useState('');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchTickets = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${baseUrl}/api/client/tickets`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/tickets`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/pedidos`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[APP] Fetching tickets: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const data = await res.json();
import.meta.env.VITE_API_URL             const ticketsData = extractArrayResponse<Ticket>(data, 'tickets');
import.meta.env.VITE_API_URL             setTickets(ticketsData);
import.meta.env.VITE_API_URL             setLoading(false);
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           } else if (res.status === 401) {
import.meta.env.VITE_API_URL             throw new Error('Sessão expirada. Por favor, faça login novamente.');
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // If we reach here, all endpoints failed
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar tickets de suporte');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[APP] Fetch tickets failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Não foi possível carregar os seus pedidos.');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Professional fallback for demo/development
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         console.log('[APP] Using fallback tickets data');
import.meta.env.VITE_API_URL         setTickets([
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '1',
import.meta.env.VITE_API_URL             tracking_code: 'TRT-12345',
import.meta.env.VITE_API_URL             type: 'suporte',
import.meta.env.VITE_API_URL             subject: 'Dúvida sobre integração WhatsApp',
import.meta.env.VITE_API_URL             description: 'Como posso conectar a minha instância?',
import.meta.env.VITE_API_URL             status: 'open',
import.meta.env.VITE_API_URL             priority: 'média',
import.meta.env.VITE_API_URL             category: 'Técnico',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             ai_analysis: 'O cliente está com dificuldades na configuração inicial.'
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '2',
import.meta.env.VITE_API_URL             tracking_code: 'TRT-67890',
import.meta.env.VITE_API_URL             type: 'suporte',
import.meta.env.VITE_API_URL             subject: 'Erro na faturação mensal',
import.meta.env.VITE_API_URL             description: 'O valor cobrado está incorreto.',
import.meta.env.VITE_API_URL             status: 'resolved',
import.meta.env.VITE_API_URL             priority: 'alta',
import.meta.env.VITE_API_URL             category: 'Financeiro',
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         ]);
import.meta.env.VITE_API_URL         setError(null);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchTicketMessages = async (ticketId: string) => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const url = `${baseUrl}/api/client/tickets/${ticketId}/messages`;
import.meta.env.VITE_API_URL     console.log(`[APP] Fetching messages for ticket ${ticketId}: ${url}`);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoadingMessages(true);
import.meta.env.VITE_API_URL       setAnalysis(null); // Reset analysis when changing ticket
import.meta.env.VITE_API_URL       const res = await fetch(url, {
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (!res.ok) {
import.meta.env.VITE_API_URL         const errorData = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL         throw new Error(errorData.message || errorData.error || 'Falha ao carregar mensagens do ticket');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       const data = await res.json();
import.meta.env.VITE_API_URL       setMessages(extractArrayResponse<TicketMessage>(data, 'messages'));
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error(`[APP] Fetch ticket messages failed for ${ticketId}:`, err);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoadingMessages(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const analyzeWithAI = async (ticketId: string) => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const url = `${baseUrl}/api/client/tickets/${ticketId}/analyze`;
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setAnalyzing(true);
import.meta.env.VITE_API_URL       const res = await fetch(url, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (!res.ok) throw new Error('Falha na análise de IA');
import.meta.env.VITE_API_URL       const data = await res.json();
import.meta.env.VITE_API_URL       setAnalysis(data);
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[APP] AI Analysis failed:', err);
import.meta.env.VITE_API_URL       toast.error('Falha na análise IA.');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setAnalyzing(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleUpdateStatus = async (ticketId: string, status: string) => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL       const res = await fetch(`${baseUrl}/api/client/tickets/${ticketId}/status`, {
import.meta.env.VITE_API_URL         method: 'PATCH',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         credentials: 'include',
import.meta.env.VITE_API_URL         body: JSON.stringify({ status })
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (res.ok) {
import.meta.env.VITE_API_URL         toast.success(`Estado atualizado para ${status}`);
import.meta.env.VITE_API_URL         fetchTickets();
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         toast.error('Erro ao atualizar estado.');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       toast.error('Erro de conexão.');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSupportSubmit = async (supportData: any) => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       toast.loading('A criar o seu pedido de suporte...');
import.meta.env.VITE_API_URL       const res = await fetch(`${baseUrl}/api/client/tickets`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         credentials: 'include',
import.meta.env.VITE_API_URL         body: JSON.stringify({
import.meta.env.VITE_API_URL           subject: supportData.subject,
import.meta.env.VITE_API_URL           description: supportData.message,
import.meta.env.VITE_API_URL           category: supportData.category,
import.meta.env.VITE_API_URL           priority: supportData.priority
import.meta.env.VITE_API_URL         })
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       toast.dismiss();
import.meta.env.VITE_API_URL       const json = await res.json();
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       if (json.ok || json.ticket) {
import.meta.env.VITE_API_URL         toast.success(`Pedido criado com sucesso! Código: ${json.ticket?.tracking_code || 'N/A'}`);
import.meta.env.VITE_API_URL         fetchTickets();
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         throw new Error(json.error || 'Erro ao criar pedido');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       toast.dismiss();
import.meta.env.VITE_API_URL       console.error('[APP] Support submission failed:', err);
import.meta.env.VITE_API_URL       toast.error(err.message || 'Erro ao criar pedido de suporte.');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Fallback for demo
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         toast.info('Modo Demo: O pedido seria enviado para o suporte em produção.');
import.meta.env.VITE_API_URL         setIsSupportOpen(false);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchTickets();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     if (selectedId) {
import.meta.env.VITE_API_URL       fetchTicketMessages(selectedId);
import.meta.env.VITE_API_URL     } else {
import.meta.env.VITE_API_URL       setMessages([]);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   }, [selectedId]);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const selectedRequest = tickets.find(r => r.id === selectedId);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filters = ['Todos', 'Em aberto', 'Em análise', 'Resolvidos', 'Reclamações', 'Pedidos'];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredTickets = tickets.filter(t => {
import.meta.env.VITE_API_URL     const matchesSearch = t.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
import.meta.env.VITE_API_URL                          t.subject.toLowerCase().includes(searchQuery.toLowerCase());
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     if (filter === 'Todos') return matchesSearch;
import.meta.env.VITE_API_URL     if (filter === 'Em aberto') return matchesSearch && t.status.toLowerCase() === 'aberto';
import.meta.env.VITE_API_URL     if (filter === 'Em análise') return matchesSearch && t.status.toLowerCase() === 'em análise';
import.meta.env.VITE_API_URL     if (filter === 'Resolvidos') return matchesSearch && t.status.toLowerCase() === 'resolvido';
import.meta.env.VITE_API_URL     if (filter === 'Reclamações') return matchesSearch && t.type.toLowerCase() === 'reclamação';
import.meta.env.VITE_API_URL     if (filter === 'Pedidos') return matchesSearch && t.type.toLowerCase() === 'pedido';
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     return matchesSearch;
import.meta.env.VITE_API_URL   });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const formatDate = (dateStr: string) => {
import.meta.env.VITE_API_URL     const date = new Date(dateStr);
import.meta.env.VITE_API_URL     return date.toLocaleDateString('pt-PT', { 
import.meta.env.VITE_API_URL       day: '2-digit', 
import.meta.env.VITE_API_URL       month: 'short', 
import.meta.env.VITE_API_URL       year: 'numeric',
import.meta.env.VITE_API_URL       hour: '2-digit',
import.meta.env.VITE_API_URL       minute: '2-digit'
import.meta.env.VITE_API_URL     });
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar os seus pedidos..." className="h-[calc(100vh-10rem)]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchTickets}
import.meta.env.VITE_API_URL           className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar Novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-6">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-2xl font-display font-bold text-slate-900">Pedidos e Solicitações</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500">Acompanhe todos os tickets gerados pelo bot WhatsApp.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={() => setIsSupportOpen(true)}
import.meta.env.VITE_API_URL           className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           <Plus className="w-4 h-4" /> Novo Ticket
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Filters & Search */}
import.meta.env.VITE_API_URL       <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
import.meta.env.VITE_API_URL         <div className="flex flex-col md:flex-row gap-4">
import.meta.env.VITE_API_URL           <div className="relative flex-1">
import.meta.env.VITE_API_URL             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input 
import.meta.env.VITE_API_URL               type="text" 
import.meta.env.VITE_API_URL               placeholder="Pesquisar por código ou assunto..." 
import.meta.env.VITE_API_URL               value={searchQuery}
import.meta.env.VITE_API_URL               onChange={(e) => setSearchQuery(e.target.value)}
import.meta.env.VITE_API_URL               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
import.meta.env.VITE_API_URL             {filters.map((f) => (
import.meta.env.VITE_API_URL               <button
import.meta.env.VITE_API_URL                 key={f}
import.meta.env.VITE_API_URL                 onClick={() => setFilter(f)}
import.meta.env.VITE_API_URL                 className={cn(
import.meta.env.VITE_API_URL                   "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
import.meta.env.VITE_API_URL                   filter === f 
import.meta.env.VITE_API_URL                     ? "bg-primary text-white shadow-lg shadow-primary/20" 
import.meta.env.VITE_API_URL                     : "bg-slate-50 text-slate-600 hover:bg-slate-100"
import.meta.env.VITE_API_URL                 )}
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 {f}
import.meta.env.VITE_API_URL               </button>
import.meta.env.VITE_API_URL             ))}
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Main Table/List */}
import.meta.env.VITE_API_URL       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
import.meta.env.VITE_API_URL         <div className="overflow-x-auto">
import.meta.env.VITE_API_URL           {filteredTickets.length === 0 ? (
import.meta.env.VITE_API_URL             <div className="p-12 text-center">
import.meta.env.VITE_API_URL               <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
import.meta.env.VITE_API_URL               <p className="text-slate-500 font-medium">Nenhum pedido encontrado.</p>
import.meta.env.VITE_API_URL               <p className="text-slate-400 text-sm">Tente ajustar os filtros ou pesquisar por outro termo.</p>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           ) : (
import.meta.env.VITE_API_URL             <table className="w-full text-left min-w-[1000px]">
import.meta.env.VITE_API_URL               <thead>
import.meta.env.VITE_API_URL                 <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
import.meta.env.VITE_API_URL                   <th className="px-6 py-4">Código</th>
import.meta.env.VITE_API_URL                   <th className="px-6 py-4">Tipo</th>
import.meta.env.VITE_API_URL                   <th className="px-6 py-4">Assunto</th>
import.meta.env.VITE_API_URL                   <th className="px-6 py-4">Estado</th>
import.meta.env.VITE_API_URL                   <th className="px-6 py-4">Prioridade</th>
import.meta.env.VITE_API_URL                   <th className="px-6 py-4">Criação</th>
import.meta.env.VITE_API_URL                   <th className="px-6 py-4 text-right">Ação</th>
import.meta.env.VITE_API_URL                 </tr>
import.meta.env.VITE_API_URL               </thead>
import.meta.env.VITE_API_URL               <tbody className="divide-y divide-slate-100 text-sm">
import.meta.env.VITE_API_URL                 {filteredTickets.map((req) => (
import.meta.env.VITE_API_URL                   <tr 
import.meta.env.VITE_API_URL                     key={req.id} 
import.meta.env.VITE_API_URL                     className={cn(
import.meta.env.VITE_API_URL                       "hover:bg-slate-50 transition-colors group cursor-pointer",
import.meta.env.VITE_API_URL                       req.priority?.toLowerCase() === 'alta' && req.status?.toLowerCase() !== 'resolvido' ? "bg-red-50/30" : ""
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                     onClick={() => setSelectedId(req.id)}
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     <td className="px-6 py-4 font-mono font-bold text-slate-900">{req.tracking_code}</td>
import.meta.env.VITE_API_URL                     <td className="px-6 py-4">
import.meta.env.VITE_API_URL                       <span className={cn(
import.meta.env.VITE_API_URL                         "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
import.meta.env.VITE_API_URL                         req.type?.toLowerCase() === 'pedido' ? "bg-blue-50 text-blue-600" :
import.meta.env.VITE_API_URL                         req.type?.toLowerCase() === 'reclamação' ? "bg-red-50 text-red-600" :
import.meta.env.VITE_API_URL                         "bg-slate-100 text-slate-600"
import.meta.env.VITE_API_URL                       )}>
import.meta.env.VITE_API_URL                         {req.type}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                     </td>
import.meta.env.VITE_API_URL                     <td className="px-6 py-4 font-medium text-slate-700 max-w-xs truncate">{req.subject}</td>
import.meta.env.VITE_API_URL                     <td className="px-6 py-4">
import.meta.env.VITE_API_URL                       <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                         <div className={cn(
import.meta.env.VITE_API_URL                           "w-2 h-2 rounded-full",
import.meta.env.VITE_API_URL                           req.status?.toLowerCase() === 'aberto' ? "bg-orange-500" :
import.meta.env.VITE_API_URL                           req.status?.toLowerCase() === 'em análise' ? "bg-blue-500" :
import.meta.env.VITE_API_URL                           "bg-green-500"
import.meta.env.VITE_API_URL                         )}></div>
import.meta.env.VITE_API_URL                         <span className="font-medium text-slate-600">{req.status}</span>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                     </td>
import.meta.env.VITE_API_URL                     <td className="px-6 py-4">
import.meta.env.VITE_API_URL                       <span className={cn(
import.meta.env.VITE_API_URL                         "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
import.meta.env.VITE_API_URL                         req.priority?.toLowerCase() === 'alta' ? "bg-red-500 text-white" :
import.meta.env.VITE_API_URL                         req.priority?.toLowerCase() === 'média' ? "bg-orange-50 text-orange-600" :
import.meta.env.VITE_API_URL                         "bg-slate-100 text-slate-600"
import.meta.env.VITE_API_URL                       )}>
import.meta.env.VITE_API_URL                         {req.priority}
import.meta.env.VITE_API_URL                       </span>
import.meta.env.VITE_API_URL                     </td>
import.meta.env.VITE_API_URL                     <td className="px-6 py-4 text-xs text-slate-400">{formatDate(req.created_at).split(',')[0]}</td>
import.meta.env.VITE_API_URL                     <td className="px-6 py-4 text-right">
import.meta.env.VITE_API_URL                       <button className="p-2 text-slate-400 hover:bg-white hover:text-primary rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200">
import.meta.env.VITE_API_URL                         <ChevronRight className="w-4 h-4" />
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                     </td>
import.meta.env.VITE_API_URL                   </tr>
import.meta.env.VITE_API_URL                 ))}
import.meta.env.VITE_API_URL               </tbody>
import.meta.env.VITE_API_URL             </table>
import.meta.env.VITE_API_URL           )}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Detail Side Panel */}
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {selectedId && selectedRequest && (
import.meta.env.VITE_API_URL           <>
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               initial={{ opacity: 0 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1 }}
import.meta.env.VITE_API_URL               exit={{ opacity: 0 }}
import.meta.env.VITE_API_URL               onClick={() => setSelectedId(null)}
import.meta.env.VITE_API_URL               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               initial={{ x: '100%' }}
import.meta.env.VITE_API_URL               animate={{ x: 0 }}
import.meta.env.VITE_API_URL               exit={{ x: '100%' }}
import.meta.env.VITE_API_URL               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
import.meta.env.VITE_API_URL               className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {/* Detail Header */}
import.meta.env.VITE_API_URL               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
import.meta.env.VITE_API_URL                     <FileText className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <h2 className="font-bold text-slate-900 text-lg">{selectedRequest.tracking_code}</h2>
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-500">Detalhes do Ticket</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => setSelectedId(null)}
import.meta.env.VITE_API_URL                   className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <X className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               {/* Detail Content */}
import.meta.env.VITE_API_URL               <div className="flex-1 overflow-y-auto p-6 space-y-8">
import.meta.env.VITE_API_URL                 {/* Status & Priority Badges */}
import.meta.env.VITE_API_URL                 <div className="flex flex-wrap gap-3">
import.meta.env.VITE_API_URL                   <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
import.meta.env.VITE_API_URL                     <div className={cn(
import.meta.env.VITE_API_URL                       "w-2 h-2 rounded-full",
import.meta.env.VITE_API_URL                       selectedRequest.status.toLowerCase() === 'aberto' ? "bg-orange-500" :
import.meta.env.VITE_API_URL                       selectedRequest.status.toLowerCase() === 'em análise' ? "bg-blue-500" :
import.meta.env.VITE_API_URL                       "bg-green-500"
import.meta.env.VITE_API_URL                     )}></div>
import.meta.env.VITE_API_URL                     <span className="text-xs font-bold text-slate-700">{selectedRequest.status}</span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className={cn(
import.meta.env.VITE_API_URL                     "px-4 py-2 rounded-2xl border flex items-center gap-2",
import.meta.env.VITE_API_URL                     selectedRequest.priority?.toLowerCase() === 'alta' ? "bg-red-50 border-red-100 text-red-600" : "bg-slate-50 border-slate-100 text-slate-600"
import.meta.env.VITE_API_URL                   )}>
import.meta.env.VITE_API_URL                     <ShieldAlert className="w-3.5 h-3.5" />
import.meta.env.VITE_API_URL                     <span className="text-xs font-bold">Prioridade {selectedRequest.priority}</span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* AI Analysis Section */}
import.meta.env.VITE_API_URL                 <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
import.meta.env.VITE_API_URL                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
import.meta.env.VITE_API_URL                   <div className="relative z-10">
import.meta.env.VITE_API_URL                     <div className="flex items-center justify-between mb-4">
import.meta.env.VITE_API_URL                       <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                         <Bot className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL                         <h3 className="font-bold">Análise Inteligente</h3>
import.meta.env.VITE_API_URL                       </div>
import.meta.env.VITE_API_URL                       <button 
import.meta.env.VITE_API_URL                         onClick={() => analyzeWithAI(selectedRequest.id)}
import.meta.env.VITE_API_URL                         disabled={analyzing}
import.meta.env.VITE_API_URL                         className={cn(
import.meta.env.VITE_API_URL                           "px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2",
import.meta.env.VITE_API_URL                           analyzing && "opacity-50 cursor-not-allowed"
import.meta.env.VITE_API_URL                         )}
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
import.meta.env.VITE_API_URL                         {analyzing ? 'A analisar...' : 'Analisar com IA'}
import.meta.env.VITE_API_URL                       </button>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                     {analysis ? (
import.meta.env.VITE_API_URL                       <motion.div 
import.meta.env.VITE_API_URL                         initial={{ opacity: 0, y: 10 }}
import.meta.env.VITE_API_URL                         animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL                         className="space-y-4"
import.meta.env.VITE_API_URL                       >
import.meta.env.VITE_API_URL                         <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                           <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Resumo</p>
import.meta.env.VITE_API_URL                           <p className="text-xs text-slate-300 leading-relaxed">{analysis?.summary}</p>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                         <div className="grid grid-cols-2 gap-3">
import.meta.env.VITE_API_URL                           <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                             <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Causa Provável</p>
import.meta.env.VITE_API_URL                             <p className="text-xs text-slate-300">{analysis?.probable_cause}</p>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                           <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                             <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Sentimento</p>
import.meta.env.VITE_API_URL                             <p className="text-xs text-slate-300 capitalize">{analysis?.sentiment}</p>
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                         <div className="p-3 bg-white/5 rounded-xl border border-white/10">
import.meta.env.VITE_API_URL                           <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Solução Sugerida</p>
import.meta.env.VITE_API_URL                           <p className="text-xs text-slate-300 leading-relaxed">{analysis?.suggested_solution}</p>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                         <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
import.meta.env.VITE_API_URL                           <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Próximos Passos</p>
import.meta.env.VITE_API_URL                           <div className="flex flex-wrap gap-1.5 mt-2">
import.meta.env.VITE_API_URL                             {Array.isArray(analysis?.next_steps) ? analysis?.next_steps.map((step: string, i: number) => (
import.meta.env.VITE_API_URL                               <span key={i} className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] text-emerald-100 border border-white/5">
import.meta.env.VITE_API_URL                                 {step}
import.meta.env.VITE_API_URL                               </span>
import.meta.env.VITE_API_URL                             )) : <p className="text-xs text-emerald-100">{analysis?.next_steps}</p>}
import.meta.env.VITE_API_URL                           </div>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                       </motion.div>
import.meta.env.VITE_API_URL                     ) : (
import.meta.env.VITE_API_URL                       <p className="text-xs text-slate-400 italic">
import.meta.env.VITE_API_URL                         Clica no botão para obter uma análise detalhada deste ticket utilizando Inteligência Artificial.
import.meta.env.VITE_API_URL                       </p>
import.meta.env.VITE_API_URL                     )}
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Info Grid */}
import.meta.env.VITE_API_URL                 <div className="grid grid-cols-2 gap-6">
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
import.meta.env.VITE_API_URL                     <p className="text-sm font-bold text-slate-900">{selectedRequest.type}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div>
import.meta.env.VITE_API_URL                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Criação</p>
import.meta.env.VITE_API_URL                     <p className="text-sm font-bold text-slate-900">{formatDate(selectedRequest.created_at)}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Description */}
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assunto & Descrição</p>
import.meta.env.VITE_API_URL                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
import.meta.env.VITE_API_URL                     <p className="font-bold text-slate-900 mb-2">{selectedRequest.subject}</p>
import.meta.env.VITE_API_URL                     <p className="text-sm text-slate-600 leading-relaxed">{selectedRequest.description}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Associated Messages */}
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2 mb-4">
import.meta.env.VITE_API_URL                     <MessageSquare className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mensagens Associadas</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   {loadingMessages ? (
import.meta.env.VITE_API_URL                     <div className="flex justify-center py-4">
import.meta.env.VITE_API_URL                       <Loader2 className="w-6 h-6 text-primary animate-spin" />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   ) : messages.length > 0 ? (
import.meta.env.VITE_API_URL                     <div className="space-y-3">
import.meta.env.VITE_API_URL                       {messages.map((m) => (
import.meta.env.VITE_API_URL                         <div key={m.id} className={cn(
import.meta.env.VITE_API_URL                           "p-3 rounded-xl text-xs max-w-[90%]",
import.meta.env.VITE_API_URL                           m.sender_type === 'user' ? "bg-slate-100 text-slate-700" : "bg-primary text-white ml-auto"
import.meta.env.VITE_API_URL                         )}>
import.meta.env.VITE_API_URL                           <p>{m.text}</p>
import.meta.env.VITE_API_URL                           <p className={cn("text-[8px] mt-1 text-right", m.sender_type === 'user' ? "text-slate-400" : "text-white/60")}>
import.meta.env.VITE_API_URL                             {formatDate(m.created_at).split(',')[1]?.trim() || formatDate(m.created_at)}
import.meta.env.VITE_API_URL                           </p>
import.meta.env.VITE_API_URL                         </div>
import.meta.env.VITE_API_URL                       ))}
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   ) : (
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-400 italic">Nenhuma mensagem associada a este ticket.</p>
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 {/* Observations */}
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Observações Internas</p>
import.meta.env.VITE_API_URL                   <textarea 
import.meta.env.VITE_API_URL                     value={internalNotes}
import.meta.env.VITE_API_URL                     onChange={(e) => setInternalNotes(e.target.value)}
import.meta.env.VITE_API_URL                     placeholder="Adicione uma nota interna..."
import.meta.env.VITE_API_URL                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-primary min-h-[100px] transition-all"
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                   <div className="mt-2 flex justify-end">
import.meta.env.VITE_API_URL                     <button 
import.meta.env.VITE_API_URL                       onClick={() => {
import.meta.env.VITE_API_URL                         toast.success('Observações guardadas com sucesso.');
import.meta.env.VITE_API_URL                       }}
import.meta.env.VITE_API_URL                       className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       Guardar Notas
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               {/* Detail Footer */}
import.meta.env.VITE_API_URL               <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => handleUpdateStatus(selectedRequest.id, 'resolvido')}
import.meta.env.VITE_API_URL                   className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Resolver Pedido
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => handleUpdateStatus(selectedRequest.id, 'em análise')}
import.meta.env.VITE_API_URL                   className="px-4 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Alterar Estado
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <SupportModal 
import.meta.env.VITE_API_URL         isOpen={isSupportOpen} 
import.meta.env.VITE_API_URL         onClose={() => setIsSupportOpen(false)}
import.meta.env.VITE_API_URL         onSubmit={handleSupportSubmit}
import.meta.env.VITE_API_URL       />
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
