import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Ticket {
  id: number;
  customer_name: string; // Coluna validada
  customer_contact: string; // Coluna validada
  subject: string | null; // Coluna validada
  description: string; // Coluna validada
  priority: string; // Coluna validada
  status: string; // Coluna validada
  created_at: string;
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        // Puxa os dados genéricos, sem filtros estritos de status que podem quebrar
        const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setTickets(data || []);
      } catch (err: any) {
        console.error('Erro ao ler tickets:', err.message);
        // Blindagem try/catch: Não crasha a aplicação, apresenta array vazio
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 overflow-y-auto text-left selection:bg-rose-500/30">
      <div className="mb-8">
        <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Fila de Suporte Operacional</span>
        <h2 className="text-2xl font-black text-white mt-1 tracking-tight">Gestão de Incidentes</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="text-center font-mono text-xs text-slate-500 p-12">A ler tickets do Supabase...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center font-mono text-xs text-slate-500 p-12 italic">Sem tickets registados de momento.</div>
        ) : (
          <div className="space-y-3.5 p-4 bg-slate-950/40 divide-y divide-slate-850">
            {tickets.map(t => (
              <div key={t.id} className="pt-3.5 pb-0 first:pt-0 bg-transparent flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs leading-relaxed group">
                <div className="space-y-0.5 max-w-2xl">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{t.customer_name} ({t.customer_contact})</span>
                  </div>
                  <p className="text-slate-300 font-sans whitespace-pre-wrap">{t.subject || t.description}</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border rounded ${
                    t.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}>
                    {t.priority}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
