import React from 'react';

export function AdminInstances() {
  return (
    <div className="flex-1 p-6 md:p-10 bg-slate-950 text-slate-100 overflow-y-auto text-left">
      <div className="mb-10">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Motor de Ligação VPS</span>
        <h2 className="text-3xl font-black text-white mt-1.5 tracking-tighter">Instâncias Evolution API</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-10 text-center max-w-2xl mx-auto mt-12 shadow-[0_0_60px_rgba(34,211,238,0.05)] border-t-cyan-500/20">
        <div className="text-5xl mb-6 select-none opacity-90 transition-transform hover:scale-110">Orquestrador Ativo</div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight">Gestão Descentralizada de Ligações</h3>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          As instâncias de WhatsApp não são geridas de forma isolada nesta tabela. Elas estão associadas diretamente aos números de contacto definidos na tabela de <span className="text-indigo-400 font-mono font-black">clients</span>. Os webhooks da Evolution API comunicam de forma nativa através do core do motor do backend, ligando cada empresa ao seu respetivo canal de conversa. Status: <span className="text-emerald-400 font-black">ATIVO</span>.
        </p>
        <div className="mt-8 p-3.5 bg-slate-950 border border-slate-850/60 rounded-xl flex items-center justify-between text-left font-mono text-[11px] text-slate-500 gap-4">
          <span>⚙️ Endpoint Gateway Core: /webhook/evolution</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-black">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CONNECTED
          </span>
        </div>
      </div>
    </div>
  );
}
