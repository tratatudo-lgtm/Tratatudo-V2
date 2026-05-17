import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const EVOLUTION_API_URL = 'http://16.170.55.203:8080'; 
const BACKEND_VPS_URL = 'http://16.170.55.203:3000';

interface WaChat {
  id: string;
  phone_e164: string;
  current_intent: string;
  paused: boolean;
  context_data: any;
  updated_at: string;
}

interface WaMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  message_text: string;
  created_at: string;
}

interface ClientInstance {
  id: string;
  company_name: string;
  evolution_instance_name: string;
  evolution_status: string;
  apikey: string;
  master_prompt: string;
}

export function AdminClients() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chats' | 'instances'>('chats');
  const [chats, setChats] = useState<WaChat[]>([]);
  const [instances, setInstances] = useState<ClientInstance[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Conversa Ativa (Live Chat)
  const [activeChat, setActiveChat] = useState<WaChat | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Estados de Modais
  const [selectedInstance, setSelectedInstance] = useState<ClientInstance | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState('');

  // 🛡️ GATEKEEPER CORRIGIDO (Escuta ativa de sessão do Supabase)
  useEffect(() => {
    // Escuta mudanças de autenticação e valida o estado atual
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setLoading(false);
        navigate('/admin/login');
      } else if (session) {
        loadInitialData();
      }
    });

    // Verificação proativa inicial secundária
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Dá uma tolerância minúscula para o onAuthStateChange processar
        const timeout = setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: retrySession } }) => {
            if (!retrySession) {
              setLoading(false);
              navigate('/admin/login');
            }
          });
        }, 400);
        return () => clearTimeout(timeout);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const channel = supabase
      .channel('saas_realtime_hub')
      .on('postgres_changes', { event: '*', pattern: 'public', table: 'wa_chats' }, (p) => {
        setChats(prev => {
          const filtered = prev.filter(c => c.id !== p.new.id);
          return [p.new as WaChat, ...filtered];
        });
        if (activeChat && p.new.id === activeChat.id) {
          setActiveChat(p.new as WaChat);
        }
      })
      .on('postgres_changes', { event: 'INSERT', pattern: 'public', table: 'wa_messages' }, (p) => {
        const newMsg = p.new as WaMessage;
        if (activeChat && p.new.phone_e164 === activeChat.phone_e164) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      async function loadMessages() {
        const { data } = await supabase
          .from('wa_messages')
          .select('*')
          .eq('phone_e164', activeChat.phone_e164)
          .order('created_at', { ascending: true });
        if (data) setMessages(data);
      }
      loadMessages();
    }
  }, [activeChat]);

  async function loadInitialData() {
    try {
      const { data: chatData } = await supabase.from('wa_chats').select('*').order('updated_at', { ascending: false });
      const { data: clientData } = await supabase.from('clients').select('*');
      if (chatData) setChats(chatData);
      if (clientData) setInstances(clientData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const toggleBot = async (chatId: string, currentPausedStatus: boolean) => {
    const { error } = await supabase.from('wa_chats').update({ paused: !currentPausedStatus }).eq('id', chatId);
    if (!error) {
      setChats(chats.map(c => c.id === chatId ? { ...c, paused: !currentPausedStatus } : c));
      if (activeChat && activeChat.id === chatId) {
        setActiveChat({ ...activeChat, paused: !currentPausedStatus });
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat || sendingMsg) return;
    setSendingMsg(true);
    try {
      const response = await fetch(`${BACKEND_VPS_URL}/api/send-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_e164: activeChat.phone_e164,
          message_text: typedMessage,
          client_id: 1
        })
      });

      if (response.ok) {
        setTypedMessage('');
      } else {
        alert('Erro na VPS.');
      }
    } catch (err) {
      alert('Erro de rede ou VPS.');
    } finally {
      setSendingMsg(false);
    }
  };

  const fetchQRCode = async (instanceName: string, token: string) => {
    if (!instanceName) return setQrCode('ERROR');
    setLoadingQr(true);
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': token || 'global_master_token' }
      });
      const data = await response.json();
      setQrCode(data?.base64 || 'CONNECTED');
    } catch (err) {
      setQrCode('ERROR');
    }
    setLoadingQr(false);
  };

  const saveMasterPrompt = async (clientId: string) => {
    const { error } = await supabase.from('clients').update({ master_prompt: editingPrompt }).eq('id', clientId);
    if (!error) {
      alert('Prompt guardado!');
      setInstances(instances.map(i => i.id === clientId ? { ...i, master_prompt: editingPrompt } : i));
      setSelectedInstance(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono text-xs tracking-widest animate-pulse">
      SINCRO DE SEGURANÇA TRATATUDO V2...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-6 flex flex-col">
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
              <h1 className="text-xl font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">V2 Engine</span></h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">Cockpit Protegido • Live Chat & Multi-Tenant</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60 flex-1 md:flex-none">
              <button onClick={() => setActiveTab('chats')} className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'chats' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                🔮 Monitor & Live Chat
              </button>
              <button onClick={() => setActiveTab('instances')} className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'instances' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                🔌 Gestão & Evolution
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 border border-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            >
              Sair 🪓
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 mt-6 overflow-hidden flex flex-col">
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch min-h-[550px]">
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">⚡ Leads Recebidos</h2>
              <div className="space-y-2">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      activeChat?.id === chat.id ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="truncate max-w-[70%]">
                        <h3 className="font-bold text-sm text-white truncate">{chat.context_data?.nome || 'Prospeção Manual'}</h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{chat.phone_e164}</p>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${chat.paused ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {chat.paused ? 'MANUAL' : 'BOT'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
              {activeChat ? (
                <>
                  <div className="p-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h3 className="font-bold text-white text-sm">{activeChat.context_data?.nome || 'Cliente WhatsApp'}</h3>
                      <p className="text-xs text-slate-400 font-mono">{activeChat.phone_e164} • Intenção: <span className="text-indigo-400 font-bold uppercase text-[10px]">{activeChat.current_intent || 'Geral'}</span></p>
                    </div>
                    <button
                      onClick={() => toggleBot(activeChat.id, activeChat.paused)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeChat.paused ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'}`}
                    >
                      {activeChat.paused ? '⏸️ IA Pausada (Assume Tu)' : '🤖 IA Ativa (Pausar)'}
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto bg-slate-950/40 space-y-3 flex flex-col">
                    {messages.map(msg => (
                      <div key={msg.id} className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${msg.direction === 'inbound' ? 'bg-slate-800 text-slate-100 self-start rounded-tl-none' : 'bg-indigo-600 text-white self-end rounded-tr-none'}`}>
                        <p className="whitespace-pre-wrap">{msg.message_text}</p>
                        <span className="block text-[9px] text-slate-400/80 font-mono mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder={activeChat.paused ? "Escreve uma resposta humana..." : "Pausa a IA para poderes responder aqui manualmente."}
                      disabled={!activeChat.paused || sendingMsg}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 disabled:opacity-40 transition-all"
                    />
                    <button type="submit" disabled={!activeChat.paused || !typedMessage.trim() || sendingMsg} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold px-4 rounded-xl text-xs transition-all">{sendingMsg ? '...' : 'Enviar'}</button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-6">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-xs font-mono">Seleciona uma conversa na barra lateral para abrir o Live Chat.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'instances' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map(inst => (
              <div key={inst.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-tight">{inst.company_name}</h3>
                  <p className="text-xs font-mono text-indigo-400 bg-slate-950 px-2 py-1 rounded inline-block mt-2">Instância: {inst.evolution_instance_name || 'Inativa'}</p>
                </div>
                <button onClick={() => { setSelectedInstance(inst); setEditingPrompt(inst.master_prompt || ''); fetchQRCode(inst.evolution_instance_name, inst.apikey); }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all mt-6">⚙️ Configurar IA & Dispositivo</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
