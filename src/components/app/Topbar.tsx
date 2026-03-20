import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search, User, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

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
          <Link to="/app/pedidos" className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">16</span>
          </Link>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <button className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user?.phone_e164?.slice(-2) || 'TT'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{user?.company_name || 'Cliente'}</p>
              <p className="text-[10px] text-slate-500 mt-1">{user?.phone_e164 || 'Sem número'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
