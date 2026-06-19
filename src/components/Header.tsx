import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Preços', href: '/precos' },
  { name: 'Contacto', href: '/contacto' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isWhiteLabelMode, setIsWhiteLabelMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Deteta e mantém o modo White Label persistente entre cliques de navegação
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('modo') === 'wl') {
      setIsWhiteLabelMode(true);
    } else {
      setIsWhiteLabelMode(false);
    }
  }, [location]);

  // Função auxiliar para injetar o parâmetro de revenda nos links dinamicamente
  const buildHref = (path: string) => {
    return isWhiteLabelMode ? `${path}?modo=wl` : path;
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled 
          ? 'bg-slate-950/80 border-slate-900/80 backdrop-blur-md py-3 shadow-2xl' 
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to={buildHref('/')} className="flex items-center gap-2 group">
          <div className={cn(
            "p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg",
            isWhiteLabelMode ? "bg-emerald-600/20 text-emerald-400" : "bg-indigo-600 text-white shadow-indigo-600/10"
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

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const targetPath = buildHref(link.href);
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={targetPath}
                className={cn(
                  'text-sm font-medium transition-colors relative py-1',
                  isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="activeNavLine" 
                    className={cn("absolute bottom-0 left-0 right-0 h-0.5 rounded-full", isWhiteLabelMode ? "bg-emerald-500" : "bg-indigo-500")} 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to={buildHref('/login')}
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <a
            href={isWhiteLabelMode 
              ? "https://wa.me/351923364360?text=Quero%20saber%20mais%20sobre%20o%20modelo%20White%20Label"
              : "https://wa.me/351923364360?text=Quero%20fazer%20o%20teste%20gratis%20da%20IA"
            }
            target="_blank"
            rel="noreferrer"
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-lg",
              isWhiteLabelMode 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
            )}
          >
            {isWhiteLabelMode ? "Vagas de Revenda" : "Experimentar Grátis"}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 border-b border-slate-900 backdrop-blur-2xl shadow-2xl p-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={buildHref(link.href)}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-base font-bold p-3 rounded-xl transition-all',
                  location.pathname === link.href 
                    ? isWhiteLabelMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-slate-300 hover:bg-slate-900'
                )}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-900 my-2" />
            <Link
              to={buildHref('/login')}
              onClick={() => setIsOpen(false)}
              className="text-base font-bold p-3 text-slate-300 hover:bg-slate-900 rounded-xl"
            >
              Entrar
            </Link>
            <a
              href={isWhiteLabelMode 
                ? "https://wa.me/351923364360?text=Quero%20saber%20mais%20sobre%20o%20modelo%20White%20Label"
                : "https://wa.me/351923364360?text=Quero%20fazer%20o%20teste%20gratis%20da%20IA"
              }
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className={cn(
                "p-4 rounded-xl text-center font-bold text-sm shadow-md",
                isWhiteLabelMode ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
              )}
            >
              {isWhiteLabelMode ? "Falar com Consultor" : "Experimentar Grátis"}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
