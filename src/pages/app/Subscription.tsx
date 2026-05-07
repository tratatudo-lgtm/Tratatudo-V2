import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Shield, 
  Globe, 
  MessageSquare, 
  HelpCircle,
  Clock,
  ArrowRight,
  Loader2,
  X,
  Send,
  LifeBuoy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

import { apiGet, apiPost } from '../../lib/api';

interface SubscriptionData {
  plan: string;
  status: string;
  started_at: string;
  ends_at: string | null;
}

interface UsageData {
  messages: number;
  tickets: number;
  complaints: number;
}

const SupportModal = ({ isOpen, onClose, onSubmit }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Geral');
  const [priority, setPriority] = useState('média');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Por favor, preencha o assunto e a mensagem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ subject, message, category, priority });
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting support ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Suporte TrataTudo</h3>
                  <p className="text-sm text-slate-500">Como podemos ajudar hoje?</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Sugestão">Sugestão</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Assunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Dúvida sobre faturas"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mensagem detalhada</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva o seu problema ou dúvida..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PaymentMethodsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Métodos de Pagamento</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-900 font-bold">Portal de Faturação Seguro</p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Para sua segurança, a gestão de cartões e faturas é feita exclusivamente através do Portal Stripe.
                </p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={async () => {
                    try {
                      toast.loading('A redirecionar para o Portal Stripe...');
                      const json = await apiPost('/api/client/stripe/portal', {});
                      toast.dismiss();
                      if (json.url) {
                        window.location.href = json.url;
                      } else {
                        toast.error('Não foi possível abrir o portal.');
                      }
                    } catch (err: any) {
                      toast.dismiss();
                      toast.error(err.message || 'Erro de conexão ao abrir o portal.');
                    }
                  }}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  Ir para Portal Stripe
                  <ExternalLink className="w-4 h-4" />
                </button>
                <p className="mt-4 text-xs text-slate-400">
                  Enviamos um link de acesso seguro para o seu email.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function Subscription() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ subscription: SubscriptionData; usage: UsageData } | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let json;
      try {
        json = await apiGet('/api/client/subscription');
      } catch (e) {
        json = await apiGet('/api/subscription');
      }
      
      setData(json);
    } catch (err: any) {
      console.error('[SUBSCRIPTION] Fetch failed:', err);
      
      // Professional fallback for demo/development
      if (import.meta.env.DEV || !import.meta.env.VITE_API_URL) {
        console.log('[SUBSCRIPTION] Using fallback data');
        setData({
          subscription: {
            plan: 'Trial',
            status: 'Ativo',
            started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            ends_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          usage: {
            messages: 45,
            tickets: 2,
            complaints: 0
          }
        });
        setError(null);
      } else {
        setError(err.message || 'Não foi possível carregar os dados da sua subscrição.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = async (supportData: any) => {
    try {
      const json = await apiPost('/api/client/tickets', {
        subject: supportData.subject,
        description: supportData.message,
        category: supportData.category,
        priority: supportData.priority
      });
      
      if (json.ticket) {
        toast.success('Ticket de suporte criado com sucesso! O código é ' + json.ticket.tracking_code);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro de conexão ao criar ticket.');
      throw err;
    }
  };

  const handleUpgrade = async (plan: string) => {
    const priceId = plan === 'Pro' ? 'price_pro_id' : 'price_enterprise_id';
    
    try {
      toast.loading(`A preparar checkout para o plano ${plan}...`);
      
      const json = await apiPost('/api/client/stripe/checkout', { priceId });
      toast.dismiss();
      
      if (json.url) {
        window.location.href = json.url;
      } else {
        setIsPaymentModalOpen(true);
        toast.info('Redirecionamento automático indisponível. Por favor, use o formulário de pagamento.');
      }
    } catch (err: any) {
      toast.dismiss();
      console.error('[SUBSCRIPTION] Upgrade error:', err);
      setIsPaymentModalOpen(true);
      toast.info('Erro de conexão. Por favor, use o formulário de pagamento.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Erro de Carregamento</h3>
        <p className="text-slate-600">{error}</p>
        <button 
          onClick={fetchSubscription}
          className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const subscription = data?.subscription;
  const usage = data?.usage;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscrição & Faturação</h1>
          <p className="text-slate-500 mt-1">Gira o seu plano, veja o uso e aceda ao suporte.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4" />
            Contactar Suporte
          </button>
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            <CreditCard className="w-4 h-4" />
            Métodos de Pagamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
          >
            <div className="p-8 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Plano {subscription?.plan}</h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                      {subscription?.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Subscrição ativa desde {subscription?.started_at ? new Date(subscription.started_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Próxima fatura</p>
                <p className="text-lg font-bold text-slate-900">
                  {subscription?.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Mensagens</span>
                  <span className="text-slate-900 font-bold">{usage?.messages || 0} / ∞</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[15%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tickets</span>
                  <span className="text-slate-900 font-bold">{usage?.tickets || 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Reclamações</span>
                  <span className="text-slate-900 font-bold">{usage?.complaints || 0}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[5%]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Segurança Avançada</h4>
                <p className="text-sm text-slate-500 mt-1">Proteção de dados e backups diários automáticos.</p>
              </div>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">API de Integração</h4>
                <p className="text-sm text-slate-500 mt-1">Conecte o TrataTudo aos seus sistemas internos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Help Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Precisa de ajuda?</h3>
              <p className="text-slate-400 text-sm mb-6">A nossa equipa de especialistas está pronta para ajudar a escalar o seu negócio.</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setIsSupportOpen(true)}
                  className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Abrir Ticket
                </button>
                <button 
                  onClick={() => toast.info('A carregar histórico de suporte...')}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
                >
                  <Clock className="w-4 h-4" />
                  Histórico de Suporte
                </button>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-4">Perguntas Frequentes</h4>
            <div className="space-y-4">
              {[
                'Como alterar o meu plano?',
                'Posso cancelar a qualquer momento?',
                'Como funciona o suporte 24/7?',
                'Onde encontro as minhas faturas?'
              ].map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => toast.info(`Dica: ${q}`)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">{q}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Comparison (Optional/Hidden if already Pro) */}
      {(subscription?.plan === 'Trial' || subscription?.plan === 'Grátis') && (
        <div className="pt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Pronto para o próximo nível?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Escolha o plano que melhor se adapta ao volume da sua operação e comece a tratar de tudo hoje mesmo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 transition-all group relative">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Plano Pro</h3>
                <p className="text-slate-500 text-sm">Para pequenas e médias empresas</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">49€</span>
                  <span className="text-slate-500 font-medium">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {['Mensagens Ilimitadas', 'Instância Dedicada', 'Suporte Prioritário', 'Dashboard Avançado'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleUpgrade('Pro')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
              >
                Ativar Plano Pro
              </button>
            </div>

            <div className="p-8 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-emerald-100 text-sm">Para grandes operações</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black">149€</span>
                    <span className="text-emerald-100 font-medium">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {['Tudo do Plano Pro', 'Múltiplas Instâncias', 'Gestor de Conta', 'SLA Garantido'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-emerald-50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleUpgrade('Enterprise')}
                  className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-xl"
                >
                  Contactar Vendas
                </button>
              </div>
              
              <div className="absolute top-0 right-0 p-4">
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-widest">Recomendado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)}
        onSubmit={handleSupportSubmit}
      />

      <PaymentMethodsModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
