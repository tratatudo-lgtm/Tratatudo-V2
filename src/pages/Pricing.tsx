import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Shield, Users, Loader2, Bot, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../lib/api';

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "49",
    desc: "Ideal para micro-empresas e profissionais liberais.",
    features: ["1 Número de WhatsApp", "3 Agentes de Atendimento", "Automação e CRM Básico", "Painel Analítico Simplificado", "Suporte via Email"],
    cta: "Começar Agora",
    popular: false,
    highlight: false
  },
  {
    id: "pro",
    name: "Profissional",
    price: "99",
    desc: "A escolha perfeita para equipas comerciais em crescimento.",
    features: ["2 Números de WhatsApp", "10 Agentes de Atendimento", "Integração Nativa de IA", "Pipelines de Venda Ilimitados", "Suporte Prioritário 24/7"],
    cta: "Escolher Plano Pro",
    popular: true,
    highlight: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    desc: "Soluções à medida para grandes operações e instituições.",
    features: ["Números Ilimitados", "Agentes Ilimitados", "Infraestrutura VPS Isolada", "API Dedicada (Evolution)", "SLA de Estabilidade Garantido"],
    cta: "Falar com Vendas",
    popular: false,
    highlight: false
  },
  {
    id: "reseller",
    name: "White Label",
    price: "Sob Consulta",
    desc: "Crie a sua própria marca de SaaS e retenha 100% do lucro.",
    features: ["Painel Admin Administrativo", "Domínio Customizado Próprio", "Logótipo e Identidade Visual", "Preço Fixo por Instância", "Manutenção e Servidores Incluídos"],
    cta: "Ativar Minha Marca",
    popular: false,
    highlight: false
  }
];

const GlowEffect = ({ color = "indigo" }: { color?: string }) => (
  <div className={`absolute -z-10 w-[400px] h-[400px] bg-${color}-500/10 blur-[100px] rounded-full pointer-events-none`} />
);

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async (planId: string) => {
    if (planId === "enterprise") {
      window.open("https://wa.me/351923364360?text=Olá! Gostaria de obter uma proposta comercial à medida para o plano Enterprise do TrataTudo.", "_blank");
      return;
    }

    if (planId === "reseller") {
      window.open("https://wa.me/351923364360?text=Olá! Quero saber mais informações e os preços de adesão para o modelo White Label / Reseller.", "_blank");
      return;
    }

    setLoading(planId);
    try {
      const response = await apiPost('/api/client/stripe/checkout', { planId });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao iniciar checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erro ao iniciar o fluxo de faturação. Por favor, tente novamente ou contacte o suporte.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pt-32 pb-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4">
        <GlowEffect color="indigo" />
      </div>
      <div className="absolute bottom-1/4 right-1/4">
        <GlowEffect color="purple" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-4 py-1 rounded-full text-xs text-indigo-400 font-medium backdrop-blur-md"
          >
            <Shield className="w-3.5 h-3.5" /> Sem fidelização. Cancele quando quiser.
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Planos Simples e Transparentes
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Escolha a escala ideal para a sua operação. Do micro-negócio local à revenda integral sob a sua própria marca.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative p-6 md:p-8 rounded-[2rem] border flex flex-col justify-between backdrop-blur-md transition-all duration-300 ${
                plan.highlight 
                  ? 'border-indigo-500 bg-slate-900/80 shadow-[0_0_30px_rgba(99,102,241,0.15)] lg:scale-105 z-10' 
                  : plan.id === 'reseller'
                    ? 'border-emerald-500/30 bg-gradient-to-b from-slate-900/60 to-emerald-950/10 hover:border-emerald-500/50'
                    : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  Mais Recomendado
                </div>
              )}
              
              {plan.id === 'reseller' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">
                  Oportunidade de Negócio
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-xs min-h-[32px] leading-relaxed">{plan.desc}</p>
                </div>

                <div className="mb-8 pb-6 border-b border-slate-800/60">
                  <div className="flex items-baseline gap-1">
                    {plan.price !== "Custom" && plan.price !== "Sob Consulta" && (
                      <span className="text-2xl font-bold text-slate-400">€</span>
                    )}
                    <span className="text-4xl font-black text-white tracking-tight">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && plan.price !== "Sob Consulta" && (
                      <span className="text-slate-500 text-sm font-medium">/mês</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-slate-300 leading-tight">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.id === 'reseller' ? 'text-emerald-400' : 'text-indigo-400'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading !== null}
                className={`w-full py-4 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all duration-300 ${
                  plan.highlight 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]' 
                    : plan.id === 'reseller'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 active:scale-[0.98]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    {plan.cta}
                    {(plan.id === 'enterprise' || plan.id === 'reseller') && <ArrowRight className="w-3.5 h-3.5" />}
                  </span>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Value Props Grid */}
        <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto border-t border-slate-900 pt-16">
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex gap-4 items-start">
            <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base mb-1">Ativação em Minutos</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Conecte a sua instância API e configure as diretrizes da IA imediatamente.</p>
            </div>
          </div>
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex gap-4 items-start">
            <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base mb-1">Cérebro IA Dedicado</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Os agentes assimilam PDFs e links institucionais para interações fluidas.</p>
            </div>
          </div>
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex gap-4 items-start">
            <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base mb-1">Infraestrutura em Portugal</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Servidores otimizados locais com latência ultra-reduzida e suporte nativo.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
