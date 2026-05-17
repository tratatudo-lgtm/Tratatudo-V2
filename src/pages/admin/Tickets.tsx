import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Tipagem robusta para refletir o banco de dados
interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'novo' | 'em_resolucao' | 'concluido';
  priority: 'low' | 'medium' | 'high';
  customer_name: string;
  customer_contact: string;
  created_at: string;
  client_id: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'admin' | 'customer';
  message_text: string;
  created_at: string;
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  // 📥 FAZ O FETCH DE TODOS OS INCIDENTES DO BANCO
  async function fetchTickets() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar tickets:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // 📥 CARREGA AS MENSAGENS INTERNAS DA THREAD SELECIONADA
  async function fetchMessages(ticketId: string) {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar mensagens do ticket:', err.message);
    }
  }

  // 🔄 ALTERA O ESTADO DO TICKET (NOVO -> EM RESOLUÇÃO -> CONCLUÍDO)
  async function updateTicketStatus(ticketId: string, newStatus: 'em_resolucao' | 'concluido') {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      // Sincroniza o estado local imediatamente
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(`Erro ao atualizar estado: ${err.message}`);
    }
  }

  // ✉️ ENVIA RESPOSTA DO ADMIN (E MUDA O ESTADO SE FOR O PRIMEIRO CONTACTO)
  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    // Se o ticket ainda estava como 'novo', move automaticamente para 'em_resolucao' ao responder
    const targetStatus = selectedTicket.status === 'novo' ? 'em_resolucao' : selectedTicket.status;

    try {
      // 1. Inserir mensagem de resposta
      const { error: msgError } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          sender_type: 'admin',
          message_text: replyText.trim()
        }]);

      if (msgError) throw msgError;

      // 2. Atualizar estado no banco se necessário
      if (selectedTicket.status === 'novo') {
        await updateTicketStatus(selectedTicket.id, 'em_resolucao');
      }

      setReplyText('');
      await fetchMessages(selectedTicket.id);
    } catch (err: any) {
      alert(`Erro ao enviar mensagem: ${err.message}`);
    }
  }

  // 🚦 LOGICA DE RESTRIÇÃO DE RESPOSTA
  const lastMessage = messages[messages.length - 1];
  
  // O cliente está impedido de escrever se:
  // 1. O ticket está concluído
  // 2. Ou se a última mensagem da fila já foi dele próprio (Aguardando resposta do Admin)
  const isCustomerBlocked = selectedTicket?.status === 'concluido' || (lastMessage && lastMessage.sender_type === 'customer');

  // Filtros de ecrã
  const filteredTickets = tickets.filter(t => filterStatus === 'todos' || t.status === filterStatus);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* HEADER DO SUB-MÓDULO */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            Central de Incidentes & Suporte
          </h2>
          <p className="text-[10px] font-mono text-slate-400">Workflow de Atendimento e Lock de Segurança</p>
        </div>
        <button onClick={fetchTickets} className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-mono">
          🔄 Recarregar
        </button>
      </header>

      {/* CONTROLO FILTROS RÁPIDOS */}
      <div className="bg-slate-900/40 p-3 border-b border-slate-800/60 flex gap-1.5 px-4 overflow-x-auto">
        {['todos', 'novo', 'em_resolucao', 'concluido'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase font-bold tracking-tight border ${
              filterStatus === st 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st === 'em_resolucao' ? 'Em Resolução' : st}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUNA ESQUERDA: LISTA DE TICKETS */}
        <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900/20 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center font-mono text-xs text-slate-500 pt-8">A ler base de dados...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center font-mono text-xs text-slate-500 pt-8">Nenhum ticket encontrado.</div>
          ) : (
            filteredTickets.map(t => (
              <div
                key={t.id}
                onClick={() => { setSelectedTicket(t); setMessages([]); }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedTicket?.id === t.id
                    ? 'bg-slate-900 border-indigo-500/80 shadow-lg'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="font-bold text-xs text-slate-200 truncate block w-44">{t.subject}</span>
                  
                  {/* BADGES CORRESPONDENTES AOS ESTADOS */}
                  <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded tracking-wide ${
                    t.status === 'novo' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    t.status === 'em_resolucao' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {t.status === 'em_resolucao' ? '🔧 Fila' : t.status}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400 line-clamp-2 font-sans mb-2">{t.description}</p>
                
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1.5 border-t border-slate-800/40">
                  <span>{t.customer_name || '👤 S/ Nome'}</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* COLUNA DIREITA: CONVERSA E WORKFLOW DE ACÇÃO */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {selectedTicket ? (
            <>
              {/* HEADER DO TICKET ACTIVO */}
              <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedTicket.subject}</h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    Cliente: {selectedTicket.customer_name} ({selectedTicket.customer_contact})
                  </p>
                </div>

                {/* BOTÕES DE MUDANÇA DE ESTADO OPERACIONAL */}
                <div className="flex items-center gap-1.5">
                  {selectedTicket.status !== 'em_resolucao' && selectedTicket.status !== 'concluido' && (
                    <button 
                      onClick={() => updateTicketStatus(selectedTicket.id, 'em_resolucao')}
                      className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg font-mono uppercase"
                    >
                      🔧 Tratar Internamente
                    </button>
                  )}
                  {selectedTicket.status !== 'concluido' && (
                    <button 
                      onClick={() => updateTicketStatus(selectedTicket.id, 'concluido')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg font-mono uppercase"
                    >
                      🔒 Encerrar Chamado
                    </button>
                  )}
                </div>
              </div>

              {/* CORPO DE MENSAGENS INTERNAS */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-left bg-slate-950/40">
                
                {/* Mensagem Base / Descrição original do ticket */}
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl max-w-2xl">
                  <span className="text-[9px] font-mono text-indigo-400 font-bold block mb-1">🚨 DESCRIÇÃO DE ABERTURA:</span>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                      msg.sender_type === 'admin'
                        ? 'bg-indigo-600 text-white ml-auto rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto rounded-tl-none'
                    }`}
                  >
                    <span className="text-[8px] font-mono opacity-60 block mb-1">
                      {msg.sender_type === 'admin' ? '🛡️ Suporte Técnico' : `👤 ${selectedTicket.customer_name}`}
                    </span>
                    <p className="whitespace-pre-wrap">{msg.message_text}</p>
                  </div>
                ))}
              </div>

              {/* BARRA DE INPUT COM REGRAS DE TRAVAGEM INTEGRADAS */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                {selectedTicket.status === 'concluido' ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-center font-mono text-[11px]">
                    ⛔ Ticket Concluído. A thread de mensagens encontra-se trancada para ambas as partes.
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escreve aqui a resposta de suporte para enviar ao cliente..."
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-sans"
                      />
                      <button 
                        type="submit" 
                        disabled={!replyText.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-xs"
                      >
                        Responder ➔
                      </button>
                    </div>

                    {/* Alerta Visual informativo sobre o comportamento do lado do cliente */}
                    <div className="text-left">
                      <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                        isCustomerBlocked 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {isCustomerBlocked 
                          ? '⚙️ Do lado do cliente: Caixa de texto BLOQUEADA até tu responderes.' 
                          : '⚙️ Do lado do cliente: Caixa de texto ATIVA (Última interação foi tua).'}
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
              <span>🎯 Seleciona um ticket na lista lateral para gerir o atendimento.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
