import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Mail, Phone, MapPin, Instagram, Linkedin, Twitter } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Footer() {
  const [isWhiteLabelMode, setIsWhiteLabelMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('modo') === 'wl') {
      setIsWhiteLabelMode(true);
    } else {
      setIsWhiteLabelMode(false);
    }
  }, [location]);

  const buildHref = (path: string) => {
    return isWhiteLabelMode ? `${path}?modo=wl` : path;
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900/60 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to={buildHref('/')} className="flex items-center gap-2 group">
              <div className={cn(
                "p-2 rounded-xl transition-transform group-hover:scale-105",
                isWhiteLabelMode ? "bg-emerald-600/20 text-emerald-400" : "bg-indigo-600 text-white"
              )}>
                <Brain className="w-5 h-5" />
              </div>
              {isWhiteLabelMode ? (
                <span className="text-xl font-black tracking-tight text-white">
                  SaaS<span className="text-emerald-400 font-medium">Automate</span>
                </span>
              ) : (
                <span className="text-xl font-black tracking-tight text-white">
                  Trata<span className="text-indigo-400 font-medium">Tudo</span>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded-md ml-1.5 border border-indigo-500/20">AI</span>
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              {isWhiteLabelMode ? (
                "Plataforma robusta de automatização de canais e CRM empresarial. Desenvolvida para agências que procuram faturação recorrente com marca própria."
              ) : (
                "Plataforma inteligente de gestão e automação empresarial com IA. Centralize o seu WhatsApp, otimize equipas e qualifique leads num único CRM robusto."
              )}
            </p>
            <div className="flex gap-4 text-slate-500">
              <a href="#" className={cn("transition-colors", isWhiteLabelMode ? "hover:text-emerald-400" : "hover:text-indigo-400")}><Instagram className="w-4 h-4" /></a>
              <a href="#" className={cn("transition-colors", isWhiteLabelMode ? "hover:text-emerald-400" : "hover:text-indigo-400")}><Linkedin className="w-4 h-4" /></a>
              <a href="#" className={cn("transition-colors", isWhiteLabelMode ? "hover:text-emerald-400" : "hover:text-indigo-400")}><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6">Plataforma</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={buildHref('/')} className="hover:text-white transition-colors">Página Inicial</Link></li>
              <li><Link to={buildHref('/precos')} className="hover:text-white transition-colors">Planos e Preços</Link></li>
              <li><Link to={buildHref('/contacto')} className="hover:text-white transition-colors">Soluções Corporativas</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6">Ecossistema</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={buildHref('/contacto')} className="hover:text-white transition-colors">Suporte Técnico</Link></li>
              <li><Link to={buildHref('/login')} className="hover:text-white transition-colors">Portal do Cliente</Link></li>
              <li><a href="https://wa.me/351923364360?text=Preciso%20de%20ajuda%20com%20a%20API" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Documentação API</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-6">Contacto Directo</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail className={cn("w-4 h-4", isWhiteLabelMode ? "text-emerald-400" : "text-indigo-400")} />
                <span className="text-slate-300">{isWhiteLabelMode ? "comercial@saasautomate.io" : "geral@tratatudo.pt"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className={cn("w-4 h-4", isWhiteLabelMode ? "text-emerald-400" : "text-indigo-400")} />
                <span className="text-slate-300">+351 923 364 360</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className={cn("w-4 h-4", isWhiteLabelMode ? "text-emerald-400" : "text-indigo-400")} />
                <span className="text-slate-300">Valença, Portugal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {isWhiteLabelMode ? "SaaSAutomate" : "TrataTudo"}. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link to={buildHref('/termos')} className="hover:text-slate-300 transition-colors">Termos de Serviço</Link>
            <Link to={buildHref('/privacidade')} className="hover:text-slate-300 transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
