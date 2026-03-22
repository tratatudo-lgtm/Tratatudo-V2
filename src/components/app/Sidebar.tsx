import.meta.env.VITE_API_URL import React from 'react';
import.meta.env.VITE_API_URL import { Link, useLocation, useNavigate } from 'react-router-dom';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   LayoutDashboard, 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   ClipboardList, 
import.meta.env.VITE_API_URL   AlertCircle,
import.meta.env.VITE_API_URL   TrendingUp,
import.meta.env.VITE_API_URL   Smartphone, 
import.meta.env.VITE_API_URL   CreditCard, 
import.meta.env.VITE_API_URL   Settings, 
import.meta.env.VITE_API_URL   LogOut,
import.meta.env.VITE_API_URL   Users,
import.meta.env.VITE_API_URL   X
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAuth } from '../../lib/auth/AuthContext';
import.meta.env.VITE_API_URL import { usePermissions } from '../../lib/usePermissions';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL interface SidebarProps {
import.meta.env.VITE_API_URL   isOpen: boolean;
import.meta.env.VITE_API_URL   setIsOpen: (isOpen: boolean) => void;
import.meta.env.VITE_API_URL }
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
import.meta.env.VITE_API_URL   const location = useLocation();
import.meta.env.VITE_API_URL   const navigate = useNavigate();
import.meta.env.VITE_API_URL   const { signOut } = useAuth();
import.meta.env.VITE_API_URL   const { canSee } = usePermissions();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleLogout = async () => {
import.meta.env.VITE_API_URL     try {
import.meta.env.VITE_API_URL       await signOut();
import.meta.env.VITE_API_URL       navigate('/login');
import.meta.env.VITE_API_URL     } catch (error) {
import.meta.env.VITE_API_URL       console.error('Logout failed:', error);
import.meta.env.VITE_API_URL       navigate('/login');
import.meta.env.VITE_API_URL     }
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const menuItems = [
import.meta.env.VITE_API_URL     { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, area: 'dashboard' },
import.meta.env.VITE_API_URL     { name: 'Mensagens', href: '/app/messages', icon: MessageSquare, area: 'mensagens' },
import.meta.env.VITE_API_URL     { name: 'Pedidos', href: '/app/tickets?area=pedidos', icon: ClipboardList, area: 'pedidos' },
import.meta.env.VITE_API_URL     { name: 'Reclamações', href: '/app/tickets?area=reclamacoes', icon: AlertCircle, area: 'reclamacoes' },
import.meta.env.VITE_API_URL     { name: 'Vendas', href: '/app/tickets?area=vendas', icon: TrendingUp, area: 'vendas' },
import.meta.env.VITE_API_URL     { name: 'Instância', href: '/app/instancia', icon: Smartphone, area: 'instancia' },
import.meta.env.VITE_API_URL     { name: 'Equipa', href: '/app/team', icon: Users, area: 'equipa' },
import.meta.env.VITE_API_URL     { name: 'Subscrição', href: '/app/subscription', icon: CreditCard, area: 'subscricao' },
import.meta.env.VITE_API_URL     { name: 'Definições', href: '/app/settings', icon: Settings, area: 'definicoes' },
import.meta.env.VITE_API_URL   ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   // Filter items based on permissions and route existence
import.meta.env.VITE_API_URL   const filteredItems = menuItems.filter(item => {
import.meta.env.VITE_API_URL     // Check permission
import.meta.env.VITE_API_URL     if (!canSee(item.area as any)) return false;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     // Special check for Equipa route existence (not yet in App.tsx)
import.meta.env.VITE_API_URL     // The user asked to only show if it exists in App.tsx. 
import.meta.env.VITE_API_URL     // Since we know it doesn't exist yet, we return false.
import.meta.env.VITE_API_URL     if (item.href === '/app/team') return false;
import.meta.env.VITE_API_URL     
import.meta.env.VITE_API_URL     return true;
import.meta.env.VITE_API_URL   });
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <>
import.meta.env.VITE_API_URL       {/* Mobile Overlay */}
import.meta.env.VITE_API_URL       {isOpen && (
import.meta.env.VITE_API_URL         <div 
import.meta.env.VITE_API_URL           className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
import.meta.env.VITE_API_URL           onClick={() => setIsOpen(false)}
import.meta.env.VITE_API_URL         />
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       <aside
import.meta.env.VITE_API_URL         className={cn(
import.meta.env.VITE_API_URL           "fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
import.meta.env.VITE_API_URL           isOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden"
import.meta.env.VITE_API_URL         )}
import.meta.env.VITE_API_URL       >
import.meta.env.VITE_API_URL         <div className="flex flex-col h-full">
import.meta.env.VITE_API_URL           {/* Logo */}
import.meta.env.VITE_API_URL           <div className="h-16 flex items-center px-6 border-b border-slate-100">
import.meta.env.VITE_API_URL             <Link to="/" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
import.meta.env.VITE_API_URL               <div className="bg-primary p-1.5 rounded-lg shrink-0">
import.meta.env.VITE_API_URL                 <MessageSquare className="text-white w-5 h-5" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <span className={cn(
import.meta.env.VITE_API_URL                 "font-display font-bold text-xl transition-opacity duration-300",
import.meta.env.VITE_API_URL                 !isOpen && "lg:opacity-0"
import.meta.env.VITE_API_URL               )}>
import.meta.env.VITE_API_URL                 Trata<span className="text-primary">Tudo</span>
import.meta.env.VITE_API_URL               </span>
import.meta.env.VITE_API_URL             </Link>
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={() => setIsOpen(false)}
import.meta.env.VITE_API_URL               className="lg:hidden ml-auto p-2 text-slate-500"
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <X className="w-5 h-5" />
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Navigation */}
import.meta.env.VITE_API_URL           <nav className="flex-1 py-6 px-3 space-y-1">
import.meta.env.VITE_API_URL             {filteredItems.map((item) => {
import.meta.env.VITE_API_URL               const [itemPath, itemQuery] = item.href.split('?');
import.meta.env.VITE_API_URL               const isActive = location.pathname === itemPath && 
import.meta.env.VITE_API_URL                               (itemQuery ? location.search.includes(itemQuery) : location.search === '');
import.meta.env.VITE_API_URL               return (
import.meta.env.VITE_API_URL                 <Link
import.meta.env.VITE_API_URL                   key={item.name}
import.meta.env.VITE_API_URL                   to={item.href}
import.meta.env.VITE_API_URL                   className={cn(
import.meta.env.VITE_API_URL                     "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
import.meta.env.VITE_API_URL                     isActive 
import.meta.env.VITE_API_URL                       ? "bg-primary text-white shadow-lg shadow-primary/20" 
import.meta.env.VITE_API_URL                       : "text-slate-600 hover:bg-slate-50 hover:text-primary"
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <item.icon className={cn(
import.meta.env.VITE_API_URL                     "w-5 h-5 shrink-0",
import.meta.env.VITE_API_URL                     isActive ? "text-white" : "group-hover:text-primary"
import.meta.env.VITE_API_URL                   )} />
import.meta.env.VITE_API_URL                   <span className={cn(
import.meta.env.VITE_API_URL                     "font-medium whitespace-nowrap transition-opacity duration-300",
import.meta.env.VITE_API_URL                     !isOpen && "lg:opacity-0"
import.meta.env.VITE_API_URL                   )}>
import.meta.env.VITE_API_URL                     {item.name}
import.meta.env.VITE_API_URL                   </span>
import.meta.env.VITE_API_URL                   {!isOpen && (
import.meta.env.VITE_API_URL                     <div className="hidden lg:block absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
import.meta.env.VITE_API_URL                       {item.name}
import.meta.env.VITE_API_URL                     </div>
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 </Link>
import.meta.env.VITE_API_URL               );
import.meta.env.VITE_API_URL             })}
import.meta.env.VITE_API_URL           </nav>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Footer */}
import.meta.env.VITE_API_URL           <div className="p-4 border-t border-slate-100">
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               onClick={handleLogout}
import.meta.env.VITE_API_URL               className={cn(
import.meta.env.VITE_API_URL                 "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group",
import.meta.env.VITE_API_URL                 !isOpen && "lg:justify-center"
import.meta.env.VITE_API_URL               )}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <LogOut className="w-5 h-5 shrink-0" />
import.meta.env.VITE_API_URL               <span className={cn(
import.meta.env.VITE_API_URL                 "font-medium transition-opacity duration-300",
import.meta.env.VITE_API_URL                 !isOpen && "lg:hidden"
import.meta.env.VITE_API_URL               )}>
import.meta.env.VITE_API_URL                 Sair
import.meta.env.VITE_API_URL               </span>
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </aside>
import.meta.env.VITE_API_URL     </>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
