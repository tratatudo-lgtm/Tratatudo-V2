import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Client {
  id: number;
  company_name: string;
  email: string | null;
  phone_e164: string | null;
  status: 'active' | 'trial' | 'inactive';
  master_prompt: string | null;
  bot_instructions: string | null;
  created_at: string;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'contrato' | 'tecnico' | 'consumo'>('contrato');

  // Estados para edição
  const [editPrompt, setEditPrompt] = useState('');
  const [editBotInstructions, setEditBotInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setEditPrompt(selectedClient.master_prompt || '');
      setEditBotInstructions(selectedClient.bot_instructions || '');
    }
  }, [selectedClient]);

  async function fetchClients() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
      if (data && data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err.message);
    } finaly {
      setLoading(false);
    }
  }

  // 💾 ATUALIZA CONFIGURAÇÃO TÉCNICA (PROMPTS) NO SUPABASE
  async function handleSaveTechnicalConfig() {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          master_prompt: editPrompt,
          bot_instructions: editBotInstructions
        })
        .eq('id', selectedClient.id);

      if (error) throw error;
      
      // Atualiza o estado local
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { 
        ...c, 
        master_prompt: editPrompt, 
        bot_instructions: editBotInstructions 
      } : c));
      
      setSelectedClient(prev => prev ? { 
        ...prev, 
        master_prompt: editPrompt, 
        bot_instructions: editBotInstructions 
      } : null);

      alert('✅ Configuração de IA atualizada com sucesso!');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const filteredClients = clients.filter(c => 
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone_e164 && c.phone_e164.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* BARRA DE TOPO DO CRM */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Gestão de Contratos & Portfólio CRM
          </h2>
          <p className="text-[10px] font-mono text-slate-400">Layout Master-Detail Especializado para SaaS</p>
        </div>
        <input 
          type="text"
          placeholder="🔍 Procurar empresa ou telemóvel..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none w-64 font-mono"
        />
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUNA ESQUERDA: LISTA SELECIONÁVEL */}
        <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900/10 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center font-mono text-xs text-slate-500 pt-8">A ler carteira de clientes...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center font-mono text-xs text-slate-500 pt-8">Nenhum cliente localizado.</div>
          ) : (
            filteredClients.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedClient?.id === c.id
                    ? 'bg-slate-900 border-emerald-500/80 shadow-md'
                    : 'bg-slate-900/60 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-200 truncate block w-40">{c.company_name}</span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    c.status === 'trial' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 truncate">{c.phone_e164 || 'Sem número associado'}</p>
              </div>
            ))
          )}
        </div>

        {/* COLUNA DIREITA: FICHA TÉCNICA E AVANÇADA DO CLIENTE */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {selectedClient ? (
            <>
              {/* CABEÇALHO DA INTERFÁCIA DETAIL */}
              <div className="p-4 bg-slate-900/40 border-b border-slate-800 text-left">
                <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-widest block mb-0.5">CLIENT ID: #{selectedClient.id}</span>
                <h3 className="font-black text-base text-white">{selectedClient.company_name}</h3>
                
                {/* SUB-SEPARADORES DE CONFIGURAÇÃO */}
                <div className="flex gap-2 mt-4 border-b border-slate-800/80 pb-px">
                  {(['contrato', 'tecnico', 'consumo'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`pb-2 text-[10px] font-mono font-bold uppercase tracking-wider relative transition-all ${
                        activeSubTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab === 'contrato' && '📋 Contrato & Dados'}
                      {tab === 'tecnico' && '⚙️ Configuração IA'}
                      {tab === 'consumo' && '📈 Volumetria'}
                      {activeSubTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTEÚDO DINÂMICO CONSOANTE O SEPARADOR ATIVO */}
              <div className="flex-1 overflow-y-auto p-5 text-left space-y-4">
                
                {/* SUB-TAB 1: DADOS GERAIS E CONTRATO */}
                {activeSubTab === 'contrato' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase font-mono border-b border-slate-800/60 pb-1.5">Informação de Registo</h4>
                      <div className="space-y-1 font-mono text-xs">
                        <span className="text-slate-500 block">E-mail Corporativo:</span>
                        <span className="text-slate-200 block bg-slate-950 p-2 rounded-lg border border-slate-900">{selectedClient.email || 'Não configurado'}</span>
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                        <span className="text-slate-500 block">Telemóvel e164:</span>
                        <span className="text-slate-200 block bg-slate-950 p-2 rounded-lg border border-slate-900">{selectedClient.phone_e164 || 'Não configurado'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase font-mono border-b border-slate-800/60 pb-1.5">Métrica Comercial</h4>
                      <div className="space-y-1 font-mono text-xs">
                        <span className="text-slate-500 block">Data de Matrícula:</span>
                        <span className="text-slate-400 block">{new Date(selectedClient.created_at).toLocaleString('pt-PT')}</span>
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                        <span className="text-slate-500 block">Tipo de Licenciamento:</span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${
                          selectedClient.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {selectedClient.status === 'active' ? 'PLANO SAAS EMPRESARIAL' : 'PERÍODO EXPERIMENTAL (TRIAL)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: CONFIGURAÇÃO TÉCNICA E PROMPTS DE IA */}
                {activeSubTab === 'tecnico' && (
                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <label className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wide block">🧠 Master Prompt (Contexto Global)</label>
                      <p className="text-[10px] text-slate-500 font-sans">Define a personalidade, regras de negócio e restrições base que a IA nunca pode quebrar.</p>
                      <textarea
                        rows={6}
                        value={editPrompt}
                        onChange={e => setEditPrompt(e.target.value)}
                        placeholder="Ex: Tu és o assistente virtual da empresa X..."
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed"
                      />
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <label className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wide block">📋 Instruções de Operação Extra / Metadados</label>
                      <p className="text-[10px] text-slate-500 font-sans">Configurações de fluxos de suporte rápidos ou flags de controle de expiração de teste.</p>
                      <input
                        type="text"
                        value={editBotInstructions}
                        onChange={e => setEditBotInstructions(e.target.value)}
                        placeholder="[EXPIRAÇÃO:30/12/2026] [FLUXO:Comercial]"
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <button
                      onClick={handleSaveTechnicalConfig}
                      disabled={saving}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all font-mono"
                    >
                      {saving ? '⏳ A persistir dados no Supabase...' : '💾 Gravar Arquitetura de IA'}
                    </button>
                  </div>
                )}

                {/* SUB-TAB 3: VOLUMETRIA E CONSUMO DE RECURSOS */}
                {activeSubTab === 'consumo' && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase font-mono border-b border-slate-800/60 pb-1.5">Uso de Infraestrutura da VPS</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Mensagens Processadas (Mês)</span>
                        <span className="text-slate-200 font-bold">14,820 / 50,000</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full w-[29.6%] rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Chamadas de Tokens de IA (LLM)</span>
                        <span className="text-slate-200 font-bold">62% do limite</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-amber-500 h-full w-[62%] rounded-full"></div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl text-[10px] text-slate-500 font-mono leading-relaxed">
                      💡 Os limites de volumetria são reiniciados automaticamente no dia 1 de cada mês de acordo com o plano contratado.
                    </div>
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
              <span>💼 Carrega num cliente da lista para gerir os parâmetros de produção.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
