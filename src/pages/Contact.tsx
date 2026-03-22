import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { motion } from 'motion/react';
import.meta.env.VITE_API_URL import { Mail, Phone, MapPin, Send } from 'lucide-react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Contact() {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="pt-32 pb-24">
import.meta.env.VITE_API_URL       <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL         <div className="max-w-5xl mx-auto">
import.meta.env.VITE_API_URL           <div className="text-center mb-16 space-y-4">
import.meta.env.VITE_API_URL             <h1 className="text-4xl lg:text-6xl font-display font-bold text-slate-900">Entre em contacto</h1>
import.meta.env.VITE_API_URL             <p className="text-xl text-slate-600 max-w-2xl mx-auto">Estamos aqui para ajudar a sua organização a dar o próximo passo na comunicação digital.</p>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
import.meta.env.VITE_API_URL             <div className="lg:col-span-1 space-y-8">
import.meta.env.VITE_API_URL               <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
import.meta.env.VITE_API_URL                 <h3 className="text-xl font-bold text-slate-900">Informações de Contacto</h3>
import.meta.env.VITE_API_URL                 <div className="space-y-4">
import.meta.env.VITE_API_URL                   <div className="flex items-start gap-4">
import.meta.env.VITE_API_URL                     <div className="bg-primary/10 p-3 rounded-xl text-primary">
import.meta.env.VITE_API_URL                       <Mail className="w-6 h-6" />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <div>
import.meta.env.VITE_API_URL                       <p className="text-sm font-bold text-slate-900">Email</p>
import.meta.env.VITE_API_URL                       <p className="text-slate-600">geral@tratatudo.pt</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="flex items-start gap-4">
import.meta.env.VITE_API_URL                     <div className="bg-primary/10 p-3 rounded-xl text-primary">
import.meta.env.VITE_API_URL                       <Phone className="w-6 h-6" />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <div>
import.meta.env.VITE_API_URL                       <p className="text-sm font-bold text-slate-900">Telefone</p>
import.meta.env.VITE_API_URL                       <p className="text-slate-600">+351 937 230 116</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="flex items-start gap-4">
import.meta.env.VITE_API_URL                     <div className="bg-primary/10 p-3 rounded-xl text-primary">
import.meta.env.VITE_API_URL                       <MapPin className="w-6 h-6" />
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                     <div>
import.meta.env.VITE_API_URL                       <p className="text-sm font-bold text-slate-900">Escritório</p>
import.meta.env.VITE_API_URL                       <p className="text-slate-600">Valença, Portugal</p>
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL               <div className="p-8 rounded-3xl bg-primary text-white">
import.meta.env.VITE_API_URL                 <h3 className="text-xl font-bold mb-4">Suporte 24/7</h3>
import.meta.env.VITE_API_URL                 <p className="text-white/80 text-sm leading-relaxed">
import.meta.env.VITE_API_URL                   Os nossos clientes têm acesso a uma linha de suporte prioritária via WhatsApp para qualquer emergência.
import.meta.env.VITE_API_URL                 </p>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL             <div className="lg:col-span-2">
import.meta.env.VITE_API_URL               <form className="bg-white p-8 lg:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6">
import.meta.env.VITE_API_URL                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
import.meta.env.VITE_API_URL                   <div className="space-y-2">
import.meta.env.VITE_API_URL                     <label className="text-sm font-bold text-slate-900">Nome Completo</label>
import.meta.env.VITE_API_URL                     <input 
import.meta.env.VITE_API_URL                       type="text" 
import.meta.env.VITE_API_URL                       placeholder="Ex: João Silva"
import.meta.env.VITE_API_URL                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
import.meta.env.VITE_API_URL                     />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                   <div className="space-y-2">
import.meta.env.VITE_API_URL                     <label className="text-sm font-bold text-slate-900">Email Profissional</label>
import.meta.env.VITE_API_URL                     <input 
import.meta.env.VITE_API_URL                       type="email" 
import.meta.env.VITE_API_URL                       placeholder="joao@empresa.pt"
import.meta.env.VITE_API_URL                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
import.meta.env.VITE_API_URL                     />
import.meta.env.VITE_API_URL                   </div>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="space-y-2">
import.meta.env.VITE_API_URL                   <label className="text-sm font-bold text-slate-900">Organização / Empresa</label>
import.meta.env.VITE_API_URL                   <input 
import.meta.env.VITE_API_URL                     type="text" 
import.meta.env.VITE_API_URL                     placeholder="Nome da sua organização"
import.meta.env.VITE_API_URL                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
import.meta.env.VITE_API_URL                   />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="space-y-2">
import.meta.env.VITE_API_URL                   <label className="text-sm font-bold text-slate-900">Assunto</label>
import.meta.env.VITE_API_URL                   <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white">
import.meta.env.VITE_API_URL                     <option>Pedido de Demonstração</option>
import.meta.env.VITE_API_URL                     <option>Dúvida Técnica</option>
import.meta.env.VITE_API_URL                     <option>Parceria</option>
import.meta.env.VITE_API_URL                     <option>Outro</option>
import.meta.env.VITE_API_URL                   </select>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="space-y-2">
import.meta.env.VITE_API_URL                   <label className="text-sm font-bold text-slate-900">Mensagem</label>
import.meta.env.VITE_API_URL                   <textarea 
import.meta.env.VITE_API_URL                     rows={5}
import.meta.env.VITE_API_URL                     placeholder="Como podemos ajudar?"
import.meta.env.VITE_API_URL                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
import.meta.env.VITE_API_URL                   ></textarea>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
import.meta.env.VITE_API_URL                   Enviar Mensagem <Send className="w-5 h-5" />
import.meta.env.VITE_API_URL                 </button>
import.meta.env.VITE_API_URL               </form>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
