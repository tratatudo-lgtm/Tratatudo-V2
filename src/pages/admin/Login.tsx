import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      alert(`Tentando autenticar: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(`Erro do Supabase: ${error.message}`);
        setErrorMsg(`Erro: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data?.session) {
        alert(`✅ SUCESSO! Usuário autenticado: ${data.user?.email}\nToken gerado com sucesso.`);
        
        // Teste de leitura imediata para ver se a sessão persiste
        const { data: checkData } = await supabase.auth.getSession();
        alert(`Status da Sessão Local: ${checkData.session ? "Sessão ativa no storage" : "⚠️ Alerta: Sessão sumiu do storage!"}`);

        alert("A tentar redirecionar para /admin/clients ...");
        navigate('/admin/clients');
        
      } else {
        alert("⚠️ O Supabase não devolveu nenhuma sessão ativa.");
      }

    } catch (err: any) {
      alert(`Erro fatal no código: ${err.message || err}`);
      setErrorMsg('Erro inesperado ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
            <h1 className="text-lg font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">Diag Mode</span></h1>
          </div>
          <p className="text-xs text-slate-400">Modo de Diagnóstico de Autenticação</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs py-3 px-4 rounded-xl text-center font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Email Admin</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teu-email@tratatudo.pt"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Palavra-passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
          >
            {loading ? 'A processar...' : 'Iniciar Teste de Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
