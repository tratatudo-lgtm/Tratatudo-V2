import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   ArrowRight, 
import.meta.env.VITE_API_URL   CheckCircle2, 
import.meta.env.VITE_API_URL   MessageCircle, 
import.meta.env.VITE_API_URL   ShieldCheck, 
import.meta.env.VITE_API_URL   Zap, 
import.meta.env.VITE_API_URL   BarChart3, 
import.meta.env.VITE_API_URL   Users, 
import.meta.env.VITE_API_URL   Building2, 
import.meta.env.VITE_API_URL   Clock,
import.meta.env.VITE_API_URL   Smartphone
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { Link } from 'react-router-dom';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const fadeIn = {
import.meta.env.VITE_API_URL   initial: { opacity: 0, y: 20 },
import.meta.env.VITE_API_URL   whileInView: { opacity: 1, y: 0 },
import.meta.env.VITE_API_URL   viewport: { once: true },
import.meta.env.VITE_API_URL   transition: { duration: 0.5 }
import.meta.env.VITE_API_URL };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Home() {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="overflow-hidden">
import.meta.env.VITE_API_URL       {/* Hero Section */}
import.meta.env.VITE_API_URL       <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
import.meta.env.VITE_API_URL         <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,rgba(37,99,235,0.08)_0%,transparent_100%)]" />
import.meta.env.VITE_API_URL         <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL           <div className="max-w-4xl mx-auto text-center space-y-8">
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               initial={{ opacity: 0, scale: 0.9 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, scale: 1 }}
import.meta.env.VITE_API_URL               transition={{ duration: 0.5 }}
import.meta.env.VITE_API_URL               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <Zap className="w-4 h-4" />
import.meta.env.VITE_API_URL               <span>Nova versão 2.0 disponível</span>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             <motion.h1 
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: 0.1, duration: 0.6 }}
import.meta.env.VITE_API_URL               className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 leading-[1.1]"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               Automatize o atendimento da sua organização no <span className="text-primary">WhatsApp</span>
import.meta.env.VITE_API_URL             </motion.h1>
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             <motion.p 
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: 0.2, duration: 0.6 }}
import.meta.env.VITE_API_URL               className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               A plataforma híbrida que permite responder automaticamente a cidadãos e clientes, gerir pedidos e acompanhar comunicações num único painel simples.
import.meta.env.VITE_API_URL             </motion.p>
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: 0.3, duration: 0.6 }}
import.meta.env.VITE_API_URL               className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <Link
import.meta.env.VITE_API_URL                 to="/experimentar"
import.meta.env.VITE_API_URL                 className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 Experimentar Grátis
import.meta.env.VITE_API_URL                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL               <Link
import.meta.env.VITE_API_URL                 to="/login"
import.meta.env.VITE_API_URL                 className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 Entrar no painel
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 40 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: 0.5, duration: 0.8 }}
import.meta.env.VITE_API_URL               className="pt-16 relative"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10" />
import.meta.env.VITE_API_URL               <img 
import.meta.env.VITE_API_URL                 src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=800" 
import.meta.env.VITE_API_URL                 alt="Dashboard TrataTudo" 
import.meta.env.VITE_API_URL                 className="rounded-2xl shadow-2xl border border-slate-200 mx-auto"
import.meta.env.VITE_API_URL                 referrerPolicy="no-referrer"
import.meta.env.VITE_API_URL               />
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Funcionalidades */}
import.meta.env.VITE_API_URL       <section id="funcionalidades" className="py-24 bg-slate-50">
import.meta.env.VITE_API_URL         <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL           <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
import.meta.env.VITE_API_URL             <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Funcionalidades</h2>
import.meta.env.VITE_API_URL             <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Tudo o que precisa para um atendimento de excelência</h3>
import.meta.env.VITE_API_URL             <p className="text-slate-600 text-lg">Ferramentas poderosas desenhadas para simplificar a comunicação e aumentar a produtividade.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
import.meta.env.VITE_API_URL             {[
import.meta.env.VITE_API_URL               {
import.meta.env.VITE_API_URL                 icon: <MessageCircle className="w-8 h-8" />,
import.meta.env.VITE_API_URL                 title: "Respostas Automáticas",
import.meta.env.VITE_API_URL                 desc: "Configure chatbots inteligentes que respondem instantaneamente às dúvidas mais comuns 24/7."
import.meta.env.VITE_API_URL               },
import.meta.env.VITE_API_URL               {
import.meta.env.VITE_API_URL                 icon: <BarChart3 className="w-8 h-8" />,
import.meta.env.VITE_API_URL                 title: "Gestão de Pedidos",
import.meta.env.VITE_API_URL                 desc: "Transforme mensagens em tickets e acompanhe o estado de cada reclamação ou pedido."
import.meta.env.VITE_API_URL               },
import.meta.env.VITE_API_URL               {
import.meta.env.VITE_API_URL                 icon: <Users className="w-8 h-8" />,
import.meta.env.VITE_API_URL                 title: "Multi-agente",
import.meta.env.VITE_API_URL                 desc: "Vários operadores podem gerir a mesma conta de WhatsApp de forma organizada e transparente."
import.meta.env.VITE_API_URL               },
import.meta.env.VITE_API_URL               {
import.meta.env.VITE_API_URL                 icon: <ShieldCheck className="w-8 h-8" />,
import.meta.env.VITE_API_URL                 title: "Segurança de Dados",
import.meta.env.VITE_API_URL                 desc: "Conformidade total com o RGPD e encriptação de ponta a ponta em todas as comunicações."
import.meta.env.VITE_API_URL               },
import.meta.env.VITE_API_URL               {
import.meta.env.VITE_API_URL                 icon: <Smartphone className="w-8 h-8" />,
import.meta.env.VITE_API_URL                 title: "Interface Mobile",
import.meta.env.VITE_API_URL                 desc: "Gira a sua organização a partir de qualquer lugar com a nossa interface totalmente responsiva."
import.meta.env.VITE_API_URL               },
import.meta.env.VITE_API_URL               {
import.meta.env.VITE_API_URL                 icon: <Zap className="w-8 h-8" />,
import.meta.env.VITE_API_URL                 title: "Integrações",
import.meta.env.VITE_API_URL                 desc: "Ligue o TrataTudo ao seu CRM ou software de gestão atual através da nossa API robusta."
import.meta.env.VITE_API_URL               }
import.meta.env.VITE_API_URL             ].map((feat, i) => (
import.meta.env.VITE_API_URL               <motion.div
import.meta.env.VITE_API_URL                 key={i}
import.meta.env.VITE_API_URL                 {...fadeIn}
import.meta.env.VITE_API_URL                 transition={{ delay: i * 0.1 }}
import.meta.env.VITE_API_URL                 className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all group"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
import.meta.env.VITE_API_URL                   {feat.icon}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <h4 className="text-xl font-bold text-slate-900 mb-4">{feat.title}</h4>
import.meta.env.VITE_API_URL                 <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
import.meta.env.VITE_API_URL               </motion.div>
import.meta.env.VITE_API_URL             ))}
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Como Funciona */}
import.meta.env.VITE_API_URL       <section id="como-funciona" className="py-24">
import.meta.env.VITE_API_URL         <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL           <div className="flex flex-col lg:flex-row items-center gap-16">
import.meta.env.VITE_API_URL             <div className="lg:w-1/2 space-y-8">
import.meta.env.VITE_API_URL               <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Como funciona</h2>
import.meta.env.VITE_API_URL               <h3 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight">Implementação rápida em 3 passos simples</h3>
import.meta.env.VITE_API_URL               
import.meta.env.VITE_API_URL               <div className="space-y-8">
import.meta.env.VITE_API_URL                 {[
import.meta.env.VITE_API_URL                   { step: "01", title: "Conecte o seu número", desc: "Faça scan do QR Code e ligue o seu número oficial de WhatsApp à plataforma em segundos." },
import.meta.env.VITE_API_URL                   { step: "02", title: "Configure a automação", desc: "Defina fluxos de resposta, horários de atendimento e atribua equipas aos departamentos." },
import.meta.env.VITE_API_URL                   { step: "03", title: "Comece a atender", desc: "Acompanhe tudo em tempo real através do painel de controlo e melhore a satisfação dos cidadãos." }
import.meta.env.VITE_API_URL                 ].map((item, i) => (
import.meta.env.VITE_API_URL                   <div key={i} className="flex gap-6">
import.meta.env.VITE_API_URL                     <div className="text-4xl font-display font-black text-primary/20">{item.step}</div>
import.meta.env.VITE_API_URL                     <div>
import.meta.env.VITE_API_URL                       <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
import.meta.env.VITE_API_URL                       <p className="text-slate-600">{item.desc}</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 ))}
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="lg:w-1/2 relative">
import.meta.env.VITE_API_URL               <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full -z-10" />
import.meta.env.VITE_API_URL               <img 
import.meta.env.VITE_API_URL                 src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=800&h=1000" 
import.meta.env.VITE_API_URL                 alt="Processo TrataTudo" 
import.meta.env.VITE_API_URL                 className="rounded-3xl shadow-2xl"
import.meta.env.VITE_API_URL                 referrerPolicy="no-referrer"
import.meta.env.VITE_API_URL               />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Para Quem É */}
import.meta.env.VITE_API_URL       <section id="para-quem" className="py-24 bg-slate-900 text-white">
import.meta.env.VITE_API_URL         <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL           <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
import.meta.env.VITE_API_URL             <h2 className="text-primary font-bold uppercase tracking-widest text-sm">Para quem é</h2>
import.meta.env.VITE_API_URL             <h3 className="text-4xl lg:text-5xl font-display font-bold">Soluções adaptadas a cada necessidade</h3>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               {...fadeIn}
import.meta.env.VITE_API_URL               className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <Building2 className="w-12 h-12 text-primary mb-6" />
import.meta.env.VITE_API_URL               <h4 className="text-2xl font-bold mb-4">Setor Público</h4>
import.meta.env.VITE_API_URL               <p className="text-slate-400 mb-8 leading-relaxed">
import.meta.env.VITE_API_URL                 Câmaras Municipais, Juntas de Freguesia e Instituições Públicas que precisam de aproximar os serviços dos cidadãos e gerir ocorrências de forma eficiente.
import.meta.env.VITE_API_URL               </p>
import.meta.env.VITE_API_URL               <ul className="space-y-3">
import.meta.env.VITE_API_URL                 {["Reporte de avarias", "Agendamento de serviços", "Informações úteis", "Consultas de processos"].map((item, i) => (
import.meta.env.VITE_API_URL                   <li key={i} className="flex items-center gap-3 text-sm">
import.meta.env.VITE_API_URL                     <CheckCircle2 className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL                     {item}
import.meta.env.VITE_API_URL                   </li>
import.meta.env.VITE_API_URL                 ))}
import.meta.env.VITE_API_URL               </ul>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <motion.div 
import.meta.env.VITE_API_URL               {...fadeIn}
import.meta.env.VITE_API_URL               transition={{ delay: 0.2 }}
import.meta.env.VITE_API_URL               className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <Zap className="w-12 h-12 text-primary mb-6" />
import.meta.env.VITE_API_URL               <h4 className="text-2xl font-bold mb-4">Setor Privado</h4>
import.meta.env.VITE_API_URL               <p className="text-slate-400 mb-8 leading-relaxed">
import.meta.env.VITE_API_URL                 Empresas de serviços, retalho e suporte que pretendem automatizar vendas, gerir reclamações e oferecer um suporte premium via WhatsApp.
import.meta.env.VITE_API_URL               </p>
import.meta.env.VITE_API_URL               <ul className="space-y-3">
import.meta.env.VITE_API_URL                 {["Vendas automáticas", "Suporte ao cliente", "Gestão de encomendas", "Fidelização"].map((item, i) => (
import.meta.env.VITE_API_URL                   <li key={i} className="flex items-center gap-3 text-sm">
import.meta.env.VITE_API_URL                     <CheckCircle2 className="w-5 h-5 text-primary" />
import.meta.env.VITE_API_URL                     {item}
import.meta.env.VITE_API_URL                   </li>
import.meta.env.VITE_API_URL                 ))}
import.meta.env.VITE_API_URL               </ul>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Benefícios */}
import.meta.env.VITE_API_URL       <section className="py-24">
import.meta.env.VITE_API_URL         <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
import.meta.env.VITE_API_URL             <div className="lg:col-span-1 space-y-6">
import.meta.env.VITE_API_URL               <h3 className="text-4xl font-display font-bold text-slate-900">Porquê escolher o TrataTudo?</h3>
import.meta.env.VITE_API_URL               <p className="text-slate-600 text-lg">Não somos apenas mais um chatbot. Somos o parceiro estratégico da sua comunicação.</p>
import.meta.env.VITE_API_URL               <Link to="/experimentar" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
import.meta.env.VITE_API_URL                 Ver todos os benefícios <ArrowRight className="w-4 h-4" />
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
import.meta.env.VITE_API_URL               {[
import.meta.env.VITE_API_URL                 { icon: <Clock />, title: "Redução de 70% no tempo de espera", desc: "Respostas imediatas que aumentam a satisfação." },
import.meta.env.VITE_API_URL                 { icon: <Users />, title: "Equipas mais produtivas", desc: "Foco no que realmente importa, automação no resto." },
import.meta.env.VITE_API_URL                 { icon: <BarChart3 />, title: "Métricas em tempo real", desc: "Saiba exatamente o que os seus clientes precisam." },
import.meta.env.VITE_API_URL                 { icon: <ShieldCheck />, title: "Conformidade Total", desc: "Segurança máxima para os seus dados e dos seus clientes." }
import.meta.env.VITE_API_URL               ].map((item, i) => (
import.meta.env.VITE_API_URL                 <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
import.meta.env.VITE_API_URL                   <div className="text-primary mb-4">{item.icon}</div>
import.meta.env.VITE_API_URL                   <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
import.meta.env.VITE_API_URL                   <p className="text-sm text-slate-600">{item.desc}</p>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               ))}
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </section>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* CTA Final */}
import.meta.env.VITE_API_URL       <section className="py-24">
import.meta.env.VITE_API_URL         <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL           <div className="bg-primary rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
import.meta.env.VITE_API_URL             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
import.meta.env.VITE_API_URL             <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
import.meta.env.VITE_API_URL             
import.meta.env.VITE_API_URL             <div className="relative z-10 max-w-3xl mx-auto space-y-8">
import.meta.env.VITE_API_URL               <h2 className="text-4xl lg:text-6xl font-display font-extrabold">Pronto para transformar o seu atendimento?</h2>
import.meta.env.VITE_API_URL               <p className="text-xl text-white/80">Junte-se a centenas de organizações que já utilizam o TrataTudo para comunicar melhor.</p>
import.meta.env.VITE_API_URL               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
import.meta.env.VITE_API_URL                 <Link
import.meta.env.VITE_API_URL                   to="/experimentar"
import.meta.env.VITE_API_URL                   className="w-full sm:w-auto bg-white text-primary px-10 py-5 rounded-full text-xl font-bold hover:bg-slate-50 transition-all shadow-2xl"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Começar Agora Grátis
import.meta.env.VITE_API_URL                 </Link>
import.meta.env.VITE_API_URL                 <Link
import.meta.env.VITE_API_URL                   to="/contacto"
import.meta.env.VITE_API_URL                   className="w-full sm:w-auto bg-primary-dark text-white border border-white/20 px-10 py-5 rounded-full text-xl font-bold hover:bg-primary/80 transition-all"
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   Falar com um especialista
import.meta.env.VITE_API_URL                 </Link>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <p className="text-sm text-white/60">Sem cartão de crédito necessário. Teste grátis por 14 dias.</p>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </section>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
