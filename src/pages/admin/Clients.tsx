import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface ClientProfile {
  id: string;
  company_name: string;
  vat_number: string; // NIF
  fiscal_address: string;
  billing_email: string;
  plan_status: 'active' | 'trial' | 'suspended' | 'overdue';
  monthly_price: number;
  created_at: string;
}

export function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  
  // Estados de Edição da Ficha
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [status, setStatus] = useState<ClientProfile['plan_status']>('active');
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      loadClients();
    }
    checkAuthAndLoad();
  }, [navigate]);

  async function loadClients() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name, vat_number, fiscal_address, billing_email, plan_status, monthly_price, created_at')
        .order('company_name', { ascending: true });

      if (error) throw error;
      if (data) setClients(data as any);
    } catch (err) {
      console.error('Erro ao ler tabela de clientes:', err);
    } finally {
      setLoading(false);
    }
  }

  const openClientDetails = (client: ClientProfile) => {
    setSelectedClient(client);
    setVatNumber(client.vat_number || '');
    setAddress(client.fiscal_address || '');
    setBEmail(client.billing_email || '');
    setStatus(client.plan_status || 'active');
    setPrice(client.monthly_price || 0);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          vat_number: vatNumber,
          fiscal_address: address,
          billing_email: bEmail,
          plan_status: status,
          monthly_price: Number(price)
        })
        .eq('id', selectedClient.id);

      if (error) throw error;

      alert(`Ficha de ${selectedClient.company_name} atualizada com sucesso!`);
      setSelectedClient(null);
      loadClients();
    } catch (err) {
      alert('Erro ao guardar alterações na base de dados.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono text-xs tracking-widest animate-pulse">
      CONECTANDO AO CRM CENTRAL...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-6 flex flex-col">
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">TrataTudo <span className="text-emerald-400">CRM Portfolio</span></h1>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">Controlo de Contas, Faturação e Credenciais Fiscais</p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Lista de Empresas Cadastradas */}
        <div className="lg:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">🏢 Portfólio de Clientes ({clients.length})</h2>
          <div className="space-y-2">
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => openClientDetails(client)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedClient?.id === client.id ? 'bg-emerald-950/20 border-emerald-500' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-white truncate max-w-[160px]">{client.company_name}</h3>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                    client.plan_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    client.plan_status === 'trial' ? 'bg-indigo-500/20 text-indigo-400' :
                    client.plan_status === 'suspended' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {client.plan_status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-400">
                  <span>NIF: {client.vat_number || '---'}</span>
                  <span className="text-white font-bold">{client.monthly_price || 0}€/mês</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de Detalhes / Ficha do Cliente */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl h-[650px] overflow-hidden flex flex-col">
          {selectedClient ? (
            <form onSubmit={handleUpdateClient} className="flex-1 flex flex-col justify-between text-left">
              
              <div className="p-5 bg-slate-900/40 border-b border-slate-800">
                <h3 className="font-black text-white text-base uppercase tracking-wide">Ficha Corporativa: {selectedClient.company_name}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID Único do Sistema: {selectedClient.id}</p>
              </div>

              {/* Corpo dos Inputs do CRM */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">NIF / Número de Contribuinte</label>
                    <input
                      type="text"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder="9 dígitos fiscais"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Email para Faturação</label>
                    <input
                      type="email"
                      value={bEmail}
                      onChange={(e) => setBEmail(e.target.value)}
                      placeholder="financeiro@empresa.pt"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Morada Fiscal Completa</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Código Postal, Localidade"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Estado da Subscrição</label>
                    <div className="bg-slate-950 rounded-xl border border-slate-800 px-3 py-1">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full bg-transparent text-xs text-slate-200 py-2 font-mono outline-none cursor-pointer"
                      >
                        <option value="active" className="bg-slate-900">🟢 ACTIVE - Acesso Total</option>
                        <option value="trial" className="bg-slate-900">🔵 TRIAL - Período de Teste</option>
                        <option value="overdue" className="bg-slate-900">🟡 OVERDUE - Fatura em Atraso</option>
                        <option value="suspended" className="bg-slate-900">🔴 SUSPENDED - Bloquear Painel</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Mensalidade Acordada (€)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Gravação */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  {saving ? 'A atualizar metadados...' : 'Gravar Alterações na Ficha ➔'}
                </button>
              </div>

            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <div className="text-3xl mb-2">🏢</div>
              <p className="text-xs font-mono">Seleciona uma empresa no menu lateral para auditar ou gerir a ficha de CRM.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
