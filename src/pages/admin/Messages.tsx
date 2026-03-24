import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ArrowRight, 
  Phone, 
  Calendar, 
  Clock,
  Smartphone,
  CheckCircle2,
  X,
  UserCheck,
  Bot,
  Copy,
  ChevronRight,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { LoadingState, ErrorState } from '../../components/States';

interface Message {
  id: string;
  client_id: string;
  phone_e164: string;
  text: string;
  direction: 'inbound' | 'outbound';
  instance?: string;
  created_at: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const { logout, fetchWithAuth } = useAdminAuth();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetchWithAuth('/api/admin/messages');
      
      if (res.ok) {
        const data = await res.json();
        const messagesData = extractArrayResponse<Message>(data);
        setMessages(messagesData);
      } else if (res.status === 401) {
        await logout();
      } else {
        throw new Error('Falha ao carregar fluxo de mensagens');
      }
    } catch (err: any) {
      console.error('[ADMIN] Fetch messages failed:', err);
      setError(err.message || 'Não foi possível carregar as mensagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => 
    msg.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.phone_e164.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  if (loading && messages.length === 0) {
    return <LoadingState message="A carregar fluxo de mensagens global..." className="h-[60vh]" />;
  }

  if (error && messages.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ErrorState message={error} />
        <button 
          onClick={fetchMessages}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fluxo de Mensagens</h1>
          <p className="text-slate-500 font-medium">Visualização global de todas as interações em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar mensagens..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm font-medium"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filteredMessages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => setSelectedMessage(msg)}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-all group-hover:scale-105",
                  msg.direction === 'inbound' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                )}>
                  {msg.direction === 'inbound' ? <UserCheck className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-900 truncate">Cliente: {msg.client_id}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{msg.phone_e164}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed">
                    {msg.text}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                        msg.direction === 'inbound' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {msg.direction === 'inbound' ? 'Recebida' : 'Enviada'}
                      </span>
                      {msg.instance && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {msg.instance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium tracking-tight">Nenhuma mensagem encontrada.</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                    selectedMessage.direction === 'inbound' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {selectedMessage.direction === 'inbound' ? <UserCheck className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">Detalhe da Mensagem</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Cliente: {selectedMessage.client_id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedMessage.text}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(selectedMessage.text)}
                    className="absolute top-4 right-4 p-2 bg-white border border-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-50"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                    <p className="text-xs font-bold text-slate-900 font-mono">{selectedMessage.phone_e164}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data e Hora</p>
                    <p className="text-xs font-bold text-slate-900">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Direção</p>
                    <p className="text-xs font-bold text-slate-900 capitalize">{selectedMessage.direction}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instância</p>
                    <p className="text-xs font-bold text-slate-900">{selectedMessage.instance || 'N/A'}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
