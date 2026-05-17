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
  master_prompt: string | null;
  bot_instructions: string | null;
  created_at: string;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', email: '', phone_e164: '', status: 'active' });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          company_name: formData.company_name,
          email: formData.email || null,
          phone_e164: formData.phone_e164,
          status: formData.status
        }]);

      if (error) throw error;

      toast.success('Cliente matriculado com sucesso!');
      setIsModalOpen(false);
      setFormData({ company_name: '', email: '', phone_e164: '', status: 'active' });
      fetchClients();
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    }
  }

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone_e164?.includes(searchTerm) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Clientes Ativos</p>
          <p className="text-2xl font-black text-white mt-1">
            {clients.filter(c => c.status === 'active').length} <span className="text-xs font-normal text-slate-500">/ {clients.length}</span>
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Total Canais WhatsApp</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{clients.length} Links</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Procurar por Empresa, Telefone ou Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none"
        />
        <div className="flex gap-2">
          {['all', 'active', 'trial', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all ${
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
          <div className="p-12 text-center font-mono text-xs text-slate-500 italic">A ler infraestrutura...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-black">Empresa / Email</th>
                  <th className="p-4 font-black">Contacto WhatsApp</th>
                  <th className="p-4 font-black">Estado</th>
                  <th className="p-4 font-black">Criado Em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-850/40 text-xs text-slate-300">
                    <td className="p-4">
                      <div className="font-bold text-white">{client.company_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{client.email || 'sem email'}</div>
                    </td>
                    <td className="p-4 font-mono">{client.phone_e164}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                        client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{client.status}</span>
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">{new Date(client.created_at).toLocaleDateString('pt-PT')}</td>
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
            <h3 className="text-sm font-black text-white mb-4 uppercase font-mono tracking-wider">Matricular Novo Cliente</h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nome da Empresa</label>
                <input type="text" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Contacto WhatsApp (com Indicativo)</label>
                <input type="text" required value={formData.phone_e164} onChange={e => setFormData({...formData, phone_e164: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="351912345678" />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono py-2 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-mono text-xs py-2 rounded-xl">Gravar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
