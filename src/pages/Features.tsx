import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   BarChart3, 
import.meta.env.VITE_API_URL   Users, 
import.meta.env.VITE_API_URL   Zap, 
import.meta.env.VITE_API_URL   ShieldCheck, 
import.meta.env.VITE_API_URL   Smartphone, 
import.meta.env.VITE_API_URL   Clock, 
import.meta.env.VITE_API_URL   Globe, 
import.meta.env.VITE_API_URL   Bot,
import.meta.env.VITE_API_URL   Layers,
import.meta.env.VITE_API_URL   Search,
import.meta.env.VITE_API_URL   Settings
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const features = [
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Bot />,
import.meta.env.VITE_API_URL     title: "Chatbots Inteligentes",
import.meta.env.VITE_API_URL     desc: "Crie fluxos de conversação automáticos que qualificam pedidos e respondem a dúvidas frequentes sem intervenção humana."
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Users />,
import.meta.env.VITE_API_URL     title: "Gestão Multi-agente",
import.meta.env.VITE_API_URL     desc: "Permita que toda a sua equipa atenda no mesmo número de WhatsApp, com atribuição automática de conversas."
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <BarChart3 />,
import.meta.env.VITE_API_URL     title: "Analytics Avançado",
import.meta.env.VITE_API_URL     desc: "Relatórios detalhados sobre tempo de resposta, volume de mensagens e desempenho da equipa."
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Layers />,
import.meta.env.VITE_API_URL     title: "Departamentos",
import.meta.env.VITE_API_URL     desc: "Organize o seu atendimento por áreas (ex: Financeiro, Suporte, Vendas) para um fluxo de trabalho mais limpo."
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Search />,
import.meta.env.VITE_API_URL     title: "Histórico Completo",
import.meta.env.VITE_API_URL     desc: "Pesquise em todas as conversas passadas e nunca perca o contexto de um pedido de um cidadão ou cliente."
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Settings />,
import.meta.env.VITE_API_URL     title: "API & Webhooks",
import.meta.env.VITE_API_URL     desc: "Ligue o TrataTudo ao seu ecossistema de software atual de forma simples e segura."
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Features() {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="pt-32 pb-24">
import.meta.env.VITE_API_URL       <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL         <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
import.meta.env.VITE_API_URL           <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Funcionalidades Poderosas</h1>
import.meta.env.VITE_API_URL           <p className="text-xl text-slate-600">Desenhadas para tornar a comunicação da sua organização mais eficiente e humana.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
import.meta.env.VITE_API_URL           {features.map((feat, i) => (
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               key={i}
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: i * 0.1 }}
import.meta.env.VITE_API_URL               className="group"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
import.meta.env.VITE_API_URL                 {React.cloneElement(feat.icon as React.ReactElement, { className: "w-8 h-8" } as any)}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <h3 className="text-2xl font-bold text-slate-900 mb-4">{feat.title}</h3>
import.meta.env.VITE_API_URL               <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="mt-32 bg-slate-900 rounded-[3rem] p-8 lg:p-20 text-white overflow-hidden relative">
import.meta.env.VITE_API_URL           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
import.meta.env.VITE_API_URL           <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
import.meta.env.VITE_API_URL             <div className="lg:w-1/2 space-y-8">
import.meta.env.VITE_API_URL               <h2 className="text-3xl lg:text-5xl font-display font-bold">Segurança e Privacidade em primeiro lugar</h2>
import.meta.env.VITE_API_URL               <p className="text-slate-400 text-lg leading-relaxed">
import.meta.env.VITE_API_URL                 Sabemos que a confiança é a base de qualquer organização. Por isso, o TrataTudo foi construído com os mais altos padrões de segurança.
import.meta.env.VITE_API_URL               </p>
import.meta.env.VITE_API_URL               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <ShieldCheck className="text-primary w-6 h-6" />
import.meta.env.VITE_API_URL                   <span className="font-bold">RGPD Compliant</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <ShieldCheck className="text-primary w-6 h-6" />
import.meta.env.VITE_API_URL                   <span className="font-bold">Encriptação SSL</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <ShieldCheck className="text-primary w-6 h-6" />
import.meta.env.VITE_API_URL                   <span className="font-bold">Backups Diários</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL                   <ShieldCheck className="text-primary w-6 h-6" />
import.meta.env.VITE_API_URL                   <span className="font-bold">Acesso Seguro</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="lg:w-1/2">
import.meta.env.VITE_API_URL               <img 
import.meta.env.VITE_API_URL                 src="https://picsum.photos/seed/security/800/600" 
import.meta.env.VITE_API_URL                 alt="Segurança TrataTudo" 
import.meta.env.VITE_API_URL                 className="rounded-2xl shadow-2xl border border-white/10"
import.meta.env.VITE_API_URL                 referrerPolicy="no-referrer"
import.meta.env.VITE_API_URL               />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
