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
import { cn, extractArrayResponse } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';

interface Message {
  id: string;
  client_id: string;
  company_name: string;
  instance_name?: string;
  phone_e164: string;
  text: string;
  direction: 'inbound' | 'outbound';
  status?: string;
  created_at: string;
  type: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { logout } = useAdminAuth();

  const fetchMessages = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
    const endpoints = [
      `${baseUrl}/api/admin/messages`,
      `${baseUrl}/api/messages`
    ];
    
    let lastError = null;
    
    try {
      setLoading(true);
      setError(null);
      
      for (const url of endpoints) {
        console.log(`[ADMIN] Fetching messages: ${url}`);
        try {
          const res = await fetch(url, {
            credentials: 'include'
          });
          
          if (res.ok) {
            const data = await res.json();
            const messagesData = extractArrayResponse<Message>(data, 'messages');
            setMessages(messagesData);
            setLoading(false);
            return;
          } else if (res.status === 401) {
            console.warn('[ADMIN] Session expired, logging out...');
            await logout();
            return;
          }
        } catch (e) {
          lastError = e;
        }
      }
      
      throw lastError || new Error('Falha ao carregar fluxo de mensagens');
      
    } catch (err: any) {
      console.error('[ADMIN] Fetch messages failed:', err);
      setError(err.message || 'Não foi possível carregar as mensagens.');
      
      // Professional fallback for demo/development
      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        console.log('[ADMIN] Using fallback messages data');
        setMessages([
          {
            id: '1',
            client_id: 'C-1001',
            type: 'whatsapp',
            company_name: 'João Silva Lda',
            instance_name: 'TT-JOAO',
            phone_e164: '+351912345678',
            text: 'Olá, gostaria de saber o estado do meu pedido.',
            direction: 'inbound',
            status: 'read',
            created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            client_id: 'C-1001',
            type: 'whatsapp',
            company_name: 'João Silva Lda',
            instance_name: 'TT-JOAO',
            phone_e164: '+351910000001',
            text: 'Olá João! O seu pedido está a ser processado pela nossa equipa.',
            direction: 'outbound',
            status: 'delivered',
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          }
        ]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => 
    msg.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.phone_e164.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState message="A carregar fluxo de mensagens global..." className="h-[60vh]" />;
  }

  if (error) {
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
