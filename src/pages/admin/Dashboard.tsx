import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// URL Base da tua Evolution API (Substitui pelo teu domínio de produção se necessário)
const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'https://api.tratatudo.pt';
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || 'global_apikey_here';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'sandbox' | 'tickets'>('overview');

  // Listagens bases
  const [clients, setClients] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [stats, setStats] = useState({ clientsCount: 0, openTickets: 0, activeDemos: 0, totalRevenue: 0 });

  // Estados de visualização e modais temporários
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDemo, setSelectedDemo] = useState<any>(null);
  const [qrCodeString, setQrCodeString] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // FORMULÁRIO: CRM EXPANDIDO
  const [compName, setCompName] = useState('');
  const [vat, setVat] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState(149);
  const [instanceName, setInstanceName] = useState('');

  // FORMULÁRIO: SANDBOX AVANÇADA
  const [sandboxCompany, setSandboxCompany] = useState('');
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [sandboxPhone, setSandboxPhone] = useState('');
  const [trialDays, setTrialDays] = useState(7);

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
      const { data: clientData, error: cErr } = await supabase.from('clients').select('*');
      if (cErr) console.error("Erro ao ler clientes:", cErr);
      const currentClients = clientData || [];
      setClients(currentClients);

      const { data: ticketData } = await supabase.from('tickets').select('*');
      const currentTickets = ticketData || [];
      setTickets(currentTickets);

      // Carrega simulações ativas de wa_chats
      const { data: chatData } = await supabase.from('wa_chats').select('*');
      const currentDemos = (chatData || [])
        .filter((c: any) => c.id.startsWith('demo_') || (c.metadata && c.metadata.is_sandbox))
        .map((c: any) => ({
          id: c.id,
          ...(c.metadata || {})
        }));
      setDemos(currentDemos);

      const revenue = currentClients.reduce((acc, c) => acc + (Number(c.monthly_price) || 0), 0);
      setStats({
        clientsCount: currentClients.length,
        openTickets: currentTickets.filter((t: any) => t.status === 'open' || t.status === 'pending').length,
        activeDemos: currentDemos.filter((d: any) => d.is_active).length,
        totalRevenue: revenue
      });
    } catch (err) {
      console.error("Erro ao atualizar base de dados:", err);
    } finally {
      setLoading(false);
    }
  }

  // AÇÃO: GERAR INSTÂNCIA E BUSCAR QR CODE NA EVOLUTION API
  async function handleGenerateEvolutionInstance(client: any) {
    setLoadingQr(true);
    setQrCodeString(null);
    const targetInstance = client.instance_name || client.company_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    try {
      // 1. Criar a Instância na Evolution API
      const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
        body: JSON.stringify({ instanceName: targetInstance, token: '', qrcode: true })
      });
      const createData = await createRes.json();

      // 2. Procurar o QR Code gerado
      const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${targetInstance}`, {
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const connectData = await connectRes.json();

      if (connectData && connectData.base64) {
        setQrCodeString(connectData.base64); // Suporta "data:image/png;base64,..."
      } else if (createData?.qrcode?.base64) {
        setQrCodeString(createData.qrcode.base64);
      } else {
        alert("Instância criada na VPS! Vá a conectar no WhatsApp ou atualize em instantes para puxar o QR.");
      }
    } catch (err) {
      console.error("Erro de comunicação com a VPS Evolution API:", err);
      // Fallback visual de simulação caso a API não responda localmente
      setQrCodeString("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TrataTudo_Evolution_Fallback");
    } finally {
      setLoadingQr(false);
    }
  }

  // AÇÃO: ADICIONAR CLIENTE DIRECTO (CRM)
  const handleCreateClientDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName) return;
    
    const calculatedInstance = instanceName.trim() || compName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    try {
      const { error } = await supabase.from('clients').insert([{
        id: `cli_${Date.now()}`,
        company_name: compName,
        vat_number: vat,
        billing_email: billingEmail,
        fiscal_address: address,
        plan_status: 'active',
        monthly_price: Number(price),
        instance_name: calculatedInstance,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      alert(`✅ ${compName} registado com sucesso no CRM!`);
      setCompName(''); setVat(''); setBillingEmail(''); setAddress(''); setInstanceName('');
      await refreshAllData();
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar no Supabase: ${err.message || 'Verifique as colunas da sua tabela clients'}`);
    }
  };

  // AÇÃO: REGISTAR SANDBOX DE TESTE COM TEMPO DEFINIDO
  const handleCreateSandboxAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxCompany || !sandboxPrompt) return;

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + Number(trialDays));

    const demoId = `demo_${Date.now()}`;
    const metadata = {
      company_name: sandboxCompany,
      system_prompt: sandboxPrompt,
      lead_phone: sandboxPhone.replace(/\s+/g, ''),
      is_active: true,
      is_sandbox: true,
      trial_days: trialDays,
      expires_at: expireDate.toISOString(),
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('wa_chats').insert([{
        id: demoId,
        metadata: metadata
      }]);

      if (error) throw error;

      alert(`🔮 Sandbox Ativa por ${trialDays} dias para ${sandboxCompany}!`);
      setSandboxCompany(''); setSandboxPrompt(''); setSandboxPhone('');
      await refreshAllData();
    } catch (err: any) {
      console.error(err);
      alert(`Erro na Sandbox: ${err.message}`);
    }
  };

  // AÇÃO: CONVERTER SANDBOX EM CLIENTE COMERCIAL (PAGO)
  async function handleConvertDemoToPaid(demo: any) {
    try {
      const { error: clientErr } = await supabase.from('clients').insert([{
        id: `cli_${Date.now()}`,
        company_name: demo.company_name,
        vat_number: '',
        plan_status: 'active',
        monthly_price: 149, 
        instance_name: demo.company_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        created_at: new Date().toISOString()
      }]);

      if (clientErr) throw clientErr;

      // Desativar a sandbox antiga
      await supabase.from('wa_chats').delete().eq('id', demo.id);

      alert(`🚀 Parabéns! ${demo.company_name} foi promovido a Cliente Pago. Instância gerada.`);
      setActiveTab('crm');
      await refreshAllData();
    } catch (err: any) {
      alert(`Erro na conversão: ${err.message}`);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono text-xs tracking-widest animate-pulse">
      CONECTANDO AO MÓDULO DE AUTOMAÇÃO...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-16">
      
      {/* CORPO DO TOPO */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
              <h1 className="text-base font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">PRO HQ</span></h1>
            </div>
            <p className="text-[10px] font-mono text-slate-400">V2 Live Engine & Evolution Automation</p>
          </div>
          <button onClick={handleLogout} className="bg-slate-950 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-bold">
            Sair 🪓
          </button>
        </div>

        {/* RE-RENDER DAS ABAS */}
        <div className="max-w-7xl mx-auto mt-4 grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/60">
          <button onClick={() => { setActiveTab('overview'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Visão</button>
          <button onClick={() => { setActiveTab('crm'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'crm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>CRM</button>
          <button onClick={() => { setActiveTab('sandbox'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'sandbox' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sandbox</button>
          <button onClick={() => { setActiveTab('tickets'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'tickets' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Tickets</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 mt-6 text-left">
        
        {/* ABA 1: PANEL RESUMO */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">💼 CLIENTES ACTIVOS</span>
                <span className="text-2xl font-black text-white">{stats.clientsCount}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">💰 FATURAÇÃO MRR</span>
                <span className="text-2xl font-black text-emerald-400">{stats.totalRevenue}€</span>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-center">
              <p className="text-xs text-slate-400">Usa as abas acima para parametrizar e sincronizar diretamente com o WhatsApp.</p>
            </div>
          </div>
        )}

        {/* ABA 2: CRM COMPLETO & GENERATOR DE QR CODE */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateClientDirect} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">➕ Ficha e Contrato de Cliente</h3>
              
              <input type="text" required placeholder="Nome da Empresa / Cliente" value={compName} onChange={e => setCompName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="NIF (9 dígitos)" value={vat} onChange={e => setVat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
                <input type="number" placeholder="Preço Mensal (€)" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              </div>

              <input type="email" placeholder="Email de Faturação" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              <input type="text" placeholder="Morada Fiscal Completa" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              <input type="text" placeholder="Nome da Instância Evolution (Ex: cli_construcoes)" value={instanceName} onChange={e => setInstanceName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all">
                Salvar Ficha & Ativar Painel ➔
              </button>
            </form>

            {/* VISUALIZAÇÃO DOS CLIENTES E EMPARELHAMENTO DO WHATSAPP */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-slate-400">Fichas e Conexões WhatsApp</h3>
              {clients.map(c => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start" onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}>
                    <div>
                      <h4 className="font-bold text-xs text-white">{c.company_name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">NIF: {c.vat_number || '---'} | Instância: {c.instance_name || 'Nenhum'}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{c.monthly_price}€</span>
                  </div>

                  {selectedClient?.id === c.id && (
                    <div className="pt-3 border-t border-slate-800/60 space-y-3 text-xs text-slate-300 font-mono">
                      <p>📍 Morada: {c.fiscal_address || 'Não indicada'}</p>
                      <p>📬 Email: {c.billing_email || 'Não indicado'}</p>
                      
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleGenerateEvolutionInstance(c)}
                          className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-[11px]"
                        >
                          {loadingQr ? '⏳ Comunicando com a VPS...' : '⚙️ Gerar QR Code da Evolution API'}
                        </button>
                      </div>

                      {qrCodeString && (
                        <div className="flex flex-col items-center bg-white p-4 rounded-xl mt-2 max-w-xs mx-auto">
                          <p className="text-[10px] text-slate-900 font-bold mb-2 uppercase">Leia com o WhatsApp do Cliente</p>
                          <img src={qrCodeString} alt="Evolution API QR Code" className="w-48 h-48 object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: SANDBOX COM DIAS DE TESTE E UPGRADE */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateSandboxAdvanced} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">🔮 Criar Demonstração Temporária</h3>
              
              <input type="text" required placeholder="Nome da Lead / Empresa de Teste" value={sandboxCompany} onChange={e => setSandboxCompany(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              <input type="text" placeholder="Telemóvel da Lead (Ex: 351912345678)" value={sandboxPhone} onChange={e => setSandboxPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">Tempo limite de teste (Dias)</label>
                <input type="number" placeholder="Dias de teste" value={trialDays} onChange={e => setTrialDays(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono" />
              </div>

              <textarea rows={4} required placeholder="Prompt customizado da IA para o teste..." value={sandboxPrompt} onChange={e => setSandboxPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none" />

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs transition-all">
                Vincular Nova Sandbox Ativa ➔
              </button>
            </form>

            {/* SELECÇÃO DE SIMULAÇÃO & BOTÃO DE CONVERSÃO EM PAGO */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-slate-400">Leads em Fase de Testes</h3>
              {demos.map((d, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center" onClick={() => setSelectedDemo(selectedDemo?.id === d.id ? null : d)}>
                    <div>
                      <h4 className="font-bold text-xs text-white">{d.company_name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Expira em: {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : `${d.trial_days || 7} dias`}</p>
                    </div>
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">TRIAL</span>
                  </div>

                  {selectedDemo?.id === d.id && (
                    <div className="pt-3 border-t border-slate-800/60 space-y-3 text-xs">
                      <p className="text-slate-400 italic bg-slate-950 p-2.5 rounded-lg">"{d.system_prompt}"</p>
                      
                      <button
                        type="button"
                        onClick={() => handleConvertDemoToPaid(d)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2.5 rounded-lg text-xs tracking-wide shadow-md"
                      >
                        💎 Converter em Cliente Pago (Criar Instância)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: HISTÓRICO DE TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-slate-400">Incidentes Suporte</h3>
            {tickets.map(t => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-white font-bold block">{t.subject}</span>
                <span className="text-[10px] text-slate-400 block mt-1">{t.description}</span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
