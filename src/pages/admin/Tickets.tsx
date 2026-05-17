import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Ticket {
  id: string;
  client_id: string;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  clients?: {
    company_name: string;
  };
}

export function AdminTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      loadTickets();
    }
    checkAuthAndLoad();
  }, [navigate]);

  async function loadTickets() {
    setLoading(true);
    try {
      // Faz o Join automático com a tabela de clientes para sabermos de quem é o ticket
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          client_id,
          subject,
          description,
          status,
          priority,
          created_at,
          clients ( company_name )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTickets(data as any);
    } catch (err) {
      console.error('Erro ao carregar tickets:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateTicketStatus(ticketId: string, newStatus: Ticket['status']) {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (!error) {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        alert(`Status atualizado para ${newStatus}!`);
      }
    } catch (err) {
      alert('Erro ao atualizar status.');
    } finally {
      setUpdating(false);
    }
  }

  // Simulação de envio de nota/resposta de suporte (pode ser gravada nos logs do ticket ou enviada por email)
  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminResponse.trim() || !selectedTicket) return;
    
    alert(`Resposta enviada para o cliente:\n"${adminResponse}"\n\n(Podes integrar isto com um disparo de email ou tabela ticket_replies no futuro)`);
    setAdminResponse('');
  };

  const filteredTickets = tickets.filter(t => filterStatus === 'all' || t.status === filterStatus);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400 font-mono text-xs tracking-widest animate-pulse">
      CARREGANDO CENTRAL DE SUPORTE...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-6 flex flex-col">
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-4 py-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"></span>
              <h1 className="text-xl font-black uppercase tracking-wider text-white">TrataTudo <span className="text-rose-400">Helpdesk</span></h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">Gestão de Incidências & Tickets SaaS</p>
          </div>
          
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-300 px-3 py-1.5 font-bold rounded-lg outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">Todos os Estados</option>
              <option value="open" className="bg-slate-900">🟢 Abertos</option>
              <option value="pending" className="bg-slate-900">🟡 Pendentes</option>
              <option value="resolved" className="bg-slate-900">🔵 Resolvidos</option>
              <option value="closed" className="bg-slate-900">🔴 Fechados</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Coluna da Esquerda: Lista de Tickets */}
        <div className="lg:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">🎫 Fila de Atendimento ({filteredTickets.length})</h2>
          <div className="space-y-2">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => { setSelectedTicket(ticket); setAdminResponse(''); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedTicket?.id === ticket.id ? 'bg-rose-950/20 border-rose-500' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    ticket.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : ticket.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    ticket.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : ticket.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white truncate">{ticket.subject}</h3>
                <p className="text-[11px] font-medium text-indigo-400 mt-1">{ticket.clients?.company_name || 'Cliente TrataTudo'}</p>
                <p className="text-[10px] font-mono text-slate-500 text-right mt-2">{new Date(ticket.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <p className="text-xs font-mono text-slate-600 text-center py-8">Nenhum ticket encontrado com este filtro.</p>
            )}
          </div>
        </div>

        {/* Coluna da Direita: Detalhe e Resolução do Ticket */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl h-[650px] overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              <div className="p-5 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedTicket.subject}</h3>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">Remetente: {selectedTicket.clients?.company_name || 'Cliente Pleno'}</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    disabled={updating}
                    onClick={() => updateTicketStatus(selectedTicket.id, 'pending')}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    ⏸️ Pendente
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    ✅ Resolver
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                    className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    🔒 Fechar
                  </button>
                </div>
              </div>

              {/* Corpo da Descrição */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40 space-y-4 text-left">
                <div className="bg-slate-900 border border-slate-800/60 p-4 rounded-xl">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">📩 Descrição do Problema:</p>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Caixa de Resposta Rápida */}
              <form onSubmit={handleSendResponse} className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
                <textarea
                  rows={3}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Escreve aqui a mensagem de suporte para enviar diretamente ao painel do cliente..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-rose-500 transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={!adminResponse.trim()}
                    className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg"
                  >
                    Responder Cliente ➔
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <div className="text-3xl mb-2">🎫</div>
              <p className="text-xs font-mono">Seleciona um ticket de suporte na barra lateral para ver os detalhes da ocorrência.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
