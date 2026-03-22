import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   CreditCard, 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   Loader2, 
import.meta.env.VITE_API_URL   AlertCircle, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   XCircle, 
import.meta.env.VITE_API_URL   Calendar, 
import.meta.env.VITE_API_URL   TrendingUp, 
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   ShieldCheck,
import.meta.env.VITE_API_URL   Zap,
import.meta.env.VITE_API_URL   MessageSquare,
import.meta.env.VITE_API_URL   DollarSign,
import.meta.env.VITE_API_URL   Clock
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Subscription {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   client_id: string;
import.meta.env.VITE_API_URL   company_name: string;
import.meta.env.VITE_API_URL   plan: string;
import.meta.env.VITE_API_URL   status: string;
import.meta.env.VITE_API_URL   amount: number;
import.meta.env.VITE_API_URL   next_billing: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminSubscriptions() {
import.meta.env.VITE_API_URL   const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [searchTerm, setSearchTerm] = useState('');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const { logout } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchSubscriptions = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${baseUrl}/api/admin/subscriptions`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/subscriptions`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[ADMIN] Fetching subscriptions: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const data = await res.json();
import.meta.env.VITE_API_URL             const subsData = extractArrayResponse<Subscription>(data, 'subscriptions');
import.meta.env.VITE_API_URL             setSubscriptions(subsData);
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
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar subscrições');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[ADMIN] Fetch subscriptions failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Não foi possível carregar as subscrições.');
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Professional fallback for demo/development
import.meta.env.VITE_API_URL       if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL         console.log('[ADMIN] Using fallback subscriptions data');
import.meta.env.VITE_API_URL         setSubscriptions([
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '1',
import.meta.env.VITE_API_URL             client_id: 'C-1001',
import.meta.env.VITE_API_URL             company_name: 'João Silva Lda',
import.meta.env.VITE_API_URL             plan: 'Pro',
import.meta.env.VITE_API_URL             status: 'active',
import.meta.env.VITE_API_URL             amount: 49.90,
import.meta.env.VITE_API_URL             next_billing: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL           },
import.meta.env.VITE_API_URL           {
import.meta.env.VITE_API_URL             id: '2',
import.meta.env.VITE_API_URL             client_id: 'C-1002',
import.meta.env.VITE_API_URL             company_name: 'Maria Santos Unipessoal',
import.meta.env.VITE_API_URL             plan: 'Trial',
import.meta.env.VITE_API_URL             status: 'active',
import.meta.env.VITE_API_URL             amount: 0,
import.meta.env.VITE_API_URL             next_billing: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
import.meta.env.VITE_API_URL             created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
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
import.meta.env.VITE_API_URL     fetchSubscriptions();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredSubscriptions = subscriptions.filter(s => 
import.meta.env.VITE_API_URL     s.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL     s.client_id.toLowerCase().includes(searchTerm.toLowerCase())
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar dados financeiros..." className="h-[60vh]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchSubscriptions}
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
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Subscrições</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium">Controlo de faturação e planos dos clientes</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL           <div className="relative">
import.meta.env.VITE_API_URL             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input 
import.meta.env.VITE_API_URL               type="text" 
import.meta.env.VITE_API_URL               placeholder="Pesquisar cliente..." 
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
import.meta.env.VITE_API_URL       {/* Subscriptions Grid */}
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
import.meta.env.VITE_API_URL         {filteredSubscriptions.map((sub, index) => (
import.meta.env.VITE_API_URL           <motion.div
import.meta.env.VITE_API_URL             key={sub.id}
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: index * 0.05 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all p-8 group"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="flex items-center justify-between mb-6">
import.meta.env.VITE_API_URL               <div className={cn(
import.meta.env.VITE_API_URL                 "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
import.meta.env.VITE_API_URL                 sub.plan.toLowerCase() === 'enterprise' ? "bg-purple-500 shadow-purple-500/20" : 
import.meta.env.VITE_API_URL                 sub.plan.toLowerCase() === 'pro' ? "bg-primary shadow-primary/20" : "bg-blue-500 shadow-blue-500/20"
import.meta.env.VITE_API_URL               )}>
import.meta.env.VITE_API_URL                 <CreditCard className="w-7 h-7 text-white" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className={cn(
import.meta.env.VITE_API_URL                 "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
import.meta.env.VITE_API_URL                 sub.status.toLowerCase() === 'active' ? "bg-emerald-50 text-emerald-600" : 
import.meta.env.VITE_API_URL                 sub.status.toLowerCase() === 'trial' ? "bg-blue-50 text-blue-600" :
import.meta.env.VITE_API_URL                 sub.status.toLowerCase() === 'past_due' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
import.meta.env.VITE_API_URL               )}>
import.meta.env.VITE_API_URL                 {sub.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : 
import.meta.env.VITE_API_URL                  sub.status === 'past_due' ? <AlertCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
import.meta.env.VITE_API_URL                 {sub.status}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div className="space-y-4">
import.meta.env.VITE_API_URL               <div>
import.meta.env.VITE_API_URL                 <h3 className="text-lg font-black text-slate-900 tracking-tight">{sub.company_name}</h3>
import.meta.env.VITE_API_URL                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.client_id}</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between">
import.meta.env.VITE_API_URL                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Plano</span>
import.meta.env.VITE_API_URL                   <span className="text-xs font-black text-slate-900 tracking-tight uppercase">{sub.plan}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between">
import.meta.env.VITE_API_URL                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Mensal</span>
import.meta.env.VITE_API_URL                   <span className="text-xs font-black text-slate-900 tracking-tight">€{sub.amount.toFixed(2)}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex items-center justify-between">
import.meta.env.VITE_API_URL                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Próxima Fatura</span>
import.meta.env.VITE_API_URL                   <span className="text-xs font-black text-slate-900 tracking-tight">
import.meta.env.VITE_API_URL                     {new Date(sub.next_billing).toLocaleDateString()}
import.meta.env.VITE_API_URL                   </span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="flex items-center gap-2 pt-2">
import.meta.env.VITE_API_URL                 <button className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
import.meta.env.VITE_API_URL                   <DollarSign className="w-4 h-4" />
import.meta.env.VITE_API_URL                   Gerir Faturação
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
import.meta.env.VITE_API_URL                   <ArrowRight className="w-4 h-4" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         ))}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {filteredSubscriptions.length === 0 && (
import.meta.env.VITE_API_URL         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center">
import.meta.env.VITE_API_URL           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
import.meta.env.VITE_API_URL             <CreditCard className="w-8 h-8" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium tracking-tight">Nenhuma subscrição encontrada.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
