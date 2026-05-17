import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface SubscriptionDoc {
  id: number;
  doc_type: string;
  doc_number: string | null;
  total: number;
  status: string;
  created_at: string;
}

export function AdminSubscriptions() {
  const [docs, setDocs] = useState<SubscriptionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        setLoading(true);
        // Puxa o histórico de faturação real mapeado no teu Supabase
        const { data, error } = await supabase
          .from('financial_documents')
          .select('id, doc_type, doc_number, total, status, created_at')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        setDocs(data || []);
      } catch (err) {
        console.error("Erro ao carregar Subscriptions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubscriptions();
  }, []);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 text-left overflow-y-auto">
      <div className="mb-6">
        <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Módulo de Contratos</span>
        <h2 className="text-2xl font-black text-white tracking-tight">Subscrições e Faturação</h2>
      </div>

      {/* 📊 KPI RÁPIDO */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 max-w-xs">
        <p className="text-[10px] font-mono text-slate-400 uppercase">Faturamento Monitorizado</p>
        <p className="text-xl font-black text-emerald-400 mt-1">
          {docs.reduce((acc, current) => acc + Number(current.total), 0).toFixed(2)}€
        </p>
      </div>

      {/* TABELA DE SUBSCRICÕES / DOCUMENTOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-xs font-mono text-slate-500 text-center py-8">A consultar fluxo financeiro do Supabase...</div>
        ) : docs.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center py-8 italic">Nenhum registo de faturação ou subscrição localizado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="text-slate-400 bg-slate-950/50 uppercase text-[10px] border-b border-slate-800 tracking-wider">
                  <th className="p-4 font-black">Documento</th>
                  <th className="p-4 font-black">Tipo</th>
                  <th className="p-4 font-black">Valor Total</th>
                  <th className="p-4 font-black text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {docs.map(d => (
                  <tr key={d.id} className="hover:bg-slate-850/40 text-slate-300">
                    <td className="p-4 font-bold text-white">{d.doc_number || `#Fatura-${d.id}`}</td>
                    <td className="p-4 uppercase text-slate-400">{d.doc_type}</td>
                    <td className="p-4 font-bold text-emerald-400">{Number(d.total).toFixed(2)}€</td>
                    <td className="p-4 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        d.status === 'paid' || d.status === 'pago' || d.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
