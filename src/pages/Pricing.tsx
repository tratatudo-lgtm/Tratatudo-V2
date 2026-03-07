import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: "Starter",
    price: "49",
    desc: "Ideal para pequenas juntas ou negócios locais.",
    features: ["1 Número de WhatsApp", "3 Agentes", "Automação Básica", "Suporte via Email"],
    cta: "Começar Agora",
    popular: false
  },
  {
    name: "Profissional",
    price: "99",
    desc: "A escolha perfeita para organizações em crescimento.",
    features: ["2 Números de WhatsApp", "10 Agentes", "Automação Avançada", "Relatórios Detalhados", "Suporte Prioritário"],
    cta: "Escolher Plano",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Soluções à medida para grandes instituições.",
    features: ["Números Ilimitados", "Agentes Ilimitados", "API Dedicada", "Gestor de Conta", "SLA Garantido"],
    cta: "Contactar Vendas",
    popular: false
  }
];

export function Pricing() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Preços simples e transparentes</h1>
          <p className="text-xl text-slate-600">Escolha o plano que melhor se adapta à sua organização. Sem taxas ocultas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[2.5rem] border ${plan.popular ? 'border-primary bg-white shadow-2xl scale-105 z-10' : 'border-slate-200 bg-slate-50'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Mais Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-black text-slate-900">
                    {plan.price === "Custom" ? "" : "€"}
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && <span className="text-slate-500">/mês</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.price === "Custom" ? "/contacto" : "/experimentar"}
                className={`w-full py-4 rounded-2xl font-bold text-center block transition-all ${plan.popular ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
          <div className="space-y-4">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">Ativação Instantânea</h4>
            <p className="text-sm text-slate-500">Comece a atender em menos de 5 minutos após o registo.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">Sem Fidelização</h4>
            <p className="text-sm text-slate-500">Cancele ou altere o seu plano a qualquer momento sem custos.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">Suporte Local</h4>
            <p className="text-sm text-slate-500">Equipa técnica em Portugal pronta para ajudar a sua organização.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
