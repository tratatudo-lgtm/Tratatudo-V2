import.meta.env.VITE_API_URL import React, { useState } from 'react';
import.meta.env.VITE_API_URL import { useNavigate } from 'react-router-dom';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminLogin() {
import.meta.env.VITE_API_URL   const [email, setEmail] = useState('');
import.meta.env.VITE_API_URL   const [password, setPassword] = useState('');
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState(false);
import.meta.env.VITE_API_URL   const [error, setError] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const navigate = useNavigate();
import.meta.env.VITE_API_URL   const { login } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleSubmit = async (e: React.FormEvent) => {
import.meta.env.VITE_API_URL     e.preventDefault();
import.meta.env.VITE_API_URL     setLoading(true);
import.meta.env.VITE_API_URL     setError(null);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       await login(email, password);
import.meta.env.VITE_API_URL       navigate('/admin/dashboard');
import.meta.env.VITE_API_URL     } catch (err) {
import.meta.env.VITE_API_URL       setError(err instanceof Error ? err.message : 'Erro ao fazer login');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(false);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
import.meta.env.VITE_API_URL       <motion.div 
import.meta.env.VITE_API_URL         initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL         animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL         className="w-full max-w-md"
import.meta.env.VITE_API_URL       >
import.meta.env.VITE_API_URL         {/* Logo */}
import.meta.env.VITE_API_URL         <div className="text-center mb-8">
import.meta.env.VITE_API_URL           <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl shadow-2xl shadow-primary/30 mb-6">
import.meta.env.VITE_API_URL             <ShieldCheck className="w-10 h-10 text-white" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">TrataTudo Admin</h1>
import.meta.env.VITE_API_URL           <p className="text-slate-500 font-medium">Portal de Gestão da Plataforma</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Login Card */}
import.meta.env.VITE_API_URL         <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 lg:p-10 border border-slate-100">
import.meta.env.VITE_API_URL           <form onSubmit={handleSubmit} className="space-y-6">
import.meta.env.VITE_API_URL             {error && (
import.meta.env.VITE_API_URL               <motion.div 
import.meta.env.VITE_API_URL                 initial={{ opacity: 0, scale: 0.95 }}
import.meta.env.VITE_API_URL                 animate={{ opacity: 1, scale: 1 }}
import.meta.env.VITE_API_URL                 className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <AlertCircle className="w-5 h-5 shrink-0" />
import.meta.env.VITE_API_URL                 {error}
import.meta.env.VITE_API_URL               </motion.div>
import.meta.env.VITE_API_URL             )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div>
import.meta.env.VITE_API_URL               <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
import.meta.env.VITE_API_URL               <div className="relative">
import.meta.env.VITE_API_URL                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
import.meta.env.VITE_API_URL                 <input 
import.meta.env.VITE_API_URL                   type="email"
import.meta.env.VITE_API_URL                   value={email}
import.meta.env.VITE_API_URL                   onChange={(e) => setEmail(e.target.value)}
import.meta.env.VITE_API_URL                   placeholder="admin@tratatudo.com"
import.meta.env.VITE_API_URL                   className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
import.meta.env.VITE_API_URL                   required
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div>
import.meta.env.VITE_API_URL               <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Palavra-passe</label>
import.meta.env.VITE_API_URL               <div className="relative">
import.meta.env.VITE_API_URL                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
import.meta.env.VITE_API_URL                 <input 
import.meta.env.VITE_API_URL                   type="password"
import.meta.env.VITE_API_URL                   value={password}
import.meta.env.VITE_API_URL                   onChange={(e) => setPassword(e.target.value)}
import.meta.env.VITE_API_URL                   placeholder="••••••••"
import.meta.env.VITE_API_URL                   className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
import.meta.env.VITE_API_URL                   required
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               type="submit"
import.meta.env.VITE_API_URL               disabled={loading}
import.meta.env.VITE_API_URL               className="w-full bg-primary text-white rounded-2xl py-4 font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {loading ? (
import.meta.env.VITE_API_URL                 <Loader2 className="w-6 h-6 animate-spin" />
import.meta.env.VITE_API_URL               ) : (
import.meta.env.VITE_API_URL                 <>
import.meta.env.VITE_API_URL                   Entrar no Portal
import.meta.env.VITE_API_URL                   <ArrowRight className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </>
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </form>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Footer */}
import.meta.env.VITE_API_URL         <p className="text-center mt-8 text-slate-400 text-sm font-medium">
import.meta.env.VITE_API_URL           &copy; {new Date().getFullYear()} TrataTudo. Acesso restrito a administradores.
import.meta.env.VITE_API_URL         </p>
import.meta.env.VITE_API_URL       </motion.div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
