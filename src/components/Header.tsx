import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Como funciona', href: '/como-funciona' },
  { name: 'Funcionalidades', href: '/funcionalidades' },
  { name: 'Para quem é', href: '/para-quem' },
  { name: 'Preços', href: '/precos' },
  { name: 'Contacto', href: '/contacto' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
            <MessageSquare className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold text-slate-900">
            Trata<span className="text-primary">Tudo</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === link.href ? 'text-primary' : 'text-slate-600'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
          >
            Entrar
          </Link>
          <Link
            to="/experimentar"
            className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            Experimentar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-slate-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl p-4 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-lg font-medium p-2 rounded-lg',
                  location.pathname === link.href ? 'bg-primary/5 text-primary' : 'text-slate-600'
                )}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-100" />
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium p-2 text-slate-600"
            >
              Entrar
            </Link>
            <Link
              to="/experimentar"
              onClick={() => setIsOpen(false)}
              className="bg-primary text-white p-4 rounded-xl text-center font-bold"
            >
              Experimentar Grátis
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
