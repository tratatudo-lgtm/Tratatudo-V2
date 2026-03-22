import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { Link } from 'react-router-dom';
import.meta.env.VITE_API_URL import { MessageSquare, Mail, Phone, MapPin, Instagram, Linkedin, Twitter } from 'lucide-react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Footer() {
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <footer className="bg-slate-950 text-slate-400 py-16">
import.meta.env.VITE_API_URL       <div className="container mx-auto px-4">
import.meta.env.VITE_API_URL         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
import.meta.env.VITE_API_URL           <div className="space-y-6">
import.meta.env.VITE_API_URL             <Link to="/" className="flex items-center gap-2">
import.meta.env.VITE_API_URL               <div className="bg-primary p-2 rounded-lg">
import.meta.env.VITE_API_URL                 <MessageSquare className="text-white w-6 h-6" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <span className="text-2xl font-display font-bold text-white">
import.meta.env.VITE_API_URL                 Trata<span className="text-primary">Tudo</span>
import.meta.env.VITE_API_URL               </span>
import.meta.env.VITE_API_URL             </Link>
import.meta.env.VITE_API_URL             <p className="text-sm leading-relaxed">
import.meta.env.VITE_API_URL               Automatize o atendimento da sua organização no WhatsApp. 
import.meta.env.VITE_API_URL               Eficiência, proximidade e inovação para o setor público e privado.
import.meta.env.VITE_API_URL             </p>
import.meta.env.VITE_API_URL             <div className="flex gap-4">
import.meta.env.VITE_API_URL               <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
import.meta.env.VITE_API_URL               <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
import.meta.env.VITE_API_URL               <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <h4 className="text-white font-bold mb-6">Plataforma</h4>
import.meta.env.VITE_API_URL             <ul className="space-y-4 text-sm">
import.meta.env.VITE_API_URL               <li><Link to="/funcionalidades" className="hover:text-white transition-colors">Funcionalidades</Link></li>
import.meta.env.VITE_API_URL               <li><Link to="/como-funciona" className="hover:text-white transition-colors">Como funciona</Link></li>
import.meta.env.VITE_API_URL               <li><Link to="/precos" className="hover:text-white transition-colors">Preços</Link></li>
import.meta.env.VITE_API_URL               <li><Link to="/para-quem" className="hover:text-white transition-colors">Para quem é</Link></li>
import.meta.env.VITE_API_URL             </ul>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <h4 className="text-white font-bold mb-6">Suporte</h4>
import.meta.env.VITE_API_URL             <ul className="space-y-4 text-sm">
import.meta.env.VITE_API_URL               <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
import.meta.env.VITE_API_URL               <li><Link to="/contacto" className="hover:text-white transition-colors">Centro de Ajuda</Link></li>
import.meta.env.VITE_API_URL               <li><Link to="/contacto" className="hover:text-white transition-colors">API Documentation</Link></li>
import.meta.env.VITE_API_URL               <li><Link to="/contacto" className="hover:text-white transition-colors">Status</Link></li>
import.meta.env.VITE_API_URL             </ul>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div>
import.meta.env.VITE_API_URL             <h4 className="text-white font-bold mb-6">Contacto</h4>
import.meta.env.VITE_API_URL             <ul className="space-y-4 text-sm">
import.meta.env.VITE_API_URL               <li className="flex items-center gap-3">
import.meta.env.VITE_API_URL                 <Mail className="w-4 h-4 text-primary" />
import.meta.env.VITE_API_URL                 <span>geral@tratatudo.pt</span>
import.meta.env.VITE_API_URL               </li>
import.meta.env.VITE_API_URL               <li className="flex items-center gap-3">
import.meta.env.VITE_API_URL                 <Phone className="w-4 h-4 text-primary" />
import.meta.env.VITE_API_URL                 <span>+351 937 230 116</span>
import.meta.env.VITE_API_URL               </li>
import.meta.env.VITE_API_URL               <li className="flex items-center gap-3">
import.meta.env.VITE_API_URL                 <MapPin className="w-4 h-4 text-primary" />
import.meta.env.VITE_API_URL                 <span>Valença, Portugal</span>
import.meta.env.VITE_API_URL               </li>
import.meta.env.VITE_API_URL             </ul>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
import.meta.env.VITE_API_URL           <p>© 2024 TrataTudo. Todos os direitos reservados.</p>
import.meta.env.VITE_API_URL             <div className="flex gap-8">
import.meta.env.VITE_API_URL               <Link to="/termos" className="hover:text-white transition-colors">Termos de Serviço</Link>
import.meta.env.VITE_API_URL               <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
import.meta.env.VITE_API_URL               <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </footer>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
