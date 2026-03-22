import React, { useState } from 'react';
import { Menu, Bell, Search, User, ChevronDown, LogOut, Settings, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    try {
      toast.loading('A terminar sessão...');
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      toast.dismiss();
      if (res.ok) {
        toast.success('Sessão terminada com sucesso.');
      } else {
        console.warn('[AUTH] Logout server call failed, clearing local session anyway');
      }
      
      // Even if the API fails, we sign out locally
      await signOut();
    } catch (error) {
      toast.dismiss();
      console.error('[AUTH] Logout failed:', error);
      // Clear local session on error too
      await signOut();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 lg:w-80">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Language Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 mr-2">
            {(['PT', 'EN', 'ES'] as const).map((lang) => (
              <button
                key={lang}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-white transition-all"
              >
                {lang}
              </button>
            ))}
          </div>

          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user?.phone_e164?.slice(-2) || 'TT'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.company_name || 'Cliente'}</p>
                <p className="text-[10px] text-slate-500 mt-1">{user?.phone_e164 || 'Sem número'}</p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 hidden sm:block transition-transform", isUserMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">A minha conta</p>
                    </div>
                    
                    <button className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                      <User className="w-4 h-4" />
                      Perfil
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                      <Settings className="w-4 h-4" />
                      Definições
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                      <HelpCircle className="w-4 h-4" />
                      Ajuda
                    </button>
                    
                    <div className="h-px bg-slate-50 my-2" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Terminar Sessão
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
