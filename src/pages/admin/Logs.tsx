import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   FileText, 
import.meta.env.VITE_API_URL   Search, 
import.meta.env.VITE_API_URL   Filter, 
import.meta.env.VITE_API_URL   Loader2, 
import.meta.env.VITE_API_URL   AlertCircle, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   XCircle, 
import.meta.env.VITE_API_URL   Clock, 
import.meta.env.VITE_API_URL   RefreshCw,
import.meta.env.VITE_API_URL   Terminal,
import.meta.env.VITE_API_URL   ShieldAlert,
import.meta.env.VITE_API_URL   Database,
import.meta.env.VITE_API_URL   Server,
import.meta.env.VITE_API_URL   Smartphone,
import.meta.env.VITE_API_URL   MessageSquare,
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   Download
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn, extractArrayResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface SystemLog {
import.meta.env.VITE_API_URL   id: string;
import.meta.env.VITE_API_URL   level: 'info' | 'warning' | 'error' | 'critical';
import.meta.env.VITE_API_URL   source: 'api' | 'whatsapp' | 'database' | 'auth' | 'system';
import.meta.env.VITE_API_URL   message: string;
import.meta.env.VITE_API_URL   details?: string;
import.meta.env.VITE_API_URL   created_at: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminLogs() {
import.meta.env.VITE_API_URL   const [logs, setLogs] = useState<SystemLog[]>([]);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [searchTerm, setSearchTerm] = useState('');
import.meta.env.VITE_API_URL   const [filterLevel, setFilterLevel] = useState<string>('all');
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const { logout } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     const fetchLogs = async () => {
import.meta.env.VITE_API_URL       const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL       const endpoints = [
import.meta.env.VITE_API_URL         `${baseUrl}/api/admin/logs`,
import.meta.env.VITE_API_URL         `${baseUrl}/api/logs`
import.meta.env.VITE_API_URL       ];
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       let lastError = null;
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       try {
import.meta.env.VITE_API_URL         setLoading(true);
import.meta.env.VITE_API_URL         setError(null);
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         for (const url of endpoints) {
import.meta.env.VITE_API_URL           console.log(`[ADMIN] Fetching logs: ${url}`);
import.meta.env.VITE_API_URL           try {
import.meta.env.VITE_API_URL             const response = await fetch(url, {
import.meta.env.VITE_API_URL               credentials: 'include'
import.meta.env.VITE_API_URL             });
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             if (response.ok) {
import.meta.env.VITE_API_URL               const data = await response.json();
import.meta.env.VITE_API_URL               const logsData = extractArrayResponse<SystemLog>(data, 'logs');
import.meta.env.VITE_API_URL               setLogs(logsData);
import.meta.env.VITE_API_URL               setLoading(false);
import.meta.env.VITE_API_URL               return;
import.meta.env.VITE_API_URL             } else if (response.status === 401) {
import.meta.env.VITE_API_URL               console.warn('[ADMIN] Session expired, logging out...');
import.meta.env.VITE_API_URL               await logout();
import.meta.env.VITE_API_URL               return;
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL           } catch (e) {
import.meta.env.VITE_API_URL             lastError = e;
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         throw lastError || new Error('Falha ao carregar logs do sistema');
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL       } catch (err: any) {
import.meta.env.VITE_API_URL         console.error('[ADMIN] Fetch logs failed:', err);
import.meta.env.VITE_API_URL         setError(err.message || 'Não foi possível carregar os logs.');
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         // Professional fallback for demo/development
import.meta.env.VITE_API_URL         if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
import.meta.env.VITE_API_URL           console.log('[ADMIN] Using fallback logs data');
import.meta.env.VITE_API_URL           setLogs([
import.meta.env.VITE_API_URL             {
import.meta.env.VITE_API_URL               id: '1',
import.meta.env.VITE_API_URL               level: 'info',
import.meta.env.VITE_API_URL               source: 'system',
import.meta.env.VITE_API_URL               message: 'Sistema iniciado com sucesso.',
import.meta.env.VITE_API_URL               created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL             },
import.meta.env.VITE_API_URL             {
import.meta.env.VITE_API_URL               id: '2',
import.meta.env.VITE_API_URL               level: 'error',
import.meta.env.VITE_API_URL               source: 'auth',
import.meta.env.VITE_API_URL               message: 'Falha na autenticação para o utilizador admin@tratatudo.pt.',
import.meta.env.VITE_API_URL               created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL             },
import.meta.env.VITE_API_URL             {
import.meta.env.VITE_API_URL               id: '3',
import.meta.env.VITE_API_URL               level: 'warning',
import.meta.env.VITE_API_URL               source: 'whatsapp',
import.meta.env.VITE_API_URL               message: 'Instância TT-MARIA desconectada inesperadamente.',
import.meta.env.VITE_API_URL               created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL           ]);
import.meta.env.VITE_API_URL           setError(null);
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       } finally {
import.meta.env.VITE_API_URL         setLoading(false);
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     fetchLogs();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const filteredLogs = logs.filter(log => {
import.meta.env.VITE_API_URL     const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
import.meta.env.VITE_API_URL                          log.source.toLowerCase().includes(searchTerm.toLowerCase());
import.meta.env.VITE_API_URL     const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
import.meta.env.VITE_API_URL     return matchesSearch && matchesLevel;
import.meta.env.VITE_API_URL   });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return (
import.meta.env.VITE_API_URL       <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
import.meta.env.VITE_API_URL         <Loader2 className="w-8 h-8 text-primary animate-spin" />
import.meta.env.VITE_API_URL         <p className="text-slate-500 font-medium tracking-tight">A carregar logs do sistema...</p>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     );
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8 max-w-7xl mx-auto">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Logs do Sistema</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium tracking-tight">Monitorização de erros e eventos da plataforma</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL           <div className="relative">
import.meta.env.VITE_API_URL             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input 
import.meta.env.VITE_API_URL               type="text" 
import.meta.env.VITE_API_URL               placeholder="Pesquisar nos logs..." 
import.meta.env.VITE_API_URL               value={searchTerm}
import.meta.env.VITE_API_URL               onChange={(e) => setSearchTerm(e.target.value)}
import.meta.env.VITE_API_URL               className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <select 
import.meta.env.VITE_API_URL             value={filterLevel}
import.meta.env.VITE_API_URL             onChange={(e) => setFilterLevel(e.target.value)}
import.meta.env.VITE_API_URL             className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-bold text-slate-600"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <option value="all">Todos os Níveis</option>
import.meta.env.VITE_API_URL             <option value="info">Informação</option>
import.meta.env.VITE_API_URL             <option value="warning">Aviso</option>
import.meta.env.VITE_API_URL             <option value="error">Erro</option>
import.meta.env.VITE_API_URL             <option value="critical">Crítico</option>
import.meta.env.VITE_API_URL           </select>
import.meta.env.VITE_API_URL           <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
import.meta.env.VITE_API_URL             <Download className="w-5 h-5" />
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Logs Table */}
import.meta.env.VITE_API_URL       <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
import.meta.env.VITE_API_URL         <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
import.meta.env.VITE_API_URL           <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL             <Terminal className="w-5 h-5 text-emerald-500" />
import.meta.env.VITE_API_URL             <span className="text-sm font-black text-slate-300 uppercase tracking-widest">System Console</span>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
import.meta.env.VITE_API_URL             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Monitoring</span>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         <div className="overflow-x-auto">
import.meta.env.VITE_API_URL           <table className="w-full text-left border-collapse">
import.meta.env.VITE_API_URL             <thead>
import.meta.env.VITE_API_URL               <tr className="bg-slate-800/30 border-b border-slate-800">
import.meta.env.VITE_API_URL                 <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
import.meta.env.VITE_API_URL                 <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</th>
import.meta.env.VITE_API_URL                 <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source</th>
import.meta.env.VITE_API_URL                 <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Message</th>
import.meta.env.VITE_API_URL                 <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
import.meta.env.VITE_API_URL               </tr>
import.meta.env.VITE_API_URL             </thead>
import.meta.env.VITE_API_URL             <tbody className="font-mono text-xs">
import.meta.env.VITE_API_URL               {filteredLogs.map((log, index) => (
import.meta.env.VITE_API_URL                 <motion.tr 
import.meta.env.VITE_API_URL                   key={log.id}
import.meta.env.VITE_API_URL                   initial={{ opacity: 0 }}
import.meta.env.VITE_API_URL                   animate={{ opacity: 1 }}
import.meta.env.VITE_API_URL                   transition={{ delay: index * 0.01 }}
import.meta.env.VITE_API_URL                   className="group hover:bg-slate-800/50 transition-colors border-b border-slate-800/50"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <td className="px-8 py-4 text-slate-500 whitespace-nowrap">
import.meta.env.VITE_API_URL                     {new Date(log.created_at).toLocaleString([], { hour12: false })}
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                   <td className="px-8 py-4">
import.meta.env.VITE_API_URL                     <span className={cn(
import.meta.env.VITE_API_URL                       "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
import.meta.env.VITE_API_URL                       log.level === 'critical' ? "bg-red-500/10 text-red-500" : 
import.meta.env.VITE_API_URL                       log.level === 'error' ? "bg-orange-500/10 text-orange-500" : 
import.meta.env.VITE_API_URL                       log.level === 'warning' ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"
import.meta.env.VITE_API_URL                     )}>
import.meta.env.VITE_API_URL                       {log.level}
import.meta.env.VITE_API_URL                     </span>
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                   <td className="px-8 py-4">
import.meta.env.VITE_API_URL                     <div className="flex items-center gap-2 text-slate-400">
import.meta.env.VITE_API_URL                       {log.source === 'api' ? <Server className="w-3 h-3" /> : 
import.meta.env.VITE_API_URL                        log.source === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : 
import.meta.env.VITE_API_URL                        log.source === 'database' ? <Database className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
import.meta.env.VITE_API_URL                       <span className="uppercase tracking-widest text-[10px] font-bold">{log.source}</span>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                   <td className="px-8 py-4 text-slate-300 max-w-md truncate">
import.meta.env.VITE_API_URL                     {log.message}
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                   <td className="px-8 py-4 text-right">
import.meta.env.VITE_API_URL                     <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
import.meta.env.VITE_API_URL                       <ArrowRight className="w-4 h-4" />
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </td>
import.meta.env.VITE_API_URL                 </motion.tr>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL             </tbody>
import.meta.env.VITE_API_URL           </table>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         {filteredLogs.length === 0 && (
import.meta.env.VITE_API_URL           <div className="p-20 text-center">
import.meta.env.VITE_API_URL             <p className="text-slate-500 font-medium tracking-tight">Nenhum log encontrado com estes filtros.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
