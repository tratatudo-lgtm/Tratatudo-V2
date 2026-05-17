import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Instance {
  id: number;
  instance_name: string;
  status: string;
  is_hub: boolean;
  created_at: string;
}

export function AdminInstances() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInstances() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('client_instances')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInstances(data || []);
      } catch (err) {
        console.error("Erro ao ler client_instances:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInstances();
  }, []);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 text-left overflow-y-auto">
      <div className="mb-6">
        <span className="text-xs font-mono text-cyan-400 uppercase">Evolution API</span>
        <h2 className="text-2xl font-black text-white">Instâncias de Comunicação</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-xs font-mono text-slate-500 text-center p-8">A consultar client_instances...</div>
        ) : instances.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center p-8 italic">Nenhuma instância conectada de momento.</div>
        ) : (
          <div className="p-4 space-y-3">
            {instances.map(ins => (
              <div key={ins.id} className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between font-mono text-xs">
                <div>
                  <div className="text-white font-bold text-sm">{ins.instance_name}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Tipo: {ins.is_hub ? 'Central/Hub' : 'Cliente Dedicado'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  ins.status === 'open' || ins.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  ● {ins.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
