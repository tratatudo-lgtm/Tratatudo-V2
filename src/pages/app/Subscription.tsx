import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   CreditCard, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   AlertCircle, 
import.meta.env.VITE_API_URL   Zap, 
import.meta.env.VITE_API_URL   Shield, 
import.meta.env.VITE_API_URL   Globe, 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   HelpCircle,
import.meta.env.VITE_API_URL   Clock,
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   Send,
import.meta.env.VITE_API_URL   LifeBuoy,
import.meta.env.VITE_API_URL   ExternalLink
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { toast } from 'sonner';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface SubscriptionData {
import.meta.env.VITE_API_URL   plan: string;
import.meta.env.VITE_API_URL   status: string;
import.meta.env.VITE_API_URL   started_at: string;
import.meta.env.VITE_API_URL   ends_at: string | null;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface UsageData {
import.meta.env.VITE_API_URL   messages: number;
import.meta.env.VITE_API_URL   tickets: number;
import.meta.env.VITE_API_URL   complaints: number;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const BASE_URL = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL function toNumber(value: unknown): number {
import.meta.env.VITE_API_URL   const n = Number(value);
import.meta.env.VITE_API_URL   return Number.isFinite(n) ? n : 0;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL function normalizeSubscriptionResponse(json: any): { subscription: SubscriptionData; usage: UsageData } {
import.meta.env.VITE_API_URL   const rawSubscription = json?.subscription || json?.data?.subscription || json?.data || {};
import.meta.env.VITE_API_URL   const rawUsage = json?.usage || json?.stats || json?.metrics || {};
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const subscription: SubscriptionData = {
import.meta.env.VITE_API_URL     plan: rawSubscription?.plan || rawSubscription?.name || 'Sem plano',
import.meta.env.VITE_API_URL     status: rawSubscription?.status || 'Desconhecido',
import.meta.env.VITE_API_URL     started_at: rawSubscription?.started_at || rawSubscription?.created_at || new Date().toISOString(),
import.meta.env.VITE_API_URL     ends_at: rawSubscription?.ends_at || rawSubscription?.renews_at || rawSubscription?.expires_at || null
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const usage: UsageData = {
import.meta.env.VITE_API_URL     messages: toNumber(rawUsage?.messages || rawUsage?.totalMessages || rawUsage?.total_messages),
import.meta.env.VITE_API_URL     tickets: toNumber(rawUsage?.tickets || rawUsage?.totalTickets || rawUsage?.total_tickets),
import.meta.env.VITE_API_URL     complaints: toNumber(rawUsage?.complaints || rawUsage?.total_complaints)
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return { subscription, usage };
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
import.meta.env.VITE_API_URL                   <h3 className="text-xl font-bold text-slate-900">Suporte TrataTudo</h3>
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
import.meta.env.VITE_API_URL const PaymentMethodsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <AnimatePresence>
import.meta.env.VITE_API_URL       {isOpen && (
import.meta.env.VITE_API_URL         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
import.meta.env.VITE_API_URL           <motion.div
import.meta.env.VITE_API_URL             initial={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, scale: 1, y: 0 }}
import.meta.env.VITE_API_URL             exit={{ opacity: 0, scale: 0.95, y: 20 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                 <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
import.meta.env.VITE_API_URL                   <CreditCard className="w-6 h-6" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <h3 className="text-xl font-bold text-slate-900">Métodos de Pagamento</h3>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
import.meta.env.VITE_API_URL                 <X className="w-5 h-5" />
import.meta.env.VITE_API_URL               </button>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="p-8 text-center space-y-6">
import.meta.env.VITE_API_URL               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
import.meta.env.VITE_API_URL                 <Shield className="w-8 h-8 text-slate-300" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="space-y-2">
import.meta.env.VITE_API_URL                 <p className="text-slate-900 font-bold">Portal de Faturação Seguro</p>
import.meta.env.VITE_API_URL                 <p className="text-slate-600 text-sm leading-relaxed">
import.meta.env.VITE_API_URL                   Para sua segurança, a gestão de cartões e faturas é feita exclusivamente através do Portal Stripe.
import.meta.env.VITE_API_URL                 </p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="pt-2">
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => {
import.meta.env.VITE_API_URL                     toast.info('A redirecionar para o Portal Stripe...');
import.meta.env.VITE_API_URL                     setTimeout(() => {
import.meta.env.VITE_API_URL                       toast.success('Portal Stripe aberto numa nova janela.');
import.meta.env.VITE_API_URL                       onClose();
import.meta.env.VITE_API_URL                     }, 1500);
import.meta.env.VITE_API_URL                   }}
import.meta.env.VITE_API_URL                   className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Ir para Portal Stripe
import.meta.env.VITE_API_URL                   <ExternalLink className="w-4 h-4" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <p className="mt-4 text-xs text-slate-400">
import.meta.env.VITE_API_URL                   Será aberto o portal seguro de faturação numa sessão autenticada.
import.meta.env.VITE_API_URL                 </p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL     </AnimatePresence>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export default function Subscription() {
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [data, setData] = useState<{ subscription: SubscriptionData; usage: UsageData } | null>(null);
import.meta.env.VITE_API_URL   const [isSupportOpen, setIsSupportOpen] = useState(false);
import.meta.env.VITE_API_URL   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchSubscription();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchSubscription = async () => {
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${BASE_URL}/api/client/subscription`,
import.meta.env.VITE_API_URL       `${BASE_URL}/api/subscription`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[SUBSCRIPTION] Fetching from: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const json = await res.json();
import.meta.env.VITE_API_URL             console.log('[SUBSCRIPTION] Data received:', json);
import.meta.env.VITE_API_URL             setData(normalizeSubscriptionResponse(json));
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
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar dados de subscrição');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[SUBSCRIPTION] Fetch failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Não foi possível carregar os dados da sua subscrição.');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSupportSubmit = async (supportData: any) => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const res = await fetch(`${BASE_URL}/api/client/tickets`, {
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
import.meta.env.VITE_API_URL       const json = await res.json();
import.meta.env.VITE_API_URL       if (json.ok || json.ticket) {
import.meta.env.VITE_API_URL         toast.success('Ticket de suporte criado com sucesso! O código é ' + (json.ticket?.tracking_code || 'N/A'));
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         toast.error('Erro ao criar ticket: ' + json.error);
import.meta.env.VITE_API_URL         throw new Error(json.error);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       toast.error('Erro de conexão ao criar ticket.');
import.meta.env.VITE_API_URL       throw err;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleUpgrade = async (plan: string) => {
import.meta.env.VITE_API_URL     const priceId = plan === 'Pro' ? (import.meta.env.VITE_STRIPE_PRICE_PRO || null) : (import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || null);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       toast.loading(`A preparar checkout para o plano ${plan}...`);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       const res = await fetch(`${BASE_URL}/api/client/stripe/checkout`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         credentials: 'include',
import.meta.env.VITE_API_URL         body: JSON.stringify({ priceId })
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       const json = await res.json();
import.meta.env.VITE_API_URL       toast.dismiss();
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       if (json.ok && json.url) {
import.meta.env.VITE_API_URL         window.location.href = json.url;
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         console.warn('[SUBSCRIPTION] Checkout failed, using fallback modal', json);
import.meta.env.VITE_API_URL         setIsPaymentModalOpen(true);
import.meta.env.VITE_API_URL         toast.info('Redirecionamento automático indisponível. Por favor, use o formulário de pagamento.');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       toast.dismiss();
import.meta.env.VITE_API_URL       console.error('[SUBSCRIPTION] Upgrade error:', err);
import.meta.env.VITE_API_URL       setIsPaymentModalOpen(true);
import.meta.env.VITE_API_URL       toast.info('Erro de conexão. Por favor, use o formulário de pagamento.');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
import.meta.env.VITE_API_URL         <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="p-8 text-center">
import.meta.env.VITE_API_URL         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
import.meta.env.VITE_API_URL         <h3 className="text-xl font-bold text-slate-900 mb-2">Erro de Carregamento</h3>
import.meta.env.VITE_API_URL         <p className="text-slate-600">{error}</p>
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchSubscription}
import.meta.env.VITE_API_URL           className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar Novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const subscription = data?.subscription;
import.meta.env.VITE_API_URL   const usage = data?.usage;
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
import.meta.env.VITE_API_URL       {/* Header Section */}
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscrição & Faturação</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 mt-1">Gira o seu plano, veja o uso e aceda ao suporte.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL           <button 
import.meta.env.VITE_API_URL             onClick={() => setIsSupportOpen(true)}
import.meta.env.VITE_API_URL             className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <HelpCircle className="w-4 h-4" />
import.meta.env.VITE_API_URL             Contactar Suporte
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL           <button 
import.meta.env.VITE_API_URL             onClick={() => setIsPaymentModalOpen(true)}
import.meta.env.VITE_API_URL             className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <CreditCard className="w-4 h-4" />
import.meta.env.VITE_API_URL             Métodos de Pagamento
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
import.meta.env.VITE_API_URL         {/* Current Plan Card */}
import.meta.env.VITE_API_URL         <div className="lg:col-span-2 space-y-8">
import.meta.env.VITE_API_URL           <motion.div 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-8 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-4">
import.meta.env.VITE_API_URL                 <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
import.meta.env.VITE_API_URL                   <Zap className="w-6 h-6" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                     <h3 className="text-xl font-bold text-slate-900">Plano {subscription?.plan}</h3>
import.meta.env.VITE_API_URL                     <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
import.meta.env.VITE_API_URL                       {subscription?.status}
import.meta.env.VITE_API_URL                     </span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <p className="text-sm text-slate-500">Subscrição ativa desde {subscription?.started_at ? new Date(subscription.started_at).toLocaleDateString() : 'N/A'}</p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="text-right">
import.meta.env.VITE_API_URL                 <p className="text-sm text-slate-500">Próxima fatura</p>
import.meta.env.VITE_API_URL                 <p className="text-lg font-bold text-slate-900">
import.meta.env.VITE_API_URL                   {subscription?.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : 'N/A'}
import.meta.env.VITE_API_URL                 </p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
import.meta.env.VITE_API_URL               <div className="space-y-2">
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between text-sm">
import.meta.env.VITE_API_URL                   <span className="text-slate-500 font-medium">Mensagens</span>
import.meta.env.VITE_API_URL                   <span className="text-slate-900 font-bold">{usage?.messages || 0} / ∞</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
import.meta.env.VITE_API_URL                   <div className="h-full bg-emerald-500 w-[15%]" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="space-y-2">
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between text-sm">
import.meta.env.VITE_API_URL                   <span className="text-slate-500 font-medium">Tickets</span>
import.meta.env.VITE_API_URL                   <span className="text-slate-900 font-bold">{usage?.tickets || 0}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
import.meta.env.VITE_API_URL                   <div className="h-full bg-blue-500 w-[45%]" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="space-y-2">
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between text-sm">
import.meta.env.VITE_API_URL                   <span className="text-slate-500 font-medium">Reclamações</span>
import.meta.env.VITE_API_URL                   <span className="text-slate-900 font-bold">{usage?.complaints || 0}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
import.meta.env.VITE_API_URL                   <div className="h-full bg-red-500 w-[5%]" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Features Grid */}
import.meta.env.VITE_API_URL           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
import.meta.env.VITE_API_URL             <div className="p-6 bg-white rounded-2xl border border-slate-200 flex gap-4">
import.meta.env.VITE_API_URL               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
import.meta.env.VITE_API_URL                 <Shield className="w-5 h-5" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div>
import.meta.env.VITE_API_URL                 <h4 className="font-bold text-slate-900">Segurança Avançada</h4>
import.meta.env.VITE_API_URL                 <p className="text-sm text-slate-500 mt-1">Proteção de dados e backups diários automáticos.</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="p-6 bg-white rounded-2xl border border-slate-200 flex gap-4">
import.meta.env.VITE_API_URL               <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
import.meta.env.VITE_API_URL                 <Globe className="w-5 h-5" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div>
import.meta.env.VITE_API_URL                 <h4 className="font-bold text-slate-900">API de Integração</h4>
import.meta.env.VITE_API_URL                 <p className="text-sm text-slate-500 mt-1">Conecte o TrataTudo aos seus sistemas internos.</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Support & Help Sidebar */}
import.meta.env.VITE_API_URL         <div className="space-y-6">
import.meta.env.VITE_API_URL           <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
import.meta.env.VITE_API_URL             <div className="relative z-10">
import.meta.env.VITE_API_URL               <h3 className="text-xl font-bold mb-2">Precisa de ajuda?</h3>
import.meta.env.VITE_API_URL               <p className="text-slate-400 text-sm mb-6">A nossa equipa de especialistas está pronta para ajudar a escalar o seu negócio.</p>
import.meta.env.VITE_API_URL               
import.meta.env.VITE_API_URL               <div className="space-y-4">
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => setIsSupportOpen(true)}
import.meta.env.VITE_API_URL                   className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <MessageSquare className="w-4 h-4" />
import.meta.env.VITE_API_URL                   Abrir Ticket
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => toast.info('A carregar histórico de suporte...')}
import.meta.env.VITE_API_URL                   className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <Clock className="w-4 h-4" />
import.meta.env.VITE_API_URL                   Histórico de Suporte
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             {/* Decorative element */}
import.meta.env.VITE_API_URL             <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="p-6 bg-white rounded-3xl border border-slate-200">
import.meta.env.VITE_API_URL             <h4 className="font-bold text-slate-900 mb-4">Perguntas Frequentes</h4>
import.meta.env.VITE_API_URL             <div className="space-y-4">
import.meta.env.VITE_API_URL               {[
import.meta.env.VITE_API_URL                 'Como alterar o meu plano?',
import.meta.env.VITE_API_URL                 'Posso cancelar a qualquer momento?',
import.meta.env.VITE_API_URL                 'Como funciona o suporte 24/7?',
import.meta.env.VITE_API_URL                 'Onde encontro as minhas faturas?'
import.meta.env.VITE_API_URL               ].map((q, i) => (
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   key={i} 
import.meta.env.VITE_API_URL                   onClick={() => toast.info(`Dica: ${q}`)}
import.meta.env.VITE_API_URL                   className="w-full flex items-center justify-between text-left group"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <span className="text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">{q}</span>
import.meta.env.VITE_API_URL                   <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Pricing Comparison (Optional/Hidden if already Pro) */}
import.meta.env.VITE_API_URL       {(subscription?.plan === 'Trial' || subscription?.plan === 'Grátis') && (
import.meta.env.VITE_API_URL         <div className="pt-8">
import.meta.env.VITE_API_URL           <div className="text-center mb-12">
import.meta.env.VITE_API_URL             <h2 className="text-3xl font-black text-slate-900 mb-4">Pronto para o próximo nível?</h2>
import.meta.env.VITE_API_URL             <p className="text-slate-500 max-w-2xl mx-auto">Escolha o plano que melhor se adapta ao volume da sua operação e comece a tratar de tudo hoje mesmo.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
import.meta.env.VITE_API_URL             <div className="p-8 bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 transition-all group relative">
import.meta.env.VITE_API_URL               <div className="mb-8">
import.meta.env.VITE_API_URL                 <h3 className="text-2xl font-bold text-slate-900">Plano Pro</h3>
import.meta.env.VITE_API_URL                 <p className="text-slate-500 text-sm">Para pequenas e médias empresas</p>
import.meta.env.VITE_API_URL                 <div className="mt-4 flex items-baseline gap-1">
import.meta.env.VITE_API_URL                   <span className="text-4xl font-black text-slate-900">49€</span>
import.meta.env.VITE_API_URL                   <span className="text-slate-500 font-medium">/mês</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <ul className="space-y-4 mb-8">
import.meta.env.VITE_API_URL                 {['Mensagens Ilimitadas', 'Instância Dedicada', 'Suporte Prioritário', 'Dashboard Avançado'].map((f, i) => (
import.meta.env.VITE_API_URL                   <li key={i} className="flex items-center gap-3 text-slate-600">
import.meta.env.VITE_API_URL                     <CheckCircle2 className="w-5 h-5 text-emerald-500" />
import.meta.env.VITE_API_URL                     {f}
import.meta.env.VITE_API_URL                   </li>
import.meta.env.VITE_API_URL                 ))}
import.meta.env.VITE_API_URL               </ul>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <button 
import.meta.env.VITE_API_URL                 onClick={() => handleUpgrade('Pro')}
import.meta.env.VITE_API_URL                 className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 Ativar Plano Pro
import.meta.env.VITE_API_URL               </button>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div className="p-8 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden">
import.meta.env.VITE_API_URL               <div className="relative z-10">
import.meta.env.VITE_API_URL                 <div className="mb-8">
import.meta.env.VITE_API_URL                   <h3 className="text-2xl font-bold">Enterprise</h3>
import.meta.env.VITE_API_URL                   <p className="text-emerald-100 text-sm">Para grandes operações</p>
import.meta.env.VITE_API_URL                   <div className="mt-4 flex items-baseline gap-1">
import.meta.env.VITE_API_URL                     <span className="text-4xl font-black">149€</span>
import.meta.env.VITE_API_URL                     <span className="text-emerald-100 font-medium">/mês</span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 <ul className="space-y-4 mb-8">
import.meta.env.VITE_API_URL                   {['Tudo do Plano Pro', 'Múltiplas Instâncias', 'Gestor de Conta', 'SLA Garantido'].map((f, i) => (
import.meta.env.VITE_API_URL                     <li key={i} className="flex items-center gap-3 text-emerald-50">
import.meta.env.VITE_API_URL                       <CheckCircle2 className="w-5 h-5 text-emerald-300" />
import.meta.env.VITE_API_URL                       {f}
import.meta.env.VITE_API_URL                     </li>
import.meta.env.VITE_API_URL                   ))}
import.meta.env.VITE_API_URL                 </ul>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={() => handleUpgrade('Enterprise')}
import.meta.env.VITE_API_URL                   className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-xl"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Contactar Vendas
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               
import.meta.env.VITE_API_URL               <div className="absolute top-0 right-0 p-4">
import.meta.env.VITE_API_URL                 <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-widest">Recomendado</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <SupportModal 
import.meta.env.VITE_API_URL         isOpen={isSupportOpen} 
import.meta.env.VITE_API_URL         onClose={() => setIsSupportOpen(false)}
import.meta.env.VITE_API_URL         onSubmit={handleSupportSubmit}
import.meta.env.VITE_API_URL       />
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <PaymentMethodsModal 
import.meta.env.VITE_API_URL         isOpen={isPaymentModalOpen}
import.meta.env.VITE_API_URL         onClose={() => setIsPaymentModalOpen(false)}
import.meta.env.VITE_API_URL       />
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
