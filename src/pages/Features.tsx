import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  Globe, 
  Bot,
  Layers,
  Search,
  Settings
} from 'lucide-react';

const features = [
  {
    icon: <Bot />,
    title: "Chatbots Inteligentes",
    desc: "Crie fluxos de conversação automáticos que qualificam pedidos e respondem a dúvidas frequentes sem intervenção humana."
  },
  {
    icon: <Users />,
    title: "Gestão Multi-agente",
    desc: "Permita que toda a sua equipa atenda no mesmo número de WhatsApp, com atribuição automática de conversas."
  },
  {
    icon: <BarChart3 />,
    title: "Analytics Avançado",
    desc: "Relatórios detalhados sobre tempo de resposta, volume de mensagens e desempenho da equipa."
  },
  {
    icon: <Layers />,
    title: "Departamentos",
    desc: "Organize o seu atendimento por áreas (ex: Financeiro, Suporte, Vendas) para um fluxo de trabalho mais limpo."
  },
  {
    icon: <Search />,
    title: "Histórico Completo",
    desc: "Pesquise em todas as conversas passadas e nunca perca o contexto de um pedido de um cidadão ou cliente."
  },
  {
    icon: <Settings />,
    title: "API & Webhooks",
    desc: "Ligue o TrataTudo ao seu ecossistema de software atual de forma simples e segura."
  }
];

export function Features() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Funcionalidades Poderosas</h1>
          <p className="text-xl text-slate-600">Desenhadas para tornar a comunicação da sua organização mais eficiente e humana.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                {React.cloneElement(feat.icon as React.ReactElement, { className: "w-8 h-8" })}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{feat.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 bg-slate-900 rounded-[3rem] p-8 lg:p-20 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl lg:text-5xl font-display font-bold">Segurança e Privacidade em primeiro lugar</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Sabemos que a confiança é a base de qualquer organização. Por isso, o TrataTudo foi construído com os mais altos padrões de segurança.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary w-6 h-6" />
                  <span className="font-bold">RGPD Compliant</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary w-6 h-6" />
                  <span className="font-bold">Encriptação SSL</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary w-6 h-6" />
                  <span className="font-bold">Backups Diários</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary w-6 h-6" />
                  <span className="font-bold">Acesso Seguro</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="https://picsum.photos/seed/security/800/600" 
                alt="Segurança TrataTudo" 
                className="rounded-2xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
