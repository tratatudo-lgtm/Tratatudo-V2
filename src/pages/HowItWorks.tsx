import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   Scan, 
import.meta.env.VITE_API_URL   Settings2, 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   ArrowRight,
import.meta.env.VITE_API_URL   CheckCircle2,
import.meta.env.VITE_API_URL   PlayCircle
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { Link } from 'react-router-dom';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const steps = [
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Scan />,
import.meta.env.VITE_API_URL     title: "1. Conexão Instantânea",
import.meta.env.VITE_API_URL     desc: "Basta fazer scan do QR Code com o seu telemóvel para ligar o seu número de WhatsApp ao TrataTudo. Sem configurações técnicas complexas.",
import.meta.env.VITE_API_URL     image: "https://images.unsplash.com/photo-1556742049-02e53f40d997?auto=format&fit=crop&q=80&w=600&h=400"
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Settings2 />,
import.meta.env.VITE_API_URL     title: "2. Personalização do Fluxo",
import.meta.env.VITE_API_URL     desc: "Defina as suas mensagens de boas-vindas, horários de funcionamento e crie menus de opções para os seus utilizadores.",
import.meta.env.VITE_API_URL     image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=400"
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <MessageSquare />,
import.meta.env.VITE_API_URL     title: "3. Gestão Centralizada",
import.meta.env.VITE_API_URL     desc: "As mensagens começam a cair no seu painel. A sua equipa pode responder manualmente ou deixar a automação tratar do trabalho pesado.",
import.meta.env.VITE_API_URL     image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600&h=400"
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function HowItWorks() {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="pt-32 pb-24">
import.meta.env.VITE_API_URL       <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL         <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
import.meta.env.VITE_API_URL           <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Como funciona</h1>
import.meta.env.VITE_API_URL           <p className="text-xl text-slate-600">Uma plataforma intuitiva que não requer conhecimentos técnicos para ser operada.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="space-y-32 max-w-6xl mx-auto">
import.meta.env.VITE_API_URL           {steps.map((step, i) => (
import.meta.env.VITE_API_URL             <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
import.meta.env.VITE_API_URL               <motion.div 
import.meta.env.VITE_API_URL                 initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
import.meta.env.VITE_API_URL                 whileInView={{ opacity: 1, x: 0 }}
import.meta.env.VITE_API_URL                 viewport={{ once: true }}
import.meta.env.VITE_API_URL                 className="lg:w-1/2 space-y-6"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6">
import.meta.env.VITE_API_URL                   {React.cloneElement(step.icon as React.ReactElement, { className: "w-8 h-8" } as any)}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900">{step.title}</h2>
import.meta.env.VITE_API_URL                 <p className="text-slate-600 text-lg leading-relaxed">{step.desc}</p>
import.meta.env.VITE_API_URL                 <ul className="space-y-3 pt-4">
import.meta.env.VITE_API_URL                   <li className="flex items-center gap-3 text-slate-700">
import.meta.env.VITE_API_URL                     <CheckCircle2 className="text-primary w-5 h-5" />
import.meta.env.VITE_API_URL                     <span>Configuração em menos de 5 minutos</span>
import.meta.env.VITE_API_URL                   </li>
import.meta.env.VITE_API_URL                   <li className="flex items-center gap-3 text-slate-700">
import.meta.env.VITE_API_URL                     <CheckCircle2 className="text-primary w-5 h-5" />
import.meta.env.VITE_API_URL                     <span>Interface totalmente em Português</span>
import.meta.env.VITE_API_URL                   </li>
import.meta.env.VITE_API_URL                 </ul>
import.meta.env.VITE_API_URL               </motion.div>
import.meta.env.VITE_API_URL               <motion.div 
import.meta.env.VITE_API_URL                 initial={{ opacity: 0, scale: 0.9 }}
import.meta.env.VITE_API_URL                 whileInView={{ opacity: 1, scale: 1 }}
import.meta.env.VITE_API_URL                 viewport={{ once: true }}
import.meta.env.VITE_API_URL                 className="lg:w-1/2 relative"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10" />
import.meta.env.VITE_API_URL                 <img 
import.meta.env.VITE_API_URL                   src={step.image} 
import.meta.env.VITE_API_URL                   alt={step.title} 
import.meta.env.VITE_API_URL                   className="rounded-3xl shadow-2xl border border-slate-100"
import.meta.env.VITE_API_URL                   referrerPolicy="no-referrer"
import.meta.env.VITE_API_URL                 />
import.meta.env.VITE_API_URL               </motion.div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="mt-32 text-center space-y-8">
import.meta.env.VITE_API_URL           <h3 className="text-3xl font-display font-bold text-slate-900">Quer ver em ação?</h3>
import.meta.env.VITE_API_URL           <Link 
import.meta.env.VITE_API_URL             to="/contacto"
import.meta.env.VITE_API_URL             className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             <PlayCircle className="w-6 h-6" /> Assistir Demonstração
import.meta.env.VITE_API_URL           </Link>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
