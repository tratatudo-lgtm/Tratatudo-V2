import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   Building2, 
import.meta.env.VITE_API_URL   User, 
import.meta.env.VITE_API_URL   Mail, 
import.meta.env.VITE_API_URL   Phone, 
import.meta.env.VITE_API_URL   Bot, 
import.meta.env.VITE_API_URL   MessageSquareText, 
import.meta.env.VITE_API_URL   Languages, 
import.meta.env.VITE_API_URL   Volume2, 
import.meta.env.VITE_API_URL   Bell, 
import.meta.env.VITE_API_URL   ShieldCheck, 
import.meta.env.VITE_API_URL   LogOut, 
import.meta.env.VITE_API_URL   Save, 
import.meta.env.VITE_API_URL   RotateCcw, 
import.meta.env.VITE_API_URL   Headphones,
import.meta.env.VITE_API_URL   Check,
import.meta.env.VITE_API_URL   Clock,
import.meta.env.VITE_API_URL   Smartphone,
import.meta.env.VITE_API_URL   Loader2,
import.meta.env.VITE_API_URL   AlertCircle
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { cn, extractObjectResponse } from '../../lib/utils';
import.meta.env.VITE_API_URL import { LoadingState, ErrorState } from '../../components/States';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface ClientSettings {
import.meta.env.VITE_API_URL   client_id: string;
import.meta.env.VITE_API_URL   company_name: string;
import.meta.env.VITE_API_URL   phone_e164: string;
import.meta.env.VITE_API_URL   bot_instructions: string;
import.meta.env.VITE_API_URL   status: string;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Settings() {
import.meta.env.VITE_API_URL   const [settings, setSettings] = useState<ClientSettings | null>(null);
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(true);
import.meta.env.VITE_API_URL   const [saving, setSaving] = useState(false);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const [success, setSuccess] = useState(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   // Form state
import.meta.env.VITE_API_URL   const [formData, setFormData] = useState({
import.meta.env.VITE_API_URL     company_name: '',
import.meta.env.VITE_API_URL     bot_instructions: ''
import.meta.env.VITE_API_URL   });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const fetchSettings = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const endpoints = [
import.meta.env.VITE_API_URL       `${baseUrl}/api/client/settings`,
import.meta.env.VITE_API_URL       `${baseUrl}/api/settings`
import.meta.env.VITE_API_URL     ];
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     let lastError = null;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setLoading(true);
import.meta.env.VITE_API_URL       for (const url of endpoints) {
import.meta.env.VITE_API_URL         console.log(`[APP] Fetching client settings: ${url}`);
import.meta.env.VITE_API_URL         try {
import.meta.env.VITE_API_URL           const res = await fetch(url, {
import.meta.env.VITE_API_URL             credentials: 'include'
import.meta.env.VITE_API_URL           });
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           if (res.ok) {
import.meta.env.VITE_API_URL             const result = await res.json();
import.meta.env.VITE_API_URL             console.log(`[APP] Client settings received from ${url}:`, result);
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             const data = extractObjectResponse<ClientSettings>(result, 'settings');
import.meta.env.VITE_API_URL             if (data) {
import.meta.env.VITE_API_URL               setSettings(data);
import.meta.env.VITE_API_URL               setFormData({
import.meta.env.VITE_API_URL                 company_name: data.company_name || '',
import.meta.env.VITE_API_URL                 bot_instructions: data.bot_instructions || ''
import.meta.env.VITE_API_URL               });
import.meta.env.VITE_API_URL               setLoading(false);
import.meta.env.VITE_API_URL               return;
import.meta.env.VITE_API_URL             }
import.meta.env.VITE_API_URL           }
import.meta.env.VITE_API_URL         } catch (e) {
import.meta.env.VITE_API_URL           lastError = e;
import.meta.env.VITE_API_URL         }
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       throw lastError || new Error('Falha ao carregar definições');
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[APP] Fetch client settings failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Erro desconhecido');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     fetchSettings();
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSave = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     const url = `${baseUrl}/api/client/settings`;
import.meta.env.VITE_API_URL     console.log(`[APP] Saving client settings: ${url}`);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       setSaving(true);
import.meta.env.VITE_API_URL       setError(null);
import.meta.env.VITE_API_URL       setSuccess(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const res = await fetch(url, {
import.meta.env.VITE_API_URL         method: 'PATCH',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({
import.meta.env.VITE_API_URL           company_name: formData.company_name,
import.meta.env.VITE_API_URL           bot_instructions: formData.bot_instructions
import.meta.env.VITE_API_URL         }),
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       console.log(`[APP] Save client settings status: ${res.status}`);
import.meta.env.VITE_API_URL       if (!res.ok) {
import.meta.env.VITE_API_URL         const errorData = await res.json().catch(() => ({}));
import.meta.env.VITE_API_URL         throw new Error(errorData.message || errorData.error || 'Falha ao guardar alterações');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       const result = await res.json();
import.meta.env.VITE_API_URL       const updated = extractObjectResponse<ClientSettings>(result, 'settings') || result;
import.meta.env.VITE_API_URL       setSettings(updated);
import.meta.env.VITE_API_URL       setSuccess(true);
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       setTimeout(() => setSuccess(false), 3000);
import.meta.env.VITE_API_URL     } catch (err: any) {
import.meta.env.VITE_API_URL       console.error('[APP] Save client settings failed:', err);
import.meta.env.VITE_API_URL       setError(err.message || 'Erro desconhecido');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setSaving(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleReset = () => {
import.meta.env.VITE_API_URL     if (settings) {
import.meta.env.VITE_API_URL       setFormData({
import.meta.env.VITE_API_URL         company_name: settings.company_name || '',
import.meta.env.VITE_API_URL         bot_instructions: settings.bot_instructions || ''
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   if (loading) {
import.meta.env.VITE_API_URL     return <LoadingState message="A carregar definições..." className="h-[calc(100vh-10rem)]" />;
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="space-y-8 pb-20">
import.meta.env.VITE_API_URL       {/* Header */}
import.meta.env.VITE_API_URL       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
import.meta.env.VITE_API_URL         <div>
import.meta.env.VITE_API_URL           <h1 className="text-2xl font-display font-bold text-slate-900">Definições</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 text-sm">Gira as configurações da tua conta e personaliza o comportamento do teu bot.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL         
import.meta.env.VITE_API_URL         {success && (
import.meta.env.VITE_API_URL           <motion.div 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL             className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-sm font-bold"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <Check className="w-4 h-4" /> Guardado com sucesso
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {error && (
import.meta.env.VITE_API_URL           <motion.div 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL             className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-bold"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <AlertCircle className="w-4 h-4" /> {error}
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
import.meta.env.VITE_API_URL         <div className="lg:col-span-2 space-y-8">
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           {/* 1. Dados da Conta */}
import.meta.env.VITE_API_URL           <motion.section 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900 flex items-center gap-2">
import.meta.env.VITE_API_URL                 <Building2 className="w-4 h-4 text-primary" /> Dados da Conta
import.meta.env.VITE_API_URL               </h3>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
import.meta.env.VITE_API_URL               <div className="space-y-2">
import.meta.env.VITE_API_URL                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome da Empresa</label>
import.meta.env.VITE_API_URL                 <div className="relative">
import.meta.env.VITE_API_URL                   <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="text" 
import.meta.env.VITE_API_URL                     value={formData.company_name}
import.meta.env.VITE_API_URL                     onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
import.meta.env.VITE_API_URL                     className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="space-y-2">
import.meta.env.VITE_API_URL                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp Associado</label>
import.meta.env.VITE_API_URL                 <div className="relative">
import.meta.env.VITE_API_URL                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="text" 
import.meta.env.VITE_API_URL                     value={settings?.phone_e164 || ''}
import.meta.env.VITE_API_URL                     readOnly
import.meta.env.VITE_API_URL                     className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 outline-none text-sm font-medium cursor-not-allowed"
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* 2. Configuração do Bot */}
import.meta.env.VITE_API_URL           <motion.section 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.1 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900 flex items-center gap-2">
import.meta.env.VITE_API_URL                 <Bot className="w-4 h-4 text-primary" /> Configuração do Bot
import.meta.env.VITE_API_URL               </h3>
import.meta.env.VITE_API_URL               <div className="flex items-center gap-2">
import.meta.env.VITE_API_URL                 <span className={cn(
import.meta.env.VITE_API_URL                   "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
import.meta.env.VITE_API_URL                   settings?.status === 'active' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-600 bg-slate-50 border-slate-100"
import.meta.env.VITE_API_URL                 )}>
import.meta.env.VITE_API_URL                   {settings?.status === 'active' ? 'Ativo' : settings?.status}
import.meta.env.VITE_API_URL                 </span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="p-8 space-y-6">
import.meta.env.VITE_API_URL               <div className="space-y-2">
import.meta.env.VITE_API_URL                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instruções do Bot (Prompt)</label>
import.meta.env.VITE_API_URL                 <textarea 
import.meta.env.VITE_API_URL                   rows={6}
import.meta.env.VITE_API_URL                   value={formData.bot_instructions}
import.meta.env.VITE_API_URL                   onChange={(e) => setFormData({ ...formData, bot_instructions: e.target.value })}
import.meta.env.VITE_API_URL                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium resize-none"
import.meta.env.VITE_API_URL                   placeholder="Descreva como o bot deve se comportar..."
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* 3. Preferências */}
import.meta.env.VITE_API_URL           <motion.section 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.2 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900 flex items-center gap-2">
import.meta.env.VITE_API_URL                 <Bell className="w-4 h-4 text-primary" /> Preferências de Notificação
import.meta.env.VITE_API_URL               </h3>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="p-8 space-y-4">
import.meta.env.VITE_API_URL               {[
import.meta.env.VITE_API_URL                 { id: 'email', label: 'Notificações por Email', desc: 'Recebe alertas de novos pedidos no teu email principal.', active: true },
import.meta.env.VITE_API_URL                 { id: 'portal', label: 'Notificações no Portal', desc: 'Alertas visuais dentro do dashboard do TrataTudo.', active: true },
import.meta.env.VITE_API_URL                 { id: 'urgent', label: 'Alertas de Pedidos Urgentes', desc: 'Notificações prioritárias para reclamações críticas.', active: true },
import.meta.env.VITE_API_URL                 { id: 'weekly', label: 'Relatórios Semanais', desc: 'Resumo de performance enviado todas as segundas-feiras.', active: false },
import.meta.env.VITE_API_URL               ].map((pref) => (
import.meta.env.VITE_API_URL                 <div key={pref.id} className="flex items-start justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
import.meta.env.VITE_API_URL                   <div className="space-y-1">
import.meta.env.VITE_API_URL                     <p className="text-sm font-bold text-slate-900">{pref.label}</p>
import.meta.env.VITE_API_URL                     <p className="text-xs text-slate-500">{pref.desc}</p>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <button className={cn(
import.meta.env.VITE_API_URL                     "w-12 h-6 rounded-full relative transition-all duration-300",
import.meta.env.VITE_API_URL                     pref.active ? "bg-primary" : "bg-slate-200"
import.meta.env.VITE_API_URL                   )}>
import.meta.env.VITE_API_URL                     <div className={cn(
import.meta.env.VITE_API_URL                       "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
import.meta.env.VITE_API_URL                       pref.active ? "left-7" : "left-1"
import.meta.env.VITE_API_URL                     )}></div>
import.meta.env.VITE_API_URL                   </button>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.section>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="space-y-8">
import.meta.env.VITE_API_URL           {/* 4. Segurança */}
import.meta.env.VITE_API_URL           <motion.section 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.3 }}
import.meta.env.VITE_API_URL             className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
import.meta.env.VITE_API_URL               <h3 className="font-bold text-slate-900 flex items-center gap-2">
import.meta.env.VITE_API_URL                 <ShieldCheck className="w-4 h-4 text-primary" /> Segurança
import.meta.env.VITE_API_URL               </h3>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="p-6 space-y-6">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
import.meta.env.VITE_API_URL                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
import.meta.env.VITE_API_URL                   <Smartphone className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div>
import.meta.env.VITE_API_URL                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Método de Acesso</p>
import.meta.env.VITE_API_URL                   <p className="text-sm font-bold text-slate-900">WhatsApp OTP</p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="space-y-4">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3 text-xs text-slate-500">
import.meta.env.VITE_API_URL                   <Clock className="w-3.5 h-3.5" />
import.meta.env.VITE_API_URL                   <span>Última sessão: <span className="font-bold text-slate-700">Hoje, 09:42</span></span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition-all">
import.meta.env.VITE_API_URL                   <LogOut className="w-4 h-4" /> Terminar Sessão
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* 5. Ações Rápidas */}
import.meta.env.VITE_API_URL           <motion.section 
import.meta.env.VITE_API_URL             initial={{ opacity: 0, x: 20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL             transition={{ delay: 0.4 }}
import.meta.env.VITE_API_URL             className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
import.meta.env.VITE_API_URL             <div className="relative space-y-6">
import.meta.env.VITE_API_URL               <h3 className="text-xl font-bold">Ações da Conta</h3>
import.meta.env.VITE_API_URL               <div className="space-y-3">
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={handleSave}
import.meta.env.VITE_API_URL                   disabled={saving}
import.meta.env.VITE_API_URL                   className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   {saving ? (
import.meta.env.VITE_API_URL                     <Loader2 className="w-4 h-4 animate-spin" />
import.meta.env.VITE_API_URL                   ) : (
import.meta.env.VITE_API_URL                     <Save className="w-4 h-4" />
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                   {saving ? 'A guardar...' : 'Guardar Alterações'}
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button 
import.meta.env.VITE_API_URL                   onClick={handleReset}
import.meta.env.VITE_API_URL                   className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <RotateCcw className="w-4 h-4" /> Restaurar Definições
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL                 <button className="w-full bg-white/5 text-slate-400 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10">
import.meta.env.VITE_API_URL                   <Headphones className="w-4 h-4" /> Contactar Suporte
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </motion.section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Help Info */}
import.meta.env.VITE_API_URL           <div className="px-6 text-center">
import.meta.env.VITE_API_URL             <p className="text-[10px] text-slate-400 leading-relaxed">
import.meta.env.VITE_API_URL               Algumas alterações podem demorar até 5 minutos a ser propagadas para o bot WhatsApp.
import.meta.env.VITE_API_URL             </p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
