import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  MessageSquare, 
  ClipboardList, 
  AlertCircle, 
  CreditCard, 
  HeadphonesIcon, 
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface UsageStat {
  used: number;
  limit: number;
}

interface SubscriptionData {
  client: {
    client_id: string;
    phone: string;
    status: string;
    trial_end: string;
    created_at: string;
    plan?: string;
  };
  usage: {
    messages: UsageStat;
    tickets: UsageStat;
    complaints: UsageStat;
  };
}

const benefits = [
  'Respostas automáticas inteligentes',
  'Gestão de pedidos centralizada',
  'Sistema de tickets avançado',
  'Painel de controlo em tempo real',
  'Integração WhatsApp oficial',
  'Suporte prioritário 24/7',
  'Relatórios mensais detalhados'
];

export function Subscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/subscription`;
    console.log(`[APP] Fetching subscription data: ${url}`);
    try {
      setLoading(true);
      const res = await fetch(url, {
        credentials: 'include'
      });
      console.log(`[APP] Fetch subscription data status: ${res.status}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Falha ao carregar dados da subscrição');
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error('[APP] Fetch subscription failed:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'trial': return 'Período de teste';
      case 'active': return 'Subscrição ativa';
      case 'expired': return 'Subscrição expirada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'trial': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'expired': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">A carregar detalhes da subscrição...</p>
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
            onClick={fetchSubscription}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data?.client) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md">
          <Zap className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Sem subscrição ativa</h3>
          <p className="text-slate-500 text-sm mb-8">
            Não encontrámos nenhuma subscrição associada à sua conta. Contacte o suporte para ativar o seu plano.
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
            Ver Planos
          </button>
        </div>
      </div>
    );
  }

  const { client, usage } = data;
  const messageProgress = (usage.messages.used / usage.messages.limit) * 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">A Minha Subscrição</h1>
        <p className="text-slate-500 text-sm">Gira o teu plano, consulta a utilização e benefícios ativos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Plan Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
            
            <div className="p-8 relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-slate-900">
                        Plano {client.plan || 'Atual'}
                      </h2>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border",
                        getStatusColor(client.status)
                      )}>
                        {getStatusLabel(client.status)}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> 
                      {client.status === 'trial' ? 'Fim do teste: ' : 'Próxima renovação: '}
                      <span className="font-bold text-slate-900">
                        {formatDate(client.trial_end || client.created_at)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-black text-slate-900">
                      {client.status === 'trial' ? 'Grátis' : '49€'}
                    </span>
                    {client.status !== 'trial' && (
                      <span className="text-slate-400 font-medium">/mês</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">IVA incluído à taxa legal</p>
                </div>
              </div>

              {/* Usage Section */}
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" /> Mensagens Processadas
                      </h4>
                      <p className="text-xs text-slate-500">Utilização este mês</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {usage.messages.used.toLocaleString()} <span className="text-slate-400 font-normal">/ {usage.messages.limit.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${messageProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        messageProgress > 90 ? "bg-red-500" : messageProgress > 70 ? "bg-orange-500" : "bg-primary"
                      )}
                    ></motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <ClipboardList className="w-5 h-5 text-orange-500" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Limite: {usage.tickets.limit}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{usage.tickets.used}</p>
                    <p className="text-xs text-slate-500 font-medium">Pedidos Gerados</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Limite: {usage.complaints.limit}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{usage.complaints.used}</p>
                    <p className="text-xs text-slate-500 font-medium">Reclamações Registadas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" /> Gerir Faturação
              </button>
              <button className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" /> Alterar Plano
              </button>
            </div>
          </div>

          {/* Benefits List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> O que está incluído no seu plano
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Support Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <HeadphonesIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Precisa de ajuda?</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                A nossa equipa de suporte está disponível para o ajudar a tirar o máximo partido do TrataTudo.
              </p>
              <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                Contactar Suporte <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Billing History Link */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between group cursor-pointer hover:border-primary transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Histórico de Faturas</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Consultar pagamentos</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </motion.div>

          {/* Security Badge */}
          <div className="px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamento Seguro</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              As suas transações são protegidas por encriptação SSL de 256 bits e processadas pelo Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
