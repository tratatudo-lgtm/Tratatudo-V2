import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Loader2, 
  ArrowRight, 
  Phone, 
  Calendar, 
  Clock,
  User,
  Smartphone,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  client_id: string;
  company_name: string;
  phone_e164: string;
  text: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  type: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/messages`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao carregar mensagens');
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => 
    msg.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.phone_e164.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium tracking-tight">A carregar fluxo de mensagens global...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fluxo de Mensagens</h1>
          <p className="text-slate-500 font-medium">Visualização global de todas as interações</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar mensagens..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
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
              transition={{ delay: index * 0.02 }}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                  msg.direction === 'inbound' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                )}>
                  {msg.direction === 'inbound' ? <MessageSquare className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-900 truncate">{msg.company_name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.phone_e164}</span>
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
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                      msg.direction === 'inbound' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {msg.direction === 'inbound' ? 'Recebida' : 'Enviada'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4" />
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
    </div>
  );
}
