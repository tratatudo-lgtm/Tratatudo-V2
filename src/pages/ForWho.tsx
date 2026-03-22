import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { Building2, Store, Users, HeartHandshake, ArrowRight } from 'lucide-react';
import.meta.env.VITE_API_URL import { Link } from 'react-router-dom';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const sectors = [
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Building2 />,
import.meta.env.VITE_API_URL     title: "Câmaras e Juntas",
import.meta.env.VITE_API_URL     desc: "Aproxime a governação dos cidadãos. Permita o reporte de ocorrências, agendamento de serviços e consulta de processos via WhatsApp.",
import.meta.env.VITE_API_URL     features: ["Reporte de Ocorrências", "Agendamento de Atendimento", "Informações de Freguesia"]
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Store />,
import.meta.env.VITE_API_URL     title: "Comércio e Retalho",
import.meta.env.VITE_API_URL     desc: "Automatize pedidos, envie atualizações de stock e ofereça um suporte pós-venda rápido que fideliza os seus clientes.",
import.meta.env.VITE_API_URL     features: ["Catálogo Automático", "Status de Encomenda", "Suporte Pós-Venda"]
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <HeartHandshake />,
import.meta.env.VITE_API_URL     title: "Serviços e Clínicas",
import.meta.env.VITE_API_URL     desc: "Gira marcações, envie lembretes automáticos e responda a dúvidas sobre serviços de forma organizada.",
import.meta.env.VITE_API_URL     features: ["Lembretes de Marcação", "Esclarecimento de Serviços", "Gestão de Agenda"]
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     icon: <Users />,
import.meta.env.VITE_API_URL     title: "Associações e Clubes",
import.meta.env.VITE_API_URL     desc: "Mantenha os seus sócios informados, gira quotas e automatize a inscrição em eventos ou atividades.",
import.meta.env.VITE_API_URL     features: ["Comunicação com Sócios", "Inscrição em Eventos", "Gestão de Quotas"]
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function ForWho() {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="pt-32 pb-24">
import.meta.env.VITE_API_URL       <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL         <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
import.meta.env.VITE_API_URL           <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Para quem é o TrataTudo?</h1>
import.meta.env.VITE_API_URL           <p className="text-xl text-slate-600">Soluções versáteis que se adaptam a qualquer tipo de organização que valorize a comunicação.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
import.meta.env.VITE_API_URL           {sectors.map((sector, i) => (
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               key={i}
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: i * 0.1 }}
import.meta.env.VITE_API_URL               className="bg-white p-10 rounded-[2.5rem] border border-slate-200 hover:border-primary/30 hover:shadow-2xl transition-all group"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
import.meta.env.VITE_API_URL                 {React.cloneElement(sector.icon as React.ReactElement, { className: "w-8 h-8" } as any)}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <h3 className="text-2xl font-bold text-slate-900 mb-4">{sector.title}</h3>
import.meta.env.VITE_API_URL               <p className="text-slate-600 mb-8 leading-relaxed">{sector.desc}</p>
import.meta.env.VITE_API_URL               <div className="space-y-3">
import.meta.env.VITE_API_URL                 {sector.features.map((feat, j) => (
import.meta.env.VITE_API_URL                   <div key={j} className="flex items-center gap-3 text-sm font-medium text-slate-700">
import.meta.env.VITE_API_URL                     <div className="w-1.5 h-1.5 rounded-full bg-primary" />
import.meta.env.VITE_API_URL                     {feat}
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 ))}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="mt-32 bg-primary/5 rounded-[3rem] p-12 lg:p-24 text-center">
import.meta.env.VITE_API_URL           <h2 className="text-3xl lg:text-5xl font-display font-bold text-slate-900 mb-8">Não encontrou o seu setor?</h2>
import.meta.env.VITE_API_URL           <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
import.meta.env.VITE_API_URL             O TrataTudo é altamente flexível. Fale connosco para percebermos como podemos adaptar a plataforma às suas necessidades específicas.
import.meta.env.VITE_API_URL           </p>
import.meta.env.VITE_API_URL           <Link
import.meta.env.VITE_API_URL             to="/contacto"
import.meta.env.VITE_API_URL             className="inline-flex items-center gap-2 bg-primary text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             Falar com um Especialista <ArrowRight className="w-6 h-6" />
import.meta.env.VITE_API_URL           </Link>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
