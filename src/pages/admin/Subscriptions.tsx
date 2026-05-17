import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Doc {
  id: number;
  doc_type: string;
  doc_number: string | null;
  total: number;
  status: string;
  issue_date: string | null;
}

export function AdminPlanos() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinancials() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('financial_documents')
          .select('id, doc_type, doc_number, total, status, issue_date')
          .limit(20);
        
        if (!error) setDocs(data || []);
      } catch (err) {
        console.error(err);
      } finaly {
        setLoading(false);
      }
    }
    loadFinancials();
  }, []);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 text-left overflow-y-auto">
      <div className="mb-6">
        <span className="text-xs font-mono text-purple-400 uppercase">Módulo Financeiro</span>
        <h2 className="text-2xl font-black text-white">Faturação e Licenciamento</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        {loading ? (
          <div className="text-xs font-mono text-slate-500 text-center py-4">A consultar fluxo financeiro...</div>
        ) : docs.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center py-4 italic">Nenhum registo de faturação localizado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                  <th className="pb-2">Documento</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {docs.map(d => (
                  <tr key={d.id} className="text-slate-300">
                    <td className="py-2.5 font-bold text-white">{d.doc_number || `#${d.id}`}</td>
                    <td className="py-2.5 uppercase text-slate-400">{d.doc_type}</td>
                    <td className="py-2.5 text-emerald-400">{Number(d.total).toFixed(2)}€</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
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
