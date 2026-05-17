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
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'sandbox' | 'logs' | 'tickets'>('overview');

  // Estados de Dados do Banco
  const [clients, setClients] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [waChats, setWaChats] = useState<any[]>([]);
  const [stats, setStats] = useState({ clientsCount: 0, openTickets: 0, activeDemos: 0, pausedBots: 0 });

  // Estados de Operação / Seleção
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [instanceStatus, setInstanceStatus] = useState<string | null>(null);
  const [qrCodeString, setQrCodeString] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // FORMULÁRIOS
  const [compName, setCompName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
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
      // 1. Puxar Clientes
      const { data: clientData } = await supabase.from('clients').select('*');
      const allClients = clientData || [];
      setClients(allClients);

      // 2. Puxar Tickets
      const { data: ticketData } = await supabase.from('tickets').select('*');
      setTickets(ticketData || []);

      // 3. Puxar Instâncias Ativas / Conversas do WhatsApp (Tabela wa_chats)
      const { data: chatData } = await supabase.from('wa_chats').select('*').order('updated_at', { ascending: false });
      const allChats = chatData || [];
      setWaChats(allChats);

      const paidClients = allClients.filter((c: any) => c.status === 'active');
      const trialClients = allClients.filter((c: any) => c.status === 'trial');

      setStats({
        clientsCount: paidClients.length,
        openTickets: (ticketData || []).filter((t: any) => t.status === 'open' || t.status === 'pending').length,
        activeDemos: trialClients.length,
        pausedBots: allChats.filter((ch: any) => ch.paused).length
      });
    } catch (err: any) {
      console.error("Erro na sincronização:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // 📡 INSPEÇÃO REAL DE LOGS / ESTADO DA VPS EVOLUTION
  async function checkInstanceHealth(companyName: string) {
    setCheckingStatus(true);
    setInstanceStatus('A verificar...');
    const instanceName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    try {
      const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const data = await res.json();
      
      if (data && data.instance) {
        setInstanceStatus(data.instance.state.toUpperCase()); // CONNECTED, DISCONNECTED, etc.
      } else {
        setInstanceStatus('NÃO ENCONTRADA');
      }
    } catch (err) {
      setInstanceStatus('DESCONECTADA (OFFLINE)');
    } finally {
      setCheckingStatus(false);
    }
  }

  // ⚙️ GERAÇÃO DO WHATSAPP QR CODE
  async function handleGenerateEvolutionInstance(client: any) {
    setLoadingQr(true);
    setQrCodeString(null);
    const targetInstance = client.company_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    try {
      await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
        body: JSON.stringify({ instanceName: targetInstance, token: '', qrcode: true })
      });

      const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${targetInstance}`, {
        method: 'GET',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const connectData = await connectRes.json();

      if (connectData && connectData.base64) {
        setQrCodeString(connectData.base64);
      } else {
        setQrCodeString(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Evolution_Instance_${targetInstance}`);
      }
    } catch (err) {
      setQrCodeString(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TrataTudo_${targetInstance}`);
    } finally {
      setLoadingQr(false);
    }
  }

  // 🪵 ALTERAR ESTADO DO BOT (PAUSA / PLAY) DIRETAMENTE NO SUPABASE
  async function toggleBotPause(chatId: number, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('wa_chats')
        .update({ paused: !currentStatus })
        .eq('id', chatId);

      if (error) throw error;
      alert(`Estado do bot alterado para: ${!currentStatus ? '⏸️ Pausado' : '▶️ Ativo'}`);
      await refreshAllData();
    } catch (err: any) {
      alert(`Erro ao alterar estado do bot: ${err.message}`);
    }
  }

  // OPERAÇÕES DO BANCO DE DADOS (CRM & SANDBOX)
  const handleCreateClientDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName) return;
    try {
      const { error } = await supabase.from('clients').insert([{
        company_name: compName,
        email: clientEmail || null,
        phone_e164: clientPhone.replace(/\s+/g, '') || null,
        status: 'active'
      }]);
      if (error) throw error;
      alert(`✅ ${compName} registado!`);
      setCompName(''); setClientEmail(''); setClientPhone('');
      await refreshAllData();
    } catch (err: any) { alert(err.message); }
  };

  const handleCreateSandboxAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxCompany || !sandboxPrompt) return;
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + Number(trialDays));
    try {
      const { error } = await supabase.from('clients').insert([{
        company_name: sandboxCompany,
        phone_e164: sandboxPhone.replace(/\s+/g, '') || null,
        status: 'trial',
        master_prompt: sandboxPrompt,
        bot_instructions: `[EXPIRAÇÃO:${expireDate.toLocaleDateString()}]`
      }]);
      if (error) throw error;
      alert(`🔮 Sandbox ativa para ${sandboxCompany}!`);
      setSandboxCompany(''); setSandboxPhone(''); setSandboxPrompt('');
      await refreshAllData();
    } catch (err: any) { alert(err.message); }
  };

  async function handleConvertDemoToPaid(demoClient: any) {
    try {
      const { error } = await supabase.from('clients').update({ status: 'active' }).eq('id', demoClient.id);
      if (error) throw error;
      alert(`🚀 ${demoClient.company_name} promovido para Plano Comercial Pago!`);
      setActiveTab('crm');
      await refreshAllData();
    } catch (err: any) { alert(err.message); }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-16">
      
      {/* HEADER TÁTICO EXPANDIDO */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-4 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
              <h1 className="text-base font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">HQ COCKPIT</span></h1>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Infraestrutura Global & Logs de Conversação</p>
          </div>
          <button onClick={() => refreshAllData()} className="bg-slate-950 border border-slate-800 text-indigo-400 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
            🔄 Sincronizar
          </button>
        </div>

        {/* CONTROLO DE ABAS INTEGRADAS */}
        <div className="max-w-7xl mx-auto mt-4 grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/60">
          <button onClick={() => setActiveTab('overview')} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Visão</button>
          <button onClick={() => setActiveTab('crm')} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'crm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>CRM</button>
          <button onClick={() => setActiveTab('sandbox')} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'sandbox' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Sandbox</button>
          <button onClick={() => setActiveTab('logs')} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'logs' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>Logs Bot</button>
          <button onClick={() => setActiveTab('tickets')} className={`py-2 text-[10px] font-bold uppercase rounded-lg ${activeTab === 'tickets' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Tickets</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 mt-6 text-left">
        
        {/* TAB 1: VISÃO GERAL (MÉTRICAS DA INFRAESTRUTURA) */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">💼 CLIENTES COMERCIAIS</span>
                <span className="text-2xl font-black text-white">{stats.clientsCount}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">🔮 INSTÂNCIAS TRIAL</span>
                <span className="text-2xl font-black text-purple-400">{stats.activeDemos}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">💬 CONVERSAS MONOTORIZADAS</span>
                <span className="text-2xl font-black text-amber-400">{waChats.length}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">⏸️ BOTS INTERROMPIDOS</span>
                <span className="text-2xl font-black text-rose-500">{stats.pausedBots}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRM PORTFOLIO (SITUAÇÃO DO WHATSAPP VPS) */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateClientDirect} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">➕ Inserir Cliente Pago</h3>
              <input type="text" required placeholder="Nome Comercial da Empresa" value={compName} onChange={e => setCompName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500" />
              <input type="email" placeholder="Email de Contacto" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Telemóvel (Ex: 351912345678)" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500" />
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs">Gravar Contrato ➔</button>
            </form>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400">Gestão de Ligações & VPS</h3>
              {clients.filter(c => c.status === 'active').map(c => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center" onClick={() => { setSelectedClient(selectedClient?.id === c.id ? null : c); setInstanceStatus(null); }}>
                    <div>
                      <h4 className="font-bold text-xs text-white">{c.company_name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">NIF/ID: {c.id} • {c.email || 'Sem email'}</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">ACTIVO</span>
                  </div>

                  {selectedClient?.id === c.id && (
                    <div className="pt-3 border-t border-slate-800/60 space-y-3 font-mono text-xs">
                      <div className="flex gap-2">
                        <button onClick={() => checkInstanceHealth(c.company_name)} className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 py-2 rounded-lg text-[10px] font-bold">
                          {checkingStatus ? '🔄 A ler...' : '🔍 Validar Estado VPS'}
                        </button>
                        <button onClick={() => handleGenerateEvolutionInstance(c)} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-[10px] font-bold">
                          {loadingQr ? '⏳ A gerar...' : '⚙️ Forçar QR Code'}
                        </button>
                      </div>

                      {instanceStatus && (
                        <div className="bg-slate-950 p-2 rounded-lg flex justify-between items-center text-[11px]">
                          <span>Canal de Ligação:</span>
                          <span className={`font-black ${instanceStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400'}`}>{instanceStatus}</span>
                        </div>
                      )}

                      {qrCodeString && (
                        <div className="bg-white p-3 rounded-xl flex flex-col items-center max-w-[200px] mx-auto">
                          <img src={qrCodeString} alt="WhatsApp QR" className="w-40 h-40" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            {/* O formulário de criação de Sandbox mantém-se idêntico ao anterior para estabilidade */}
            <form onSubmit={handleCreateSandboxAdvanced} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">🔮 Abrir Período de Demonstração</h3>
              <input type="text" required placeholder="Nome da Empresa em Teste" value={sandboxCompany} onChange={e => setSandboxCompany(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              <input type="text" placeholder="Telemóvel do Prospect" value={sandboxPhone} onChange={e => setSandboxPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none" />
              <textarea rows={3} required placeholder="Prompt de Contexto de IA..." value={sandboxPrompt} onChange={e => setSandboxPrompt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none" />
              <button type="submit" className="w-full bg-purple-600 font-bold py-2.5 rounded-xl text-xs">Vincular Nova Sandbox Ativa</button>
            </form>

            <div className="space-y-2">
              {clients.filter(c => c.status === 'trial').map(demo => (
                <div key={demo.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center" onClick={() => setSelectedDemo(selectedDemo?.id === demo.id ? null : demo)}>
                    <div>
                      <h4 className="font-bold text-xs text-white">{demo.company_name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Telemóvel Master: {demo.phone_e164 || '---'}</p>
                    </div>
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-bold">PILOTO</span>
                  </div>
                  {selectedDemo?.id === demo.id && (
                    <div className="pt-2 border-t border-slate-800/60 space-y-2 font-mono text-xs">
                      <div className="bg-slate-950 p-2 rounded-lg text-slate-400 text-[11px]">
                        <span className="text-purple-400 font-bold block mb-1">🤖 Prompt Definido:</span>
                        "{demo.master_prompt}"
                      </div>
                      <button onClick={() => handleConvertDemoToPaid(demo)} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2 rounded-lg text-xs">
                        💎 Upgrade Comercial (Fechar Negócio)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🪵 TAB 4: NOVA ABAS DE LOGS DO BOT (INSPEÇÃO HISTÓRICA E LIVE CHAT STATE) */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono uppercase text-slate-400">Monitor de Tráfego de Mensagens</h3>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded font-mono">Sincronizado via Supabase</span>
            </div>

            {waChats.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-xs text-slate-500 font-mono">
                Sem logs de conversas nas últimas horas.
              </div>
            ) : (
              waChats.map((chat: any) => (
                <div key={chat.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start" onClick={() => setSelectedChat(selectedChat?.id === chat.id ? null : chat)}>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${chat.paused ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`}></span>
                        <h4 className="font-bold text-xs text-white font-mono">{chat.phone_e164}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Intenção: <span className="text-amber-400 font-bold">{chat.current_intent || 'Indefinida'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] block bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        Etapa: {chat.current_step || '0'}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes de Debug do Bot */}
                  {selectedChat?.id === chat.id && (
                    <div className="pt-2.5 border-t border-slate-800/60 font-mono text-xs space-y-3">
                      <div className="bg-slate-950 p-2.5 rounded-xl space-y-1.5">
                        <span className="text-[10px] text-indigo-400 font-black block uppercase tracking-wider">🧠 Sumário da Conversa (IA):</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed italic">
                          {chat.ai_summary ? `"${chat.ai_summary}"` : 'Sem sumário gerado até ao momento.'}
                        </p>
                      </div>

                      {chat.context_data && (
                        <div className="bg-slate-950 p-2 rounded-lg text-[10px]">
                          <span className="text-slate-500 block mb-1">Payload de Contexto (JSONB):</span>
                          <pre className="text-slate-400 overflow-x-auto text-[9px]">
                            {JSON.stringify(chat.context_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      <button
                        onClick={() => toggleBotPause(chat.id, chat.paused)}
                        className={`w-full py-2 rounded-lg font-bold text-[11px] transition-all ${
                          chat.paused 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                            : 'bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {chat.paused ? '▶️ Intervir & Ativar Respostas do Bot' : '⏸️ Pausar IA (Assumir Manualmente)'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase text-slate-400">Incidentes de Suporte</h3>
            {tickets.map(t => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>{t.subject}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${t.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>{t.priority}</span>
                </div>
                <p className="text-slate-400 font-mono">{t.description}</p>
                {t.customer_name && <p className="text-[10px] text-slate-500 mt-2 font-mono">Contacto: {t.customer_name} ({t.customer_contact})</p>}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
