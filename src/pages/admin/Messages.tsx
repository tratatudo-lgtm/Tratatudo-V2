import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface MessageLog {
  id: number;
  phone_e164: string;
  direction: string;
  message_text: string;
  created_at: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('wa_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Erro ao puxar wa_messages:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 text-left overflow-y-auto">
      <div className="mb-6">
        <span className="text-xs font-mono text-indigo-400 uppercase">Tráfego em Tempo Real</span>
        <h2 className="text-2xl font-black text-white">Mensagens Enviadas / Recebidas</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        {loading ? (
          <div className="text-xs font-mono text-slate-500 text-center py-6">A ler logs do WhatsApp...</div>
        ) : messages.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 text-center py-6 italic">Nenhuma mensagem registada na tabela wa_messages.</div>
        ) : (
          <div className="space-y-3">
            {messages.map(m => (
              <div key={m.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl font-mono text-xs flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    m.direction === 'inbound' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {m.direction === 'inbound' ? '📥 Cliente ➔ Bot' : '📤 Bot ➔ Cliente'}
                  </span>
                  <span className="text-[10px] text-slate-500">{m.phone_e164} | {new Date(m.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 mt-1 font-sans text-sm">{m.message_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
