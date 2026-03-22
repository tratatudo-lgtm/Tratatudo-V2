import.meta.env.VITE_API_URL import React, { useState } from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { Check, Zap, Shield, Users, Loader2 } from 'lucide-react';
import.meta.env.VITE_API_URL import { Link, useNavigate } from 'react-router-dom';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const plans = [
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     id: "starter",
import.meta.env.VITE_API_URL     name: "Starter",
import.meta.env.VITE_API_URL     price: "49",
import.meta.env.VITE_API_URL     desc: "Ideal para pequenas juntas ou negócios locais.",
import.meta.env.VITE_API_URL     features: ["1 Número de WhatsApp", "3 Agentes", "Automação Básica", "Suporte via Email"],
import.meta.env.VITE_API_URL     cta: "Começar Agora",
import.meta.env.VITE_API_URL     popular: false
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     id: "pro",
import.meta.env.VITE_API_URL     name: "Profissional",
import.meta.env.VITE_API_URL     price: "99",
import.meta.env.VITE_API_URL     desc: "A escolha perfeita para organizações em crescimento.",
import.meta.env.VITE_API_URL     features: ["2 Números de WhatsApp", "10 Agentes", "Automação Avançada", "Relatórios Detalhados", "Suporte Prioritário"],
import.meta.env.VITE_API_URL     cta: "Escolher Plano",
import.meta.env.VITE_API_URL     popular: true
import.meta.env.VITE_API_URL   },
import.meta.env.VITE_API_URL   {
import.meta.env.VITE_API_URL     id: "enterprise",
import.meta.env.VITE_API_URL     name: "Enterprise",
import.meta.env.VITE_API_URL     price: "Custom",
import.meta.env.VITE_API_URL     desc: "Soluções à medida para grandes instituições.",
import.meta.env.VITE_API_URL     features: ["Números Ilimitados", "Agentes Ilimitados", "API Dedicada", "Gestor de Conta", "SLA Garantido"],
import.meta.env.VITE_API_URL     cta: "Contactar Vendas",
import.meta.env.VITE_API_URL     popular: false
import.meta.env.VITE_API_URL   }
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Pricing() {
import.meta.env.VITE_API_URL   const [loading, setLoading] = useState<string | null>(null);
import.meta.env.VITE_API_URL   const navigate = useNavigate();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleCheckout = async (planId: string) => {
import.meta.env.VITE_API_URL     if (planId === "enterprise") {
import.meta.env.VITE_API_URL       navigate("/contacto");
import.meta.env.VITE_API_URL       return;
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL     setLoading(planId);
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       const response = await fetch('/api/client/stripe/checkout', {
import.meta.env.VITE_API_URL         method: 'POST',
import.meta.env.VITE_API_URL         headers: { 'Content-Type': 'application/json' },
import.meta.env.VITE_API_URL         body: JSON.stringify({ planId })
import.meta.env.VITE_API_URL       });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       if (response.status === 401) {
import.meta.env.VITE_API_URL         navigate("/login");
import.meta.env.VITE_API_URL         return;
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       const data = await response.json();
import.meta.env.VITE_API_URL       if (data.url) {
import.meta.env.VITE_API_URL         window.location.href = data.url;
import.meta.env.VITE_API_URL       } else {
import.meta.env.VITE_API_URL         throw new Error(data.error || 'Erro ao iniciar checkout');
import.meta.env.VITE_API_URL       }
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       console.error('Checkout error:', error);
import.meta.env.VITE_API_URL       alert('Erro ao iniciar o pagamento. Por favor, tente novamente.');
import.meta.env.VITE_API_URL     } finally {
import.meta.env.VITE_API_URL       setLoading(null);
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="pt-32 pb-24">
import.meta.env.VITE_API_URL       <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL         <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
import.meta.env.VITE_API_URL           <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Preços simples e transparentes</h1>
import.meta.env.VITE_API_URL           <p className="text-xl text-slate-600">Escolha o plano que melhor se adapta à sua organização. Sem taxas ocultas.</p>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
import.meta.env.VITE_API_URL           {plans.map((plan, i) => (
import.meta.env.VITE_API_URL             <motion.div
import.meta.env.VITE_API_URL               key={i}
import.meta.env.VITE_API_URL               initial={{ opacity: 0, y: 20 }}
import.meta.env.VITE_API_URL               animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL               transition={{ delay: i * 0.1 }}
import.meta.env.VITE_API_URL               className={`relative p-8 rounded-[2.5rem] border ${plan.popular ? 'border-primary bg-white shadow-2xl scale-105 z-10' : 'border-slate-200 bg-slate-50'}`}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {plan.popular && (
import.meta.env.VITE_API_URL                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
import.meta.env.VITE_API_URL                   Mais Popular
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL               
import.meta.env.VITE_API_URL               <div className="mb-8">
import.meta.env.VITE_API_URL                 <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
import.meta.env.VITE_API_URL                 <p className="text-slate-500 text-sm">{plan.desc}</p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="mb-8">
import.meta.env.VITE_API_URL                 <div className="flex items-baseline gap-1">
import.meta.env.VITE_API_URL                   <span className="text-4xl font-display font-black text-slate-900">
import.meta.env.VITE_API_URL                     {plan.price === "Custom" ? "" : "€"}
import.meta.env.VITE_API_URL                     {plan.price}
import.meta.env.VITE_API_URL                   </span>
import.meta.env.VITE_API_URL                   {plan.price !== "Custom" && <span className="text-slate-500">/mês</span>}
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <ul className="space-y-4 mb-8">
import.meta.env.VITE_API_URL                 {plan.features.map((feat, j) => (
import.meta.env.VITE_API_URL                   <li key={j} className="flex items-center gap-3 text-sm text-slate-600">
import.meta.env.VITE_API_URL                     <Check className="w-5 h-5 text-primary shrink-0" />
import.meta.env.VITE_API_URL                     {feat}
import.meta.env.VITE_API_URL                   </li>
import.meta.env.VITE_API_URL                 ))}
import.meta.env.VITE_API_URL               </ul>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <button
import.meta.env.VITE_API_URL                 onClick={() => handleCheckout(plan.id)}
import.meta.env.VITE_API_URL                 disabled={loading !== null}
import.meta.env.VITE_API_URL                 className={`w-full py-4 rounded-2xl font-bold text-center block transition-all flex items-center justify-center gap-2 ${
import.meta.env.VITE_API_URL                   plan.popular 
import.meta.env.VITE_API_URL                     ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' 
import.meta.env.VITE_API_URL                     : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
import.meta.env.VITE_API_URL                 } disabled:opacity-50 disabled:cursor-not-allowed`}
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 {loading === plan.id ? (
import.meta.env.VITE_API_URL                   <Loader2 className="w-5 h-5 animate-spin" />
import.meta.env.VITE_API_URL                 ) : (
import.meta.env.VITE_API_URL                   plan.cta
import.meta.env.VITE_API_URL                 )}
import.meta.env.VITE_API_URL               </button>
import.meta.env.VITE_API_URL             </motion.div>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
import.meta.env.VITE_API_URL           <div className="space-y-4">
import.meta.env.VITE_API_URL             <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mx-auto">
import.meta.env.VITE_API_URL               <Zap className="w-6 h-6" />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <h4 className="font-bold text-slate-900">Ativação Instantânea</h4>
import.meta.env.VITE_API_URL             <p className="text-sm text-slate-500">Comece a atender em menos de 5 minutos após o registo.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div className="space-y-4">
import.meta.env.VITE_API_URL             <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mx-auto">
import.meta.env.VITE_API_URL               <Shield className="w-6 h-6" />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <h4 className="font-bold text-slate-900">Sem Fidelização</h4>
import.meta.env.VITE_API_URL             <p className="text-sm text-slate-500">Cancele ou altere o seu plano a qualquer momento sem custos.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <div className="space-y-4">
import.meta.env.VITE_API_URL             <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mx-auto">
import.meta.env.VITE_API_URL               <Users className="w-6 h-6" />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL             <h4 className="font-bold text-slate-900">Suporte Local</h4>
import.meta.env.VITE_API_URL             <p className="text-sm text-slate-500">Equipa técnica em Portugal pronta para ajudar a sua organização.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
