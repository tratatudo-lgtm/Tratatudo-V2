import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface SandboxDemo {
  id: string;
  company_name: string;
  lead_phone: string;
  system_prompt: string;
  is_active: boolean;
  created_at: string;
}

export function AdminSandbox() {
  const navigate = useNavigate();
  const [demos, setDemos] = useState<SandboxDemo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado do Formulário
  const [companyName, setCompanyName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      loadSandboxDemos();
    }
    checkAuthAndLoad();
  }, [navigate]);

  async function loadSandboxDemos() {
    setLoading(true);
    try {
      // Puxa as configurações de simulação ativas usando o teu cliente do Supabase
      const { data, error } = await supabase
        .from('wa_chats')
        .select('id, metadata')
        .like('id', 'demo_%'); // Filtro identificador para o ambiente Sandbox

      if (error) throw error;
      
      if (data) {
        const formattedDemos = data.map((item: any) => ({
          id: item.id,
          company_name: item.metadata?.company_name || 'Empresa de Teste',
          lead_phone: item.metadata?.lead_phone || '',
          system_prompt: item.metadata?.system_prompt || '',
          is_active: item.metadata?.is_active ?? true,
          created_at: item.metadata?.created_at || new Date().toISOString()
        }));
        setDemos(formattedDemos);
      }
    } catch (err) {
      console.error('Erro ao carregar instâncias de teste:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !systemPrompt) return;
    setSaving(true);

    const demoId = `demo_${Date.now()}`;
    const payload = {
      company_name: companyName,
      lead_phone: leadPhone.replace(/\s+/g, ''),
      system_prompt: systemPrompt,
      is_active: true,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('wa_chats')
        .insert([{ id: demoId, metadata: payload }]);

      if (error) throw error;

      alert(`✅ Sandbox ativada para ${companyName}!\nInstrui o cliente a enviar mensagem para o teu número master.`);
      
      setCompanyName('');
      setLeadPhone('');
      setSystemPrompt('');
      loadSandboxDemos();
    } catch (err) {
      alert('Erro ao registar prompt de simulação.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleDemoStatus(id: string, currentStatus: boolean) {
    try {
      // Localiza o registo de teste e altera o estado binário de ativação do webhook da IA
      const target = demos.find(d => d.id === id);
      if (!target) return;

      const updatedMetadata = {
        ...target,
        is_active: !currentStatus
      };

      const { error } = await supabase
        .from('wa_chats')
        .update({ metadata: updatedMetadata })
        .eq('id', id);

      if (error) throw error;
      setDemos(demos.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
    } catch (err) {
      alert('Erro ao alterar estado da simulação.');
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono text-xs tracking-widest animate-pulse">
      INICIALIZANDO MOTOR SANDBOX V2...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-6 flex flex-col">
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">TrataTudo <span className="text-indigo-400">AI Sandbox</span></h1>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">Simulador de Atendimento Automático e Geração de Leads</p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Formulário de Configuração do Prompt */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-left">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🔮</span> Configurar Nova Demonstração
          </h2>
          
          <form onSubmit={handleCreateDemo} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Nome da Empresa</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: P.M. Construções"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Contacto da Lead (Opcional)</label>
              <input
                type="text"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="Ex: 351912345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Prompt do Agente Virtual</label>
              <textarea
                rows={5}
                required
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Age como um assistente comercial da empresa X. Vende os nossos serviços de Light Steel Frame (LSF) e tenta agendar uma reunião de orçamento..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg"
            >
              {saving ? 'Gravando Parâmetros...' : 'Ativar Simulação Virtual ➔'}
            </button>
          </form>
        </div>

        {/* Listagem de Ambientes Ativos */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">⚡ Demonstrações Prontas no Teu Número ({demos.length})</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {demos.map(demo => (
              <div key={demo.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />
                
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-sm text-white truncate max-w-[150px]">{demo.company_name}</h3>
                    <button
                      onClick={() => toggleDemoStatus(demo.id, demo.is_active)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition-all ${
                        demo.is_active ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {demo.is_active ? '● LIVE' : '○ INATIVO'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-3 font-sans italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/40">
                    "{demo.system_prompt}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Tel: {demo.lead_phone || 'Qualquer número'}</span>
                  <span>{new Date(demo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {demos.length === 0 && (
              <div className="col-span-2 bg-slate-900/40 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-600 font-mono text-xs">
                Nenhum ambiente de simulação ativo no momento.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
