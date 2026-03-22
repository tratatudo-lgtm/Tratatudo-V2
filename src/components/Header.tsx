import.meta.env.VITE_API_URL import React, { useState, useEffect } from 'react';
import.meta.env.VITE_API_URL import { Link, useLocation } from 'react-router-dom';
import.meta.env.VITE_API_URL import { Menu, X, MessageSquare, ArrowRight } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn } from '@/src/lib/utils';
import.meta.env.VITE_API_URL import { motion, AnimatePresence } from 'motion/react';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const navLinks = [
import.meta.env.VITE_API_URL   { name: 'Home', href: '/' },
import.meta.env.VITE_API_URL   { name: 'Como funciona', href: '/como-funciona' },
import.meta.env.VITE_API_URL   { name: 'Funcionalidades', href: '/funcionalidades' },
import.meta.env.VITE_API_URL   { name: 'Para quem é', href: '/para-quem' },
import.meta.env.VITE_API_URL   { name: 'Preços', href: '/precos' },
import.meta.env.VITE_API_URL   { name: 'Contacto', href: '/contacto' },
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Header() {
import.meta.env.VITE_API_URL   const [isOpen, setIsOpen] = useState(false);
import.meta.env.VITE_API_URL   const [scrolled, setScrolled] = useState(false);
import.meta.env.VITE_API_URL   const location = useLocation();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   useEffect(() => {
import.meta.env.VITE_API_URL     const handleScroll = () => setScrolled(window.scrollY > 20);
import.meta.env.VITE_API_URL     window.addEventListener('scroll', handleScroll);
import.meta.env.VITE_API_URL     return () => window.removeEventListener('scroll', handleScroll);
import.meta.env.VITE_API_URL   }, []);
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <header
import.meta.env.VITE_API_URL       className={cn(
import.meta.env.VITE_API_URL         'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
import.meta.env.VITE_API_URL         scrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-5'
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL     >
import.meta.env.VITE_API_URL       <div className="container mx-auto px-4 flex items-center justify-between">
import.meta.env.VITE_API_URL         <Link to="/" className="flex items-center gap-2 group">
import.meta.env.VITE_API_URL           <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
import.meta.env.VITE_API_URL             <MessageSquare className="text-white w-6 h-6" />
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL           <span className="text-2xl font-display font-bold text-slate-900">
import.meta.env.VITE_API_URL             Trata<span className="text-primary">Tudo</span>
import.meta.env.VITE_API_URL           </span>
import.meta.env.VITE_API_URL         </Link>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Desktop Nav */}
import.meta.env.VITE_API_URL         <nav className="hidden lg:flex items-center gap-8">
import.meta.env.VITE_API_URL           {navLinks.map((link) => (
import.meta.env.VITE_API_URL             <Link
import.meta.env.VITE_API_URL               key={link.name}
import.meta.env.VITE_API_URL               to={link.href}
import.meta.env.VITE_API_URL               className={cn(
import.meta.env.VITE_API_URL                 'text-sm font-medium transition-colors hover:text-primary',
import.meta.env.VITE_API_URL                 location.pathname === link.href ? 'text-primary' : 'text-slate-600'
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               {link.name}
import.meta.env.VITE_API_URL             </Link>
import.meta.env.VITE_API_URL           ))}
import.meta.env.VITE_API_URL         </nav>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         <div className="hidden lg:flex items-center gap-4">
import.meta.env.VITE_API_URL           <Link
import.meta.env.VITE_API_URL             to="/login"
import.meta.env.VITE_API_URL             className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             Entrar
import.meta.env.VITE_API_URL           </Link>
import.meta.env.VITE_API_URL           <Link
import.meta.env.VITE_API_URL             to="/experimentar"
import.meta.env.VITE_API_URL             className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             Experimentar <ArrowRight className="w-4 h-4" />
import.meta.env.VITE_API_URL           </Link>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Mobile Toggle */}
import.meta.env.VITE_API_URL         <button
import.meta.env.VITE_API_URL           className="lg:hidden p-2 text-slate-600"
import.meta.env.VITE_API_URL           onClick={() => setIsOpen(!isOpen)}
import.meta.env.VITE_API_URL         >
import.meta.env.VITE_API_URL           {isOpen ? <X /> : <Menu />}
import.meta.env.VITE_API_URL         </button>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Mobile Menu */}
import.meta.env.VITE_API_URL       <AnimatePresence>
import.meta.env.VITE_API_URL         {isOpen && (
import.meta.env.VITE_API_URL           <motion.div
import.meta.env.VITE_API_URL             initial={{ opacity: 0, y: -20 }}
import.meta.env.VITE_API_URL             animate={{ opacity: 1, y: 0 }}
import.meta.env.VITE_API_URL             exit={{ opacity: 0, y: -20 }}
import.meta.env.VITE_API_URL             className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl p-4 flex flex-col gap-4"
import.meta.env.VITE_API_URL           >
import.meta.env.VITE_API_URL             {navLinks.map((link) => (
import.meta.env.VITE_API_URL               <Link
import.meta.env.VITE_API_URL                 key={link.name}
import.meta.env.VITE_API_URL                 to={link.href}
import.meta.env.VITE_API_URL                 onClick={() => setIsOpen(false)}
import.meta.env.VITE_API_URL                 className={cn(
import.meta.env.VITE_API_URL                   'text-lg font-medium p-2 rounded-lg',
import.meta.env.VITE_API_URL                   location.pathname === link.href ? 'bg-primary/5 text-primary' : 'text-slate-600'
import.meta.env.VITE_API_URL                 )}
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 {link.name}
import.meta.env.VITE_API_URL               </Link>
import.meta.env.VITE_API_URL             ))}
import.meta.env.VITE_API_URL             <hr className="border-slate-100" />
import.meta.env.VITE_API_URL             <Link
import.meta.env.VITE_API_URL               to="/login"
import.meta.env.VITE_API_URL               onClick={() => setIsOpen(false)}
import.meta.env.VITE_API_URL               className="text-lg font-medium p-2 text-slate-600"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               Entrar
import.meta.env.VITE_API_URL             </Link>
import.meta.env.VITE_API_URL             <Link
import.meta.env.VITE_API_URL               to="/experimentar"
import.meta.env.VITE_API_URL               onClick={() => setIsOpen(false)}
import.meta.env.VITE_API_URL               className="bg-primary text-white p-4 rounded-xl text-center font-bold"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               Experimentar Grátis
import.meta.env.VITE_API_URL             </Link>
import.meta.env.VITE_API_URL           </motion.div>
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       </AnimatePresence>
import.meta.env.VITE_API_URL     </header>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
