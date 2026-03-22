import.meta.env.VITE_API_URL import React, { useState } from 'react';
import.meta.env.VITE_API_URL import { Menu, Bell, Search, User, ChevronDown, LogOut, Settings, HelpCircle } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAuth } from '../../lib/auth/AuthContext';
import.meta.env.VITE_API_URL import { toast } from 'sonner';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface TopbarProps {
import.meta.env.VITE_API_URL   onMenuClick: () => void;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Topbar({ onMenuClick }: TopbarProps) {
import.meta.env.VITE_API_URL   const { user, signOut } = useAuth();
import.meta.env.VITE_API_URL   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleLogout = async () => {
import.meta.env.VITE_API_URL     const baseUrl = import.meta.env.VITE_API_URL || '';
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       toast.loading('A terminar sessão...');
import.meta.env.VITE_API_URL       const res = await fetch(`${baseUrl}/api/auth/logout`, {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         credentials: 'include'
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       toast.dismiss();
import.meta.env.VITE_API_URL       if (res.ok) {
import.meta.env.VITE_API_URL         toast.success('Sessão terminada com sucesso.');
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         console.warn('[AUTH] Logout server call failed, clearing local session anyway');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL       
import.meta.env.VITE_API_URL       // Even if the API fails, we sign out locally
import.meta.env.VITE_API_URL       await signOut();
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       toast.dismiss();
import.meta.env.VITE_API_URL       console.error('[AUTH] Logout failed:', error);
import.meta.env.VITE_API_URL       // Clear local session on error too
import.meta.env.VITE_API_URL       await signOut();
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
import.meta.env.VITE_API_URL       <div className="h-full px-4 lg:px-8 flex items-center justify-between">
import.meta.env.VITE_API_URL         <div className="flex items-center gap-4">
import.meta.env.VITE_API_URL           <button 
import.meta.env.VITE_API_URL             onClick={onMenuClick}
import.meta.env.VITE_API_URL             className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <Menu className="w-5 h-5" />
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 lg:w-80">
import.meta.env.VITE_API_URL             <Search className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL             <input 
import.meta.env.VITE_API_URL               type="text" 
import.meta.env.VITE_API_URL               placeholder="Pesquisar..." 
import.meta.env.VITE_API_URL               className="bg-transparent border-none outline-none text-sm w-full text-slate-600"
import.meta.env.VITE_API_URL             />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="flex items-center gap-2 lg:gap-4">
import.meta.env.VITE_API_URL           <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative">
import.meta.env.VITE_API_URL             <Bell className="w-5 h-5" />
import.meta.env.VITE_API_URL             <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
import.meta.env.VITE_API_URL           </button>
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
import.meta.env.VITE_API_URL           
import.meta.env.VITE_API_URL           <div className="relative">
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
import.meta.env.VITE_API_URL               className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl transition-all"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
import.meta.env.VITE_API_URL                 {user?.phone_e164?.slice(-2) || 'TT'}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="hidden sm:block text-left">
import.meta.env.VITE_API_URL                 <p className="text-xs font-bold text-slate-900 leading-none">{user?.company_name || 'Cliente'}</p>
import.meta.env.VITE_API_URL                 <p className="text-[10px] text-slate-500 mt-1">{user?.phone_e164 || 'Sem número'}</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <ChevronDown className={cn("w-4 h-4 text-slate-400 hidden sm:block transition-transform", isUserMenuOpen && "rotate-180")} />
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <AnimatePresence>
import.meta.env.VITE_API_URL               {isUserMenuOpen && (
import.meta.env.VITE_API_URL                 <>
import.meta.env.VITE_API_URL                   <div 
import.meta.env.VITE_API_URL                     className="fixed inset-0 z-10" 
import.meta.env.VITE_API_URL                     onClick={() => setIsUserMenuOpen(false)}
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                   <motion.div
import.meta.env.VITE_API_URL                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
import.meta.env.VITE_API_URL                     animate={{ opacity: 1, y: 0, scale: 1 }}
import.meta.env.VITE_API_URL                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
import.meta.env.VITE_API_URL                     className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20"
import.meta.env.VITE_API_URL                   >
import.meta.env.VITE_API_URL                     <div className="px-4 py-2 border-b border-slate-50 mb-2">
import.meta.env.VITE_API_URL                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">A minha conta</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     
import.meta.env.VITE_API_URL                     <button className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
import.meta.env.VITE_API_URL                       <User className="w-4 h-4" />
import.meta.env.VITE_API_URL                       Perfil
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                     <button className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
import.meta.env.VITE_API_URL                       <Settings className="w-4 h-4" />
import.meta.env.VITE_API_URL                       Definições
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                     <button className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
import.meta.env.VITE_API_URL                       <HelpCircle className="w-4 h-4" />
import.meta.env.VITE_API_URL                       Ajuda
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                     
import.meta.env.VITE_API_URL                     <div className="h-px bg-slate-50 my-2" />
import.meta.env.VITE_API_URL                     
import.meta.env.VITE_API_URL                     <button 
import.meta.env.VITE_API_URL                       onClick={handleLogout}
import.meta.env.VITE_API_URL                       className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
import.meta.env.VITE_API_URL                     >
import.meta.env.VITE_API_URL                       <LogOut className="w-4 h-4" />
import.meta.env.VITE_API_URL                       Terminar Sessão
import.meta.env.VITE_API_URL                     </button>
import.meta.env.VITE_API_URL                   </motion.div>
import.meta.env.VITE_API_URL                 </>
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             </AnimatePresence>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </header>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
