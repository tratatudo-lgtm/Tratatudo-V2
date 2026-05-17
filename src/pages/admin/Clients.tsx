import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toas, toast } from 'sonner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Client {
  id: string;
  name: string;
  nif: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  plan: string;
  created_at: string;
  phone?: string;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estado para o Modal de Criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', nif: '', email: '', phone: '', plan: 'Standard' });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      // Ajusta o nome da tabela conforme o teu banco de dados
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao carregar dados: ${err.message || 'Verifica a tabela'}`);
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
          name: formData.name,
          nif: formData.nif,
          email: formData.email,
          phone: formData.phone,
          plan: formData.plan,
          status: 'active'
        }]);

      if (error) throw error;

      toast.success('Cliente matriculado com sucesso!');
      setIsModalOpen(false);
      setFormData({ name: '', nif: '', email: '', phone: '', plan: 'Standard' });
      fetchClients();
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    }
  }

  // Filtros em tempo real
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.nif?.includes(searchTerm) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-950 text-slate-100 overflow-y-auto">
      
      {/* HEADER DE CONTEXTO LOCAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Módulo de Gestão</span>
          <h2 className="text-2xl font-black text-white tracking-tight">Portfólio de Contratos CRM</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-black text-xs uppercase px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          ➕ Matricular Novo Cliente
        </button>
      </div>

      {/* 📊 KPI CARDS SUPERIORES - DEIXA O CRM COM CARA DE PORTAL SERIO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Clientes Ativos</p>
          <p className="text-2xl font-black text-white mt-1">
            {clients.filter(c => c.status === 'active').length} <span className="text-xs font-normal text-slate-500">/ {clients.length}</span>
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Faturação Estimada (MRR)</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {(clients.filter(c => c.status === 'active').length * 49).toFixed(2)}€
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Instâncias Reais Evolution</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">🎛️ Ativas</p>
        </div>
      </div>

      {/* ⚡ CONTROLO DE FILTROS E PESQUISA */}
      <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Procurar por Nome, NIF ou Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'active', 'pending', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {status === 'all' ? 'Ver Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* 🖥️ DATA TABLE DE EMPRESAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-slate-500 italic">
            A ler dados da infraestrutura Supabase...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-3xl mb-3">🏢</div>
            <p className="font-mono text-xs text-slate-400 font-bold">Nenhum cliente localizado no ecossistema.</p>
            <p className="text-[11px] text-slate-500 mt-1">Altera os filtros ou adiciona uma nova empresa acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-black">Empresa / Contacto</th>
                  <th className="p-4 font-black">NIF</th>
                  <th className="p-4 font-black">Plano Ativo</th>
                  <th className="p-4 font-black">Estado</th>
                  <th className="p-4 font-black text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-850/40 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors">{client.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{client.email}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {client.nif || '---'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-md text-[10px] font-mono text-indigo-300 font-bold">
                        {client.plan || 'Standard'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase ${
                        client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        client.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => window.location.href = `/app/clients/${client.id}`}
                          className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-mono font-bold text-slate-300 hover:text-white rounded-md transition-all"
                        >
                          Gerir Ficha ➔
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📦 MODAL OVERLAY - ADICIONAR CLIENTE EXPRESS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-base font-black text-white mb-1 uppercase tracking-wider font-mono">➕ Matricular Novo Cliente</h3>
            <p className="text-xs text-slate-400 mb-4">Insere os dados fiscais e de contacto para ativar o painel operacional.</p>
            
            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Nome Comercial da Empresa</label>
                <input
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Ex: TrataTudo Unipessoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">NIF</label>
                  <input
                    type="text" required
                    value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="249000000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Plano Base</label>
                  <select
                    value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Pro Core">Pro Core</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email de Contacto</label>
                <input
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="geral@empresa.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Telemóvel (WhatsApp Link)</label>
                <input
                  type="text"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="351912345678"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-mono py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Gravar no Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
