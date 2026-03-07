import React from 'react';
import { motion } from 'motion/react';
import { 
  Scan, 
  Settings2, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: <Scan />,
    title: "1. Conexão Instantânea",
    desc: "Basta fazer scan do QR Code com o seu telemóvel para ligar o seu número de WhatsApp ao TrataTudo. Sem configurações técnicas complexas.",
    image: "https://picsum.photos/seed/step1/600/400"
  },
  {
    icon: <Settings2 />,
    title: "2. Personalização do Fluxo",
    desc: "Defina as suas mensagens de boas-vindas, horários de funcionamento e crie menus de opções para os seus utilizadores.",
    image: "https://picsum.photos/seed/step2/600/400"
  },
  {
    icon: <MessageSquare />,
    title: "3. Gestão Centralizada",
    desc: "As mensagens começam a cair no seu painel. A sua equipa pode responder manualmente ou deixar a automação tratar do trabalho pesado.",
    image: "https://picsum.photos/seed/step3/600/400"
  }
];

export function HowItWorks() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Como funciona</h1>
          <p className="text-xl text-slate-600">Uma plataforma intuitiva que não requer conhecimentos técnicos para ser operada.</p>
        </div>

        <div className="space-y-32 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <motion.div 
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2 space-y-6"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6">
                  {React.cloneElement(step.icon as React.ReactElement, { className: "w-8 h-8" })}
                </div>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900">{step.title}</h2>
                <p className="text-slate-600 text-lg leading-relaxed">{step.desc}</p>
                <ul className="space-y-3 pt-4">
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                    <span>Configuração em menos de 5 minutos</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                    <span>Interface totalmente em Português</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:w-1/2 relative"
              >
                <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10" />
                <img 
                  src={step.image} 
                  alt={step.title} 
                  className="rounded-3xl shadow-2xl border border-slate-100"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center space-y-8">
          <h3 className="text-3xl font-display font-bold text-slate-900">Quer ver em ação?</h3>
          <button className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl">
            <PlayCircle className="w-6 h-6" /> Assistir Demonstração
          </button>
        </div>
      </div>
    </div>
  );
}
