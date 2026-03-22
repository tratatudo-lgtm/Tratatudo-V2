import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   Smartphone, 
import.meta.env.VITE_API_URL   Activity, 
import.meta.env.VITE_API_URL   ShieldCheck, 
import.meta.env.VITE_API_URL   Calendar, 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   Send, 
import.meta.env.VITE_API_URL   ClipboardList, 
import.meta.env.VITE_API_URL   AlertCircle,
import.meta.env.VITE_API_URL   RefreshCw,
import.meta.env.VITE_API_URL   ExternalLink,
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   Zap,
import.meta.env.VITE_API_URL   Clock,
import.meta.env.VITE_API_URL   CheckCircle2,
import.meta.env.VITE_API_URL   Loader2
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { cn, extractObjectResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { Link } from 'react-router-dom';
import.meta.env.VITE_API_URL import { useAuth } from '../../lib/auth/AuthContext';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface InstanceData {
import.meta.env.VITE_API_URL   instance_name: string;
import.meta.env.VITE_API_URL   whatsapp_number: string;
import.meta.env.VITE_API_URL   status: string;
import.meta.env.VITE_API_URL   is_hub: boolean;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL   last_activity?: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface Stats {
import.meta.env.VITE_API_URL   totalMessages: number;
import.meta.env.VITE_API_URL   sentMessages: number;
import.meta.env.VITE_API_URL   receivedMessages: number;
import.meta.env.VITE_API_URL   totalTickets: number;
import.meta.env.VITE_API_URL   complaints: number;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const BASE_URL = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Instance() {
import.meta.env.VITE_API_URL   const { user } = useAuth();
import.meta.env.VITE_API_URL   const [data, setData] = useState<{ instance: InstanceData | null; stats: Stats } | null>(null);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [syncing, setSyncing] = useState(false);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchInstanceData = async () => {
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${BASE_URL}/api/client/instance`,
import.meta.env.VITE_API_URL       `${BASE_URL}/api/instance`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[APP] Fetching instance data: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const result = await res.json();
import.meta.env.VITE_API_URL             console.log(`[APP] Instance data received from ${url}:`, result);
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             const instance = extractObjectResponse<InstanceData>(result, 'instance');
import.meta.env.VITE_API_URL             const stats = result.stats || {
import.meta.env.VITE_API_URL               totalMessages: 0,
import.meta.env.VITE_API_URL               sentMessages: 0,
import.meta.env.VITE_API_URL               receivedMessages: 0,
import.meta.env.VITE_API_URL               totalTickets: 0,
import.meta.env.VITE_API_URL               complaints: 0
import.meta.env.VITE_API_URL             };
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             setData({ instance, stats });
import.meta.env.VITE_API_URL             setLoading(false);
import.meta.env.VITE_API_URL             return;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar dados da instância');
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[APP] Fetch instance data failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Erro desconhecido');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const syncInstance = async () => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setSyncing(true);
import.meta.env.VITE_API_URL       const res = await fetch(`${BASE_URL}/api/client/instance/sync`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       if (res.ok) {
import.meta.env.VITE_API_URL         await fetchInstanceData();
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       console.error('[APP] Sync failed:', err);
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setSyncing(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchInstanceData();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const formatDate = (dateStr: string) => {
import.meta.env.VITE_API_URL     if (!dateStr) return 'N/A';
import.meta.env.VITE_API_URL     const date = new Date(dateStr);
import.meta.env.VITE_API_URL     if (isNaN(date.getTime())) return 'N/A';
import.meta.env.VITE_API_URL     return date.toLocaleDateString('pt-PT', { 
import.meta.env.VITE_API_URL       day: '2-digit', 
import.meta.env.VITE_API_URL       month: 'short', 
import.meta.env.VITE_API_URL       year: 'numeric'
import.meta.env.VITE_API_URL     });
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const formatRelativeTime = (dateStr?: string) => {
import.meta.env.VITE_API_URL     if (!dateStr) return 'Sem atividade recente';
import.meta.env.VITE_API_URL     const date = new Date(dateStr);
import.meta.env.VITE_API_URL     if (isNaN(date.getTime())) return 'Sem atividade recente';
import.meta.env.VITE_API_URL     const now = new Date();
import.meta.env.VITE_API_URL     const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     if (diffInMinutes < 1) return 'Agora mesmo';
import.meta.env.VITE_API_URL     if (diffInMinutes < 60) return `Há ${diffInMinutes} minutos`;
import.meta.env.VITE_API_URL     if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} horas`;
import.meta.env.VITE_API_URL     return formatDate(dateStr);
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar estado da instância..." className="h-[calc(100vh-10rem)]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (error) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-4">
import.meta.env.VITE_API_URL         <ErrorState message={error} />
import.meta.env.VITE_API_URL         <button 
import.meta.env.VITE_API_URL           onClick={fetchInstanceData}
import.meta.env.VITE_API_URL           className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           Tentar Novamente
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (!data?.instance) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-4">
import.meta.env.VITE_API_URL         <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md">
import.meta.env.VITE_API_URL           <Smartphone className="w-16 h-16 text-slate-200 mx-auto mb-6" />
import.meta.env.VITE_API_URL           <h3 className="text-xl font-bold text-slate-900 mb-2">Sem instância configurada</h3>
import.meta.env.VITE_API_URL           <p className="text-slate-500 text-sm mb-8">
import.meta.env.VITE_API_URL             Ainda não tens uma instância WhatsApp configurada. Contacta o suporte para ativar a tua ligação.
import.meta.env.VITE_API_URL           </p>
import.meta.env.VITE_API_URL           <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
import.meta.env.VITE_API_URL             Solicitar Ativação
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const { instance, stats } = data;
import.meta.env.VITE_API_URL   const instanceStatus = (instance.status || '').toLowerCase();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const quickStats = [
import.meta.env.VITE_API_URL     { label: 'Mensagens Recebidas', value: stats.receivedMessages.toLocaleString(), icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
import.meta.env.VITE_API_URL     { label: 'Mensagens Enviadas', value: stats.sentMessages.toLocaleString(), icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-50' },
import.meta.env.VITE_API_URL     { label: 'Pedidos Gerados', value: stats.totalTickets.toLocaleString(), icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-50' },
import.meta.env.VITE_API_URL     { label: 'Reclamações Geradas', value: stats.complaints.toLocaleString(), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
import.meta.env.VITE_API_URL   ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div>
import.meta.env.VITE_API_URL         <h1 className="text-2xl font-display font-bold text-slate-900">Estado da Instância</h1>
import.meta.env.VITE_API_URL         <p className="text-slate-500 text-sm">Gira e monitoriza a tua ligação WhatsApp em tempo real.</p>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
import.meta.env.VITE_API_URL         {/* Main Instance Card */}
import.meta.env.VITE_API_URL         <motion.div 
import.meta.env.VITE_API_URL           initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL           animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL           className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           <div className="p-8">
import.meta.env.VITE_API_URL             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-4">
import.meta.env.VITE_API_URL                 <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
import.meta.env.VITE_API_URL                   <Smartphone className="w-8 h-8 text-primary" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <h2 className="text-xl font-bold text-slate-900">{instance.instance_name}</h2>
import.meta.env.VITE_API_URL                   <p className="text-slate-500 font-mono text-sm">{instance.whatsapp_number}</p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="flex flex-col items-end gap-2">
import.meta.env.VITE_API_URL                 <div className={cn(
import.meta.env.VITE_API_URL                   "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2",
import.meta.env.VITE_API_URL                   instanceStatus === 'conectado' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
import.meta.env.VITE_API_URL                   instanceStatus === 'reconectando' ? "bg-orange-50 text-orange-600 border border-orange-100" :
import.meta.env.VITE_API_URL                   "bg-red-50 text-red-600 border border-red-100"
import.meta.env.VITE_API_URL                 )}>
import.meta.env.VITE_API_URL                   <div className={cn(
import.meta.env.VITE_API_URL                     "w-2 h-2 rounded-full",
import.meta.env.VITE_API_URL                     instanceStatus === 'conectado' ? "bg-emerald-500 animate-pulse" :
import.meta.env.VITE_API_URL                     instanceStatus === 'reconectando' ? "bg-orange-500 animate-spin" :
import.meta.env.VITE_API_URL                     "bg-red-500"
import.meta.env.VITE_API_URL                   )}></div>
import.meta.env.VITE_API_URL                   {instance.status}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado da Ligação</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
import.meta.env.VITE_API_URL               <div className="space-y-1">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-2 text-slate-400">
import.meta.env.VITE_API_URL                   <ShieldCheck className="w-4 h-4" />
import.meta.env.VITE_API_URL                   <span className="text-[10px] font-bold uppercase tracking-widest">Tipo de Instância</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <p className="text-sm font-bold text-slate-700">
import.meta.env.VITE_API_URL                   {instance.is_hub ? "Hub Trial (instância partilhada)" : "Instância Privada"}
import.meta.env.VITE_API_URL                 </p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="space-y-1">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-2 text-slate-400">
import.meta.env.VITE_API_URL                   <Calendar className="w-4 h-4" />
import.meta.env.VITE_API_URL                   <span className="text-[10px] font-bold uppercase tracking-widest">Data de Criação</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <p className="text-sm font-bold text-slate-700">{formatDate(instance.created_at)}</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="space-y-1">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-2 text-slate-400">
import.meta.env.VITE_API_URL                   <Activity className="w-4 h-4" />
import.meta.env.VITE_API_URL                   <span className="text-[10px] font-bold uppercase tracking-widest">Última Atividade</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <p className="text-sm font-bold text-slate-700">{formatRelativeTime(instance.last_activity)}</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Action Footer */}
import.meta.env.VITE_API_URL           <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={fetchInstanceData}
import.meta.env.VITE_API_URL               className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Atualizar Dados
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={syncInstance}
import.meta.env.VITE_API_URL               disabled={syncing}
import.meta.env.VITE_API_URL               className={cn(
import.meta.env.VITE_API_URL                 "flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2",
import.meta.env.VITE_API_URL                 syncing && "opacity-50 cursor-not-allowed"
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
import.meta.env.VITE_API_URL               {syncing ? 'A Sincronizar...' : 'Sincronizar Agora'}
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Quick Stats Sidebar */}
import.meta.env.VITE_API_URL         <div className="space-y-6">
import.meta.env.VITE_API_URL           <motion.div 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.1 }}
import.meta.env.VITE_API_URL             className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
import.meta.env.VITE_API_URL               <Activity className="w-4 h-4 text-primary" /> Estatísticas Rápidas
import.meta.env.VITE_API_URL             </h3>
import.meta.env.VITE_API_URL             <div className="space-y-4">
import.meta.env.VITE_API_URL               {quickStats.map((stat, i) => (
import.meta.env.VITE_API_URL                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all group">
import.meta.env.VITE_API_URL                   <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                     <div className={cn("p-2 rounded-xl", stat.bg)}>
import.meta.env.VITE_API_URL                       <stat.icon className={cn("w-4 h-4", stat.color)} />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <span className="text-xs font-medium text-slate-600">{stat.label}</span>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <span className="text-sm font-bold text-slate-900">{stat.value}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="mt-6 pt-6 border-t border-slate-100">
import.meta.env.VITE_API_URL               <div className="flex justify-between items-center">
import.meta.env.VITE_API_URL                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Processado</span>
import.meta.env.VITE_API_URL                 <span className="text-lg font-bold text-primary">{stats.totalMessages.toLocaleString()}</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Quick Actions */}
import.meta.env.VITE_API_URL           <motion.div 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.2 }}
import.meta.env.VITE_API_URL             className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <h3 className="text-sm font-bold mb-6">Ações Rápidas</h3>
import.meta.env.VITE_API_URL             <div className="space-y-3">
import.meta.env.VITE_API_URL               <Link to="/app/messages" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group">
import.meta.env.VITE_API_URL                 <span className="text-xs font-medium">Ver Mensagens</span>
import.meta.env.VITE_API_URL                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL               <Link to="/app/tickets?area=pedidos" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group">
import.meta.env.VITE_API_URL                 <span className="text-xs font-medium">Ver Pedidos</span>
import.meta.env.VITE_API_URL                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL               <Link to="/app/subscription" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group">
import.meta.env.VITE_API_URL                 <span className="text-xs font-medium">Ver Subscrição</span>
import.meta.env.VITE_API_URL                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Connection Health / Logs Summary */}
import.meta.env.VITE_API_URL       <motion.div 
import.meta.env.VITE_API_URL         initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL         animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL         transition={{ delay: 0.3 }}
import.meta.env.VITE_API_URL         className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
import.meta.env.VITE_API_URL       >
import.meta.env.VITE_API_URL         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
import.meta.env.VITE_API_URL           <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
import.meta.env.VITE_API_URL             <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Saúde da Ligação
import.meta.env.VITE_API_URL           </h3>
import.meta.env.VITE_API_URL           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimas 24 Horas</span>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="p-8">
import.meta.env.VITE_API_URL           <div className="flex items-center justify-center h-12 text-slate-400 text-xs font-medium italic">
import.meta.env.VITE_API_URL             Dados de saúde da ligação serão apresentados após 24h de atividade.
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </motion.div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
