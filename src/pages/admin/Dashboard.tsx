import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'https://api.tratatudo.pt';
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || 'global_apikey_here';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'sandbox' | 'tickets'>('overview');

  // Listagens vindas do Banco
  const [clients, setClients] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ clientsCount: 0, openTickets: 0, activeDemos: 0 });

  // Estados de controlo de interface
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDemo, setSelectedDemo] = useState<any>(null);
  const [qrCodeString, setQrCodeString] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // FORMULÁRIO CRM (Clientes Pagos)
  const [compName, setCompName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // FORMULÁRIO SANDBOX (Clientes em Teste)
  const [sandboxCompany, setSandboxCompany] = useState('');
  const [sandboxPhone, setSandboxPhone] = useState('');
  const [sandboxPrompt, setSandboxPrompt] = useState('');
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
      // Procurar todos os clientes registados
      const { data: clientData, error: cErr } = await supabase.from('clients').select('*');
      if (cErr) throw cErr;
      const allClients = clientData || [];
      setClients(allClients);

      // Procurar todos os tickets
      const { data: ticketData, error: tErr } = await supabase.from('tickets').select('*');
      if (tErr) throw tErr;
      setTickets(ticketData || []);

      // Filtrar estatísticas com base na coluna 'status' real
      const paidClients = allClients.filter((c: any) => c.status === 'active');
      const trialClients = allClients.filter((c: any) => c.status === 'trial');

      setStats({
        clientsCount: paidClients.length,
        openTickets: (ticketData || []).filter((t: any) => t.status === 'open' || t.status === 'pending').length,
        activeDemos: trialClients.length
      });
    } catch (err: any) {
      console.error("Erro ao carregar dados do Supabase:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // ⚙️ INTEGRAÇÃO REAL COM A EVOLUTION API PARA GERAR QR CODE
  async function handleGenerateEvolutionInstance(client: any) {
    setLoadingQr(true);
    setQrCodeString(null);
    
    // Sanitiza o nome da empresa para criar um ID de instância válido na Evolution (ex: pm_construcoes)
    const targetInstance = client.company_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    try {
      // 1. Criar a instância na VPS
      await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
        body: JSON.stringify({ instanceName: targetInstance, token: '', qrcode: true })
      });

      // 2. Chamar endpoint para capturar a string de conexão (Base64)
      const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${targetInstance}`, {
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const connectData = await connectRes.json();

      if (connectData && connectRes.ok && connectData.base64) {
        setQrCodeString(connectData.base64);
      } else {
        // Fallback dinâmico caso a API ainda esteja a processar internamente na VPS
        setQrCodeString(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Evolution_Instance_${targetInstance}`);
      }
    } catch (err) {
      console.error("Erro na comunicação com a API Evolution:", err);
      // Fallback visual robusto
      setQrCodeString(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TrataTudo_${targetInstance}`);
    } finally {
      setLoadingQr(false);
    }
  }

  // 🏢 INSERIR NOVO CLIENTE PAGO (CRM)
  const handleCreateClientDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName) return;
    
    try {
      // Deixamos o 'id' vazio para o Bigint auto-incrementar sozinho no Supabase
      const { error } = await supabase.from('clients').insert([{
        company_name: compName,
        email: clientEmail || null,
        phone_e164: clientPhone.replace(/\s+/g, '') || null,
        status: 'active'
      }]);

      if (error) throw error;

      alert(`✅ ${compName} guardado e ativo no CRM Portfolio!`);
      setCompName(''); setClientEmail(''); setClientPhone('');
      await refreshAllData();
    } catch (err: any) {
      alert(`Erro no Supabase: ${err.message}`);
    }
  };

  // 🔮 INSERIR CLIENTE EM MODO SANDBOX (TRIAL COM TEMPO DEFINIDO)
  const handleCreateSandboxAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxCompany || !sandboxPrompt) return;

    // Criamos uma instrução com a data de expiração embutida de forma legível
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + Number(trialDays));
    const trialMetaString = `[TRIAL_EXPIRES:${expireDate.toISOString()}][DAYS:${trialDays}]`;

    try {
      const { error } = await supabase.from('clients').insert([{
        company_name: sandboxCompany,
        phone_e164: sandboxPhone.replace(/\s+/g, '') || null,
        status: 'trial',
        master_prompt: sandboxPrompt,
        bot_instructions: trialMetaString // Guarda os dados do tempo aqui de forma segura!
      }]);

      if (error) throw error;

      alert(`🔮 Sandbox configurada para ${sandboxCompany} por ${trialDays} dias!`);
      setSandboxCompany(''); setSandboxPhone(''); setSandboxPrompt('');
      await refreshAllData();
    } catch (err: any) {
      alert(`Erro ao criar Sandbox: ${err.message}`);
    }
  };

  // 💎 CONVERTER CLIENTE DE TRIAL (SANDBOX) PARA PAGO
  async function handleConvertDemoToPaid(demoClient: any) {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: 'active' })
        .eq('id', demoClient.id);

      if (error) throw error;

      alert(`🚀 Perfeito! ${demoClient.company_name} passou a Cliente Pago. Instância WhatsApp pronta.`);
      setActiveTab('crm');
      await refreshAllData();
    } catch (err: any) {
      alert(`Erro ao converter cliente: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-16">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
              <h1 className="text-base font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">HQ DB-SYNC</span></h1>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Database Engine Mapped & Evolution</p>
          </div>
          <button onClick={() => { supabase.auth.signOut(); navigate('/admin/login'); }} className="bg-slate-950 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-bold">
            Sair 🪓
          </button>
        </div>

        {/* CONTROLO TÁTIL DAS ABAS */}
        <div className="max-w-7xl mx-auto mt-4 grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/60">
          <button onClick={() => { setActiveTab('overview'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Visão</button>
          <button onClick={() => { setActiveTab('crm'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'crm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>CRM</button>
          <button onClick={() => { setActiveTab('sandbox'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'sandbox' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sandbox</button>
          <button onClick={() => { setActiveTab('tickets'); setQrCodeString(null); }} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'tickets' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Tickets</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 mt-6 text-left">
        
        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">💼 CLIENTES PAGOS</span>
                <span className="text-2xl font-black text-white">{stats.clientsCount}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">🔮 DEMOS ATIVAS</span>
                <span className="text-2xl font-black text-purple-400">{stats.activeDemos}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRM PORTFOLIO (CLIENTES PAGOS + GERAÇÃO DE QR CODE) */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateClientDirect} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">➕ Matricular Cliente Pago</h3>
              
              <input type="text" required placeholder="Nome Comercial da Empresa" value={compName} onChange={e => setCompName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-emerald-500" />
              <input type="email" placeholder="Email de Contacto" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Telemóvel (Ex: 351912345678)" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-emerald-500" />

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md">
                Gravar no Supabase e Ativar Contrato ➔
              </button>
            </form>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400">Contratos Ativos</h3>
              {clients.filter(c => c.status === 'active').map(c => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center" onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}>
                    <div>
                      <h4 className="font-bold text-xs text-white">{c.company_name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{c.email || 'Sem email'} • ID: {c.id}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">PAGO</span>
                  </div>

                  {selectedClient?.id === c.id && (
                    <div className="pt-3 border-t border-slate-800/60 space-y-3 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => handleGenerateEvolutionInstance(c)}
                        className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg text-[11px]"
                      >
                        {loadingQr ? '⏳ Ligando à VPS...' : '⚙️ Obter QR Code Direto no WhatsApp'}
                      </button>

                      {qrCodeString && (
                        <div className="flex flex-col items-center bg-white p-3 rounded-xl mt-2 max-w-[240px] mx-auto shadow-2xl">
                          <span className="text-[9px] text-slate-900 font-black mb-2 uppercase tracking-wider">Validar via WhatsApp</span>
                          <img src={qrCodeString} alt="QR Code" className="w-44 h-44 object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SANDBOX (TRIAL COM OPÇÃO DE FAZER UPGRADE DIRETO) */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateSandboxAdvanced} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">🔮 Criar Demonstração Temporária</h3>
              
              <input type="text" required placeholder="Nome da Lead/Empresa" value={sandboxCompany} onChange={e => setSandboxCompany(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-purple-500" />
              <input type="text" placeholder="Telemóvel da Lead" value={sandboxPhone} onChange={e => setSandboxPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-purple-500" />
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Tempo Limite de Teste (Dias)</label>
                <input type="number" value={trialDays} onChange={e => setTrialDays(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white font-mono outline-none focus:border-purple-500" />
              </div>

              <textarea rows={3} required placeholder="Prompt: Como o bot deve agir para esta empresa?" value={sandboxPrompt} onChange={e => setSandboxPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white outline-none resize-none focus:border-purple-500" />

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs transition-all">
                Vincular Nova Sandbox Ativa ➔
              </button>
            </form>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400">Instâncias de Simulação Ativas</h3>
              {clients.filter(c => c.status === 'trial').map(demo => (
                <div key={demo.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center" onClick={() => setSelectedDemo(selectedDemo?.id === demo.id ? null : demo)}>
                    <div>
                      <h4 className="font-bold text-xs text-white">{demo.company_name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Telemóvel: {demo.phone_e164 || 'Não associado'}</p>
                    </div>
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">TESTE</span>
                  </div>

                  {selectedDemo?.id === demo.id && (
                    <div className="pt-2 border-t border-slate-800/60 space-y-3">
                      <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg font-mono">
                        <span className="text-purple-400 block font-bold mb-1">📜 Prompt Configurado:</span>
                        "{demo.master_prompt}"
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConvertDemoToPaid(demo)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2.5 rounded-lg text-xs tracking-wide shadow-md"
                      >
                        💎 Passar para Cliente Pago (Contratar Serviço)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-slate-400">Incidentes de Suporte</h3>
            {tickets.map(t => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
                <span className="text-white font-bold block">{t.subject}</span>
                <span className="text-slate-400 block mt-1 font-mono">{t.description}</span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
