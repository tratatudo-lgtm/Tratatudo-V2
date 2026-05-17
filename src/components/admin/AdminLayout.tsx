import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Função para fazer logout do ecossistema Admin
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  // Definição dos botões da barra de navegação superior (Rotas sincronizadas com o teu App.tsx)
  const navItems = [
    { label: '📊 Visão', path: '/admin/dashboard' },
    { label: '💼 CRM Clientes', path: '/admin/clients' },
    { label: '⚙️ Instâncias', path: '/admin/instances' },
    { label: '🎫 Tickets', path: '/admin/tickets' },
    { label: '💬 Mensagens', path: '/admin/messages' },
    { label: '💳 Planos', path: '/admin/subscriptions' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30">
      
      {/* 👑 BARRA DE NAVEGAÇÃO SUPERIOR COCKPIT (UNIFICADA) */}
      <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-50 px-4 md:px-6 py-3 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        
        {/* LOGO & IDENTIDADE */}
        <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-black text-xs text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            TT
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-widest text-white">TrataTudo HQ</h1>
            <p className="text-[9px] font-mono text-slate-500">Central Core Engine v2.0</p>
          </div>
        </div>

        {/* BOTÕES DE NAVEGAÇÃO DE PÁGINAS */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/60 w-full sm:w-auto overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-black tracking-tight whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 border border-indigo-500/50'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ACÇÕES DE SESSÃO */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
            🟢 ADMIN ACTIVE
          </span>
          <button
            onClick={handleLogout}
            className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 px-2.5 py-1 rounded-lg"
          >
            Sair ➔
          </button>
        </div>
      </header>

      {/* 🚀 CONTEÚDO DINÂMICO DAS SUB-ROTAS (Onde renderizam os teus ficheiros Dashboard, Clients, etc.) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

    </div>
  );
}
