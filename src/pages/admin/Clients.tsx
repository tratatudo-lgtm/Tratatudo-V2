import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Client {
  id: number;
  company_name: string;
  email: string | null;
  phone_e164: string;
  status: string;
  bot_instructions: string | null;
  created_at: string;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    company_name: '', 
    email: '', 
    phone_e164: '', 
    bot_instructions: '',
    isTrial: false 
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    try {
      const clientStatus = formData.isTrial ? 'trial' : 'active';
      
      const { error } = await supabase
        .from('clients')
        .insert([{
          company_name: formData.company_name,
          email: formData.email || null,
          phone_e164: formData.phone_e164,
          status: clientStatus,
          bot_instructions: formData.bot_instructions || 'Instruções padrão de triagem.'
        }]);

      if (error) throw error;

      toast.success('Cliente e Diretrizes do Bot gravados!');
      setIsModalOpen(false);
      setFormData({ company_name: '', email: '', phone_e164: '', bot_instructions: '', isTrial: false });
      fetchClients();
    } catch (err: any) {
      toast.error(`Erro ao matricular: ${err.message}`);
    }
  }

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone_e164?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Módulo de Gestão</span>
          <h2 className="text-2xl font-black text-white tracking-tight">Portfólio de Contratos CRM</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-black text-xs uppercase px-5 py-3 rounded-xl transition-all"
        >
          ➕ Matricular Novo Cliente
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Procurar empresa ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
        />
        <div className="flex gap-2">
          {['all', 'active', 'trial'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold ${
                statusFilter === st ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-slate-500">A ler infraestrutura Supabase...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center text-xs font-mono text-slate-500">Nenhum cliente localizado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Empresa / Contacto</th>
                  <th className="p-4">Programação do Bot (Instructions)</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-850/40 text-xs text-slate-300">
                    <td className="p-4">
                      <div className="font-bold text-white">{client.company_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{client.phone_e164}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-[11px] font-mono text-slate-400 italic">
                      {client.bot_instructions || 'Sem diretrizes configuradas'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                        client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 text-left">
            <h3 className="text-sm font-black text-white mb-4 uppercase font-mono tracking-wider">➕ Matricular Novo Cliente</h3>
            
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nome Comercial da Empresa</label>
                <input type="text" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Telefone WhatsApp</label>
                <input type="text" required value={formData.phone_e164} onChange={e => setFormData({...formData, phone_e164: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="351912345678" />
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Prompt / Diretriz do Bot</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Instruções para o Bot saber o que responder..."
                  value={formData.bot_instructions} 
                  onChange={e => setFormData({...formData, bot_instructions: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="trialCheck" checked={formData.isTrial} onChange={e => setFormData({...formData, isTrial: e.target.checked})} className="bg-slate-950 border border-slate-800 rounded" />
                <label htmlFor="trialCheck" className="text-xs text-slate-300 font-medium">Definir como Contrato de Teste (Trial)</label>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono py-2">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-mono font-bold text-xs py-2 rounded-xl">Gravar Contrato</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
