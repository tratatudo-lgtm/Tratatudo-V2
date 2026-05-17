import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'sandbox' | 'tickets'>('overview');

  // Dados da Base de Dados
  const [clients, setClients] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  
  // Contadores Gerais
  const [stats, setStats] = useState({ clientsCount: 0, openTickets: 0, activeDemos: 0, totalRevenue: 0 });

  // Estados de Criação / Edição
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  
  // Formulário Novo Cliente
  const [newCompName, setNewCompName] = useState('');
  const [newVat, setNewVat] = useState('');
  const [newPrice, setNewPrice] = useState(149);

  // Formulário Nova Sandbox
  const [sandboxCompany, setSandboxCompany] = useState('');
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [sandboxPhone, setSandboxPhone] = useState('');

  useEffect(() => {
    async function initDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      await refreshAllData();
    }
    initDashboard();
  }, [navigate]);

  async function refreshAllData() {
    setLoading(true);
    try {
      // 1. Puxar Clientes
      const { data: clientData } = await supabase.from('clients').select('*').order('company_name', { ascending: true });
      const currentClients = clientData || [];
      setClients(currentClients);

      // 2. Puxar Tickets
      const { data: ticketData } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      const currentTickets = ticketData || [];
      setTickets(currentTickets);

      // 3. Puxar Sandbox Demos (usando wa_chats com prefixo)
      const { data: chatData } = await supabase.from('wa_chats').select('*').like('id', 'demo_%');
      const currentDemos = (chatData || []).map((c: any) => ({
        id: c.id,
        ...c.metadata
      }));
      setDemos(currentDemos);

      // Calcular Métricas Ativas
      const revenue = currentClients.reduce((acc, c) => acc + (Number(c.monthly_price) || 0), 0);
      const openT = currentTickets.filter((t: any) => t.status === 'open' || t.status === 'pending').length;

      setStats({
        clientsCount: currentClients.length,
        openTickets: openT,
        activeDemos: currentDemos.filter((d: any) => d.is_active).length,
        totalRevenue: revenue
      });

    } catch (err) {
      console.error("Erro geral na Engine:", err);
    } finally {
      setLoading(false);
    }
  }

  // Ações de Negócio
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName) return;
    try {
      const { error } = await supabase.from('clients').insert([{
        id: `cli_${Date.now()}`,
        company_name: newCompName,
        vat_number: newVat,
        plan_status: 'active',
        monthly_price: Number(newPrice),
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      setNewCompName(''); setNewVat('');
      alert('Cliente registado no CRM!');
      await refreshAllData();
    } catch (err) { alert('Erro ao criar cliente.'); }
  };

  const handleCreateSandbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxCompany || !sandboxPrompt) return;
    try {
      const demoId = `demo_${Date.now()}`;
      const metadata = { company_name: sandboxCompany, system_prompt: sandboxPrompt, lead_phone: sandboxPhone, is_active: true, created_at: new Date().toISOString() };
      const { error } = await supabase.from('wa_chats').insert([{ id: demoId, metadata }]);
      if (error) throw error;
      setSandboxCompany(''); setSandboxPrompt(''); setSandboxPhone('');
      alert('Prompt de teste injetado no número Master!');
      await refreshAllData();
    } catch (err) { alert('Erro ao instanciar Sandbox.'); }
  };

  const handleUpdateTicket = async (id: string, nextStatus: string) => {
    try {
      await supabase.from('tickets').update({ status: nextStatus }).eq('id', id);
      alert(`Ticket atualizado para ${nextStatus}`);
      setSelectedTicket(null);
      await refreshAllData();
    } catch (err) { alert('Erro ao atualizar ticket.'); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono text-xs tracking-widest animate-pulse">
      CONECTANDO AO SYS_ENGINE CORE V2...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-16">
      
      {/* HEADER PREMIUM */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
              <h1 className="text-base font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">HQ</span></h1>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Controlo Central de Infraestrutura</p>
          </div>
          <button onClick={handleLogout} className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all">
            Sair 🪓
          </button>
        </div>

        {/* CONTROLO DE ABAS MOBILE */}
        <div className="max-w-7xl mx-auto mt-4 grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/60">
          <button onClick={() => setActiveTab('overview')} className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Visão</button>
          <button onClick={() => setActiveTab('crm')} className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${activeTab === 'crm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>CRM</button>
          <button onClick={() => setActiveTab('sandbox')} className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${activeTab === 'sandbox' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sandbox</button>
          <button onClick={() => setActiveTab('tickets')} className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${activeTab === 'tickets' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Tickets</button>
        </div>
      </header>

      {/* CONTEÚDO DINÂMICO POR ABA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 mt-6 text-left">
        
        {/* ABA 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">💼 Clientes SaaS</span>
                <span className="text-2xl font-black text-white">{stats.clientsCount}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">💰 MRR Recorrente</span>
                <span className="text-2xl font-black text-emerald-400">{stats.totalRevenue}€</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">🎫 Suporte Aberto</span>
                <span className="text-2xl font-black text-rose-400">{stats.openTickets}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">🔮 Testes de Bots</span>
                <span className="text-2xl font-black text-purple-400">{stats.activeDemos}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 p-5 rounded-2xl text-center space-y-3">
              <h3 className="font-bold text-sm text-white">Fila de Atalhos Rápidos</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">Navega pelas abas superiores no teu telemóvel para gerir faturas, alterar inteligência artificial de leads ou fechar tickets de clientes.</p>
              <div className="pt-2 flex justify-center gap-2">
                <button onClick={() => navigate('/admin/clients')} className="bg-slate-900 hover:bg-slate-800 text-xs font-bold px-4 py-2 rounded-xl border border-slate-800">Abrir Live Chat ➔</button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CRM EXPANDIDO */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleCreateClient} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">➕ Matricular Novo Cliente</h3>
              <input type="text" required placeholder="Nome da Empresa (Ex: TrataTudo)" value={newCompName} onChange={e => setNewCompName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="NIF" value={newVat} onChange={e => setNewVat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                <input type="number" placeholder="Mensalidade (€)" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs">Ativar Contrato Comercial</button>
            </form>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400">Lista de Contas</h3>
              {clients.map(c => (
                <div key={c.id} onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-white">{c.company_name}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{c.monthly_price}€/mês</span>
                  </div>
                  {selectedClient?.id === c.id && (
                    <div className="pt-2 border-t border-slate-800/60 text-[11px] space-y-1 text-slate-400 font-mono">
                      <p>🆔 ID: {c.id}</p>
                      <p>🧾 NIF: {c.vat_number || 'Não Configurado'}</p>
                      <p>📬 Morada: {c.fiscal_address || 'Não Configurada'}</p>
                      <p>🟢 Status: <span className="text-white uppercase font-bold">{c.plan_status}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: SANDBOX IA (SIMULADOR) */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleCreateSandbox} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">🔮 Injetar Prompt de Demonstração</h3>
              <input type="text" required placeholder="Nome da Lead/Empresa" value={sandboxCompany} onChange={e => setSandboxCompany(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
              <input type="text" placeholder="Telemóvel da Lead (Ex: 351912345678)" value={sandboxPhone} onChange={e => setSandboxPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
              <textarea rows={3} required placeholder="Prompt: Como o bot deve agir para esta empresa?" value={sandboxPrompt} onChange={e => setSandboxPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none" />
              <button type="submit" className="w-full bg-purple-600 text-white font-bold py-2 rounded-xl text-xs">Vincular ao Número Master</button>
            </form>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400">Instâncias de Simulação Ativas</h3>
              {demos.map((d, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-white">{d.company_name}</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-mono">READY</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic font-mono bg-slate-950 p-2 rounded-lg">"{d.system_prompt}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400">Fila de Incidências</h3>
              {tickets.map(t => (
                <div key={t.id} onClick={() => setSelectedTicket(selectedTicket?.id === t.id ? null : t)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-white block">{t.subject}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Prioridade: {t.priority?.toUpperCase()}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${t.status === 'open' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                      {t.status?.toUpperCase()}
                    </span>
                  </div>
                  
                  {selectedTicket?.id === t.id && (
                    <div className="pt-3 border-t border-slate-800/60 space-y-3">
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2 rounded-lg font-mono">"{t.description}"</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleUpdateTicket(t.id, 'resolved')} className="flex-1 bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-[10px]">✔ Resolver</button>
                        <button type="button" onClick={() => handleUpdateTicket(t.id, 'closed')} className="flex-1 bg-slate-800 text-slate-400 font-bold py-1.5 rounded-lg text-[10px]">🔒 Fechar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {tickets.length === 0 && (
                <p className="text-xs font-mono text-slate-600 text-center py-6">Nenhum ticket pendente no momento.</p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
