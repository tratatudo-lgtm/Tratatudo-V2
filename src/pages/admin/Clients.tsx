import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Inicializa o cliente do Supabase no Frontend usando as tuas variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🛑 Configuração central da tua infraestrutura Evolution API na porta 8080
const EVOLUTION_API_URL = 'http://16.170.55.203:8080'; 

interface WaChat {
  id: string;
  phone_e164: string;
  current_intent: string;
  paused: boolean;
  context_data: any;
  updated_at: string;
}

interface ClientInstance {
  id: string;
  company_name: string;
  evolution_instance_name: string;
  evolution_status: string;
  apikey: string;
  master_prompt: string;
}

export default function UltimateSaaSDashboard() {
  const [activeTab, setActiveTab] = useState<'chats' | 'instances'>('chats');
  const [chats, setChats] = useState<WaChat[]>([]);
  const [instances, setInstances] = useState<ClientInstance[]>([]);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Modais e Edição
  const [selectedInstance, setSelectedInstance] = useState<ClientInstance | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState('');

  useEffect(() => {
    loadInitialData();

    // ⚡ CANAL REALTIME CENTRALIZADO (Escuta alterações nas tabelas do Supabase)
    const channel = supabase
      .channel('saas_realtime_hub')
      .on('postgres_changes', { event: '*', pattern: 'public', table: 'wa_chats' }, (p) => {
        setChats(prev => {
          const exists = prev.some(c => c.id === p.new.id);
          if (exists) {
            return prev.map(c => c.id === p.new.id ? { ...c, ...p.new } : c);
          }
          return [p.new as WaChat, ...prev];
        });
        setAiLogs(l => [`[${new Date().toLocaleTimeString()}] IA atualizou metadados do chat: ${p.new.phone_e164}`, ...l.slice(0, 15)]);
      })
      .on('postgres_changes', { event: 'INSERT', pattern: 'public', table: 'wa_messages' }, (p) => {
        setAiLogs(l => [`[${new Date().toLocaleTimeString()}] Nova mensagem (${p.new.direction}): ${p.new.message_text?.substring(0, 30)}...`, ...l.slice(0, 15)]);
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, []);

  async function loadInitialData() {
    try {
      const { data: chatData } = await supabase.from('wa_chats').select('*').order('updated_at', { ascending: false });
      const { data: clientData } = await supabase.from('clients').select('*');
      if (chatData) setChats(chatData);
      if (clientData) setInstances(clientData);
    } catch (err) {
      console.error("Erro ao carregar dados iniciais:", err);
    } finally {
      setLoading(false);
    }
  }

  // Alternar Estado do Bot (Human Takeover)
  const toggleBot = async (chatId: string, currentPausedStatus: boolean) => {
    const { error } = await supabase.from('wa_chats').update({ paused: !currentPausedStatus }).eq('id', chatId);
    if (!error) {
      setChats(chats.map(c => c.id === chatId ? { ...c, paused: !currentPausedStatus } : c));
    }
  };

  // 🔌 INTERAÇÃO COM A EVOLUTION API: Puxar o QR Code verdadeiro em base64
  const fetchQRCode = async (instanceName: string, token: string) => {
    if (!instanceName) {
      setQrCode('ERROR');
      return;
    }
    setLoadingQr(true);
    setQrCode(null);
    try {
      const response = await axios.get(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        headers: { 'apikey': token || 'global_master_token' }
      });
      if (response.data?.base64) {
        setQrCode(response.data.base64); 
      } else if (response.data?.status === 'open' || response.data?.instance?.state === 'open') {
        setQrCode('CONNECTED');
      } else {
        setQrCode('CONNECTED');
      }
    } catch (err) {
      console.error("Erro ao ligar à Evolution API:", err);
      setQrCode('ERROR');
    }
    setLoadingQr(false);
  };

  // 🧠 ATUALIZAR MASTER PROMPT NO SUPABASE
  const saveMasterPrompt = async (clientId: string) => {
    const { error } = await supabase.from('clients').update({ master_prompt: editingPrompt }).eq('id', clientId);
    if (!error) {
      alert('Prompt do robô atualizado com sucesso! O teu backend VPS vai ler as novas regras na próxima mensagem.');
      setInstances(instances.map(i => i.id === clientId ? { ...i, master_prompt: editingPrompt } : i));
      setSelectedInstance(null);
    } else {
      alert('Erro ao guardar prompt: ' + error.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-sm tracking-widest">A INICIALIZAR ARQUITETURA TRATATUDO V2...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Premium Glow Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
              <h1 className="text-xl font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">V2 Engine</span></h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">Controlo de Infraestrutura SaaS & Inteligência Concorrente</p>
          </div>
          
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60 w-full md:w-auto">
            <button onClick={() => setActiveTab('chats')} className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'}`}>
              🔮 Monitor de Leads & IA
            </button>
            <button onClick={() => setActiveTab('instances')} className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'instances' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'}`}>
              🔌 Gestão de Clientes & Evolution
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* TAB 1: OPERAÇÕES DE LEAD & TERMINAL DE IA */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Listagem de Chats */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span>⚡ Fluxo Ativo de Conversas (Realtime)</span>
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {chats.map(chat => (
                  <div key={chat.id} className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-xl group">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors">{chat.context_data?.nome || 'Prospeção Anónima'}</h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{chat.phone_e164}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border ${
                        chat.current_intent === 'white_label' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        chat.current_intent === 'vendas_crm_ia' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {chat.current_intent || 'Geral'}
                      </span>
                    </div>

                    <div className="mt-4 bg-slate-950/80 border border-slate-900 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div><span className="text-slate-500">🏢 Empresa:</span> <span className="text-slate-300">{chat.context_data?.empresa || '---'}</span></div>
                      <div><span className="text-slate-500">✉️ Email:</span> <span className="text-slate-300 truncate block">{chat.context_data?.email || '---'}</span></div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => toggleBot(chat.id, chat.paused)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                          chat.paused 
                            ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-600 shadow-lg shadow-amber-500/10' 
                            : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                        }`}
                      >
                        {chat.paused ? '⏸️ IA Interrompida (Assumiste o Controlo)' : '🤖 Robô em Automático'}
                      </button>
                    </div>
                  </div>
                ))}
                {chats.length === 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 italic text-sm">
                    A aguardar primeiras mensagens no WhatsApp...
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Hacker de Eventos IA */}
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400">🤖 Consola de Eventos do Sistema</h2>
              <div className="bg-black border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-cyan-400 h-[450px] overflow-y-auto space-y-2 shadow-inner shadow-cyan-500/5">
                <div className="text-slate-500 text-center border-b border-slate-900 pb-2 mb-2">--- ESCUTA ATIVA DE WEBHOOKS (REALTIME) ---</div>
                {aiLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed whitespace-pre-wrap text-slate-300">
                    <span className="text-indigo-400">➔</span> {log}
                  </div>
                ))}
                {aiLogs.length === 0 && <div className="text-slate-600 italic text-center pt-8">Sem atividade na consola de momento.</div>}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: GESTÃO DE CLIENTES & EVOLUTION */}
        {activeTab === 'instances' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="max-w-xl">
                <h2 className="text-lg font-bold text-white">Ecossistema Multitenant TrataTudo</h2>
                <p className="text-xs text-slate-400 mt-1">Configura os limites, os prompts base e conecta as contas dos teus clientes finais à tua Evolution API.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {instances.map(inst => (
                  <div key={inst.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-500">ID CLUSTER: #{inst.id}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-slate-400">API</span>
                          <span className={`h-2 w-2 rounded-full ${inst.evolution_status === 'connected' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`}></span>
                        </div>
                      </div>
                      <h3 className="font-extrabold text-white text-base tracking-tight">{inst.company_name}</h3>
                      <p className="text-xs font-mono text-slate-400 mt-2">Instância: <code className="text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded">{inst.evolution_instance_name || 'Inativa'}</code></p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-900">
                      <button 
                        onClick={() => {
                          setSelectedInstance(inst);
                          setEditingPrompt(inst.master_prompt || '');
                          fetchQRCode(inst.evolution_instance_name, inst.apikey);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
                      >
                        ⚙️ Configurar Inteligência e Conexão
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal de Configuração da Instância */}
            {selectedInstance && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6">
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-white">Painel Técnico: {selectedInstance.company_name}</h3>
                      <p className="text-xs text-slate-400">Modifica as diretrizes de IA e emparelha dispositivos.</p>
                    </div>
                    <button onClick={() => setSelectedInstance(null)} className="text-slate-400 hover:text-white font-mono text-sm bg-slate-800 px-2.5 py-1 rounded-xl">Fechar ×</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Edição do Master Prompt */}
                    <div className="space-y-3">
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">🧠 Comportamento e Prompt do Robô</label>
                      <textarea
                        value={editingPrompt}
                        onChange={(e) => setEditingPrompt(e.target.value)}
                        placeholder="Ex: És o assistente comercial da TrataTudo..."
                        className="w-full h-64 bg-slate-950 border border-slate-800 text-slate-200 text-xs p-4 rounded-2xl outline-none focus:border-indigo-500 transition-all font-mono leading-relaxed resize-none"
                      />
                      <button
                        onClick={() => saveMasterPrompt(selectedInstance.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/10"
                      >
                        💾 Guardar Instruções de IA
                      </button>
                    </div>

                    {/* QR Code */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">🔌 Ligação Física ao WhatsApp</label>
                        <p className="text-[11px] text-slate-500 mt-1">Conecta o dispositivo comercial do cliente ao cluster.</p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[220px]">
                        {loadingQr && (
                          <div className="space-y-2 text-center text-xs font-mono text-indigo-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400 mx-auto"></div>
                            <p>A contactar o cluster Evolution...</p>
                          </div>
                        )}

                        {!loadingQr && qrCode && qrCode !== 'CONNECTED' && qrCode !== 'ERROR' && (
                          <>
                            <img src={qrCode} alt="WhatsApp QR Code" className="h-40 w-40 bg-white p-2 rounded-xl shadow-lg shadow-white/5" />
                            <p className="text-[10px] text-slate-400 mt-3 font-mono">Faz o scan com o WhatsApp do smartphone.</p>
                          </>
                        )}

                        {!loadingQr && qrCode === 'CONNECTED' && (
                          <div className="text-center text-xs font-mono text-emerald-400 space-y-2">
                            <div className="text-3xl">✅</div>
                            <p className="font-bold">CONECTADO EM PRODUÇÃO</p>
                            <p className="text-[10px] text-slate-500">Instância pronta e comunicante.</p>
                          </div>
                        )}

                        {!loadingQr && (!qrCode || qrCode === 'ERROR') && (
                          <p className="text-xs text-rose-400 font-mono italic">Instância inativa ou sem QR Code de momento.</p>
                        )}
                      </div>

                      <button
                        onClick={() => fetchQRCode(selectedInstance.evolution_instance_name, selectedInstance.apikey)}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all border border-slate-700/60"
                      >
                        🔄 Atualizar Estado / QR Code
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
