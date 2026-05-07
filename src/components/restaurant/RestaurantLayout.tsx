
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { RestaurantSidebar } from './RestaurantSidebar';
import { 
  Bell, 
  Search, 
  User, 
  Menu,
  X,
  Store,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';

interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export function RestaurantLayout({ children }: RestaurantLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden relative">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:block fixed inset-y-0 left-0 z-50 transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <RestaurantSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-white shadow-2xl lg:hidden"
            >
              <div className="h-full flex flex-col">
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="font-display font-black text-slate-900 leading-none">PORTAL</h1>
                      <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Restaurante</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <RestaurantSidebar 
                    isOpen={true} 
                    setIsOpen={() => {}} 
                    onItemClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0 w-full",
        isSidebarOpen ? "lg:pl-64" : "lg:pl-20"
      )}>
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 w-64 lg:w-96">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar pedidos, clientes..." 
                className="bg-transparent border-none outline-none text-sm text-slate-900 w-full font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-10 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3 px-1.5 py-1.5 bg-white rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                {user?.company_name?.charAt(0) || 'R'}
              </div>
              <div className="hidden sm:block pr-2">
                <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user?.company_name || 'Restaurante'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Portal</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
