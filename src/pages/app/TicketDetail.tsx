import React, { useState, useEffect } from 'react';
import { 
  useParams, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  History, 
  Send, 
  User, 
  Clock, 
  Tag, 
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Calendar,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { HubTicket, TicketMessage, TicketActivity, AREA_CONFIG } from '../../types/hub';
import { StatusBadge } from '../../components/app/StatusBadge';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<HubTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [history, setHistory] = useState<TicketActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'history'>('messages');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, messagesRes, historyRes] = await Promise.all([
        fetch(`/api/client/tickets/${id}`, { credentials: 'include' }),
        fetch(`/api/client/tickets/${id}/messages`, { credentials: 'include' }),
        fetch(`/api/client/tickets/${id}/history`, { credentials: 'include' })
      ]);

      const ticketData = await ticketRes.json();
      const messagesData = await messagesRes.json();
      const historyData = await historyRes.json();

      if (ticketData.ok) setTicket(ticketData.ticket);
      if (messagesData.ok) setMessages(messagesData.messages);
      if (historyData.ok) setHistory(historyData.history);
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      toast.error('Erro ao carregar detalhes do ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      // In a real app, this would be a POST to /api/client/tickets/:id/messages
      // For now, we'll simulate it or just show a toast if the endpoint isn't ready
      toast.info('Funcionalidade de resposta em breve');
      setNewMessage('');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 animate-pulse font-medium">A carregar detalhes do ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Ticket não encontrado</h2>
        <p className="text-slate-500">O ticket que procura não existe ou não tem permissão para o ver.</p>
        <button 
          onClick={() => navigate('/app/tickets')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'text-red-600 bg-red-50 border-red-100';
      case 'alta': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'média': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'baixa': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/app/tickets')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Voltar para a lista</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-wider">
            {ticket.tracking_code}
          </span>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{ticket.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ticket.created_at).toLocaleDateString('pt-PT')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
            </div>
          </div>

          {/* Interactions Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-4">
              <button 
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'messages' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Mensagens</span>
                  <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md text-[10px]">
                    {messages.length}
                  </span>
                </div>
                {activeTab === 'messages' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <span>Histórico</span>
                </div>
                {activeTab === 'history' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'messages' ? (
                  <motion.div 
                    key="messages"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex gap-3 ${msg.sender_type === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.sender_type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className={`max-w-[80%] space-y-1 ${msg.sender_type === 'user' ? 'items-end' : ''}`}>
                            <div className="flex items-center gap-2 px-1">
                              <span className="text-xs font-bold text-slate-700">{msg.sender_name}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                              msg.sender_type === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-sm shadow-blue-100' 
                                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                            }`}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <p className="text-sm italic">Sem mensagens neste ticket.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {history.map((event, idx) => (
                      <div key={event.id} className="relative flex gap-4">
                        {idx !== history.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-100" />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          event.event_type === 'create' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {event.event_type === 'create' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="pt-1.5 space-y-1">
                          <p className="text-sm font-medium text-slate-900">{event.event_label}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{event.user_name}</span>
                            <span>•</span>
                            <span>{new Date(event.created_at).toLocaleString('pt-PT')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message Input */}
            {activeTab === 'messages' && (
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escreva a sua resposta..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Informação do Cliente
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Empresa / Nome</p>
                <p className="text-sm font-medium text-slate-900">{ticket.client_name || 'N/A'}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{ticket.client_phone || 'Sem telefone'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{ticket.client_id ? 'cliente@exemplo.com' : 'Sem email'}</span>
                </div>
              </div>
              <Link 
                to={`/app/clients/${ticket.client_profile_id}`}
                className="block w-full text-center py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Ver Perfil Completo
              </Link>
            </div>
          </div>

          {/* Ticket Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Detalhes do Ticket
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Responsável</p>
                  <p className="text-xs font-medium text-slate-900">{ticket.assigned_user_name || 'Não atribuído'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Criado por</p>
                  <p className="text-xs font-medium text-slate-900">Sistema / Bot</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Última Atualização</p>
                <p className="text-xs font-medium text-slate-900">
                  {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('pt-PT') : 'Sem atualizações'}
                </p>
              </div>
            </div>
          </div>

          {/* Internal Notes Placeholder */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Notas Internas
            </h4>
            <p className="text-xs text-amber-700 italic">
              Este espaço está reservado para notas internas da equipa que não são visíveis para o cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
