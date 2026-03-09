import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Activity, 
  ShieldCheck, 
  Calendar, 
  MessageSquare, 
  Send, 
  ClipboardList, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

interface InstanceData {
  instance_name: string;
  whatsapp_number: string;
  status: string;
  is_hub: boolean;
  created_at: string;
  last_activity?: string;
}

interface Stats {
  totalMessages: number;
  sentMessages: number;
  receivedMessages: number;
  totalTickets: number;
  complaints: number;
}

export function Instance() {
  const [data, setData] = useState<{ instance: InstanceData | null; stats: Stats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstanceData = async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/instance`;
    console.log(`[APP] Fetching instance data: ${url}`);
    try {
      setLoading(true);
      const res = await fetch(url, {
        credentials: 'include'
      });
      console.log(`[APP] Fetch instance data status: ${res.status}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar dados da instância');
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error('[APP] Fetch instance data failed:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstanceData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Sem atividade recente';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} horas`;
    return formatDate(dateStr);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">A carregar estado da instância...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button 
            onClick={fetchInstanceData}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data?.instance) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md">
          <Smartphone className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Sem instância configurada</h3>
          <p className="text-slate-500 text-sm mb-8">
            Ainda não tens uma instância WhatsApp configurada. Contacta o suporte para ativar a tua ligação.
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
            Solicitar Ativação
          </button>
        </div>
      </div>
    );
  }

  const { instance, stats } = data;

  const quickStats = [
    { label: 'Mensagens Recebidas', value: stats.receivedMessages.toLocaleString(), icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Mensagens Enviadas', value: stats.sentMessages.toLocaleString(), icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pedidos Gerados', value: stats.totalTickets.toLocaleString(), icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Reclamações Geradas', value: stats.complaints.toLocaleString(), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Estado da Instância</h1>
        <p className="text-slate-500 text-sm">Gira e monitoriza a tua ligação WhatsApp em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Instance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{instance.instance_name}</h2>
                  <p className="text-slate-500 font-mono text-sm">{instance.whatsapp_number}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2",
                  instance.status.toLowerCase() === 'conectado' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  instance.status.toLowerCase() === 'reconectando' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                  "bg-red-50 text-red-600 border border-red-100"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    instance.status.toLowerCase() === 'conectado' ? "bg-emerald-500 animate-pulse" :
                    instance.status.toLowerCase() === 'reconectando' ? "bg-orange-500 animate-spin" :
                    "bg-red-500"
                  )}></div>
                  {instance.status}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado da Ligação</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tipo de Instância</span>
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {instance.is_hub ? "Hub Trial (instância partilhada)" : "Instância Privada"}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Data de Criação</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{formatDate(instance.created_at)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Última Atividade</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{formatRelativeTime(instance.last_activity)}</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reiniciar Instância
            </button>
            <button className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Sincronizar Agora
            </button>
          </div>
        </motion.div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Estatísticas Rápidas
            </h3>
            <div className="space-y-4">
              {quickStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Processado</span>
                <span className="text-lg font-bold text-primary">{stats.totalMessages.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20"
          >
            <h3 className="text-sm font-bold mb-6">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link to="/app/messages" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group">
                <span className="text-xs font-medium">Ver Mensagens</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/app/requests" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group">
                <span className="text-xs font-medium">Ver Pedidos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/app/subscription" className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group">
                <span className="text-xs font-medium">Ver Subscrição</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Connection Health / Logs Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Saúde da Ligação
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimas 24 Horas</span>
        </div>
        <div className="p-8">
          <div className="flex items-end gap-1 h-12 mb-4">
            {[...Array(48)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex-1 rounded-full transition-all hover:scale-y-125 cursor-help",
                  i === 12 || i === 35 ? "bg-red-400 h-4" : 
                  i > 40 ? "bg-emerald-500 h-12" : "bg-emerald-500 h-10"
                )}
                title={i === 12 || i === 35 ? "Falha na ligação" : "Ligação estável"}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Há 24h</span>
            <span>Agora</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
