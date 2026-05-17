import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, Link } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ clients: 0, chats: 0 });

  useEffect(() => {
    async function verifyAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      try {
        const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
        const { count: chatCount } = await supabase.from('wa_chats').select('*', { count: 'exact', head: true });
        
        setStats({
          clients: clientCount || 0,
          chats: chatCount || 0
        });
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    verifyAndLoad();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono text-xs tracking-widest animate-pulse">
      CARREGANDO COCKPIT ADMIN V2...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-6 flex flex-col">
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
              <h1 className="text-xl font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">V2 Engine</span></h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">Visão Geral do Sistema</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 border border-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-all"
          >
            Sair 🪓
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">⚡ Total de Clientes</h3>
            <p className="text-4xl font-black text-white">{stats.clients}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">🔮 Conversas Ativas</h3>
            <p className="text-4xl font-black text-indigo-400">{stats.chats}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-2">Painel de Controlo Central</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            A infraestrutura migrou com sucesso para Vite. Podes gerir os teus clientes e configurar instâncias da Evolution API diretamente no link abaixo.
          </p>
          <Link 
            to="/admin/clients" 
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20"
          >
            Ir para Monitor & Live Chat ➔
          </Link>
        </div>
      </main>
    </div>
  );
}
