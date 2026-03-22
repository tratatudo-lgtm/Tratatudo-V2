import.meta.env.VITE_API_URL import React, { useState } from 'react';
import.meta.env.VITE_API_URL import { Link, useLocation, useNavigate } from 'react-router-dom';
import.meta.env.VITE_API_URL import { 
import.meta.env.VITE_API_URL   LayoutDashboard, 
import.meta.env.VITE_API_URL   Users, 
import.meta.env.VITE_API_URL   Smartphone, 
import.meta.env.VITE_API_URL   MessageSquare, 
import.meta.env.VITE_API_URL   ClipboardList, 
import.meta.env.VITE_API_URL   CreditCard, 
import.meta.env.VITE_API_URL   FileText, 
import.meta.env.VITE_API_URL   LogOut,
import.meta.env.VITE_API_URL   Menu,
import.meta.env.VITE_API_URL   X,
import.meta.env.VITE_API_URL   ShieldCheck,
import.meta.env.VITE_API_URL   Bell,
import.meta.env.VITE_API_URL   Search,
import.meta.env.VITE_API_URL   User
import.meta.env.VITE_API_URL } from 'lucide-react';
import.meta.env.VITE_API_URL import { cn } from '../../lib/utils';
import.meta.env.VITE_API_URL import { useAdminAuth } from '../../lib/auth/AdminAuthContext';
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL const navigation = [
import.meta.env.VITE_API_URL   { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
import.meta.env.VITE_API_URL   { name: 'Clientes', href: '/admin/clients', icon: Users },
import.meta.env.VITE_API_URL   { name: 'Instâncias', href: '/admin/instances', icon: Smartphone },
import.meta.env.VITE_API_URL   { name: 'Mensagens', href: '/admin/messages', icon: MessageSquare },
import.meta.env.VITE_API_URL   { name: 'Tickets', href: '/admin/tickets', icon: ClipboardList },
import.meta.env.VITE_API_URL   { name: 'Subscrições', href: '/admin/subscriptions', icon: CreditCard },
import.meta.env.VITE_API_URL   { name: 'Logs', href: '/admin/logs', icon: FileText },
import.meta.env.VITE_API_URL ];
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL export function AdminLayout({ children }: { children: React.ReactNode }) {
import.meta.env.VITE_API_URL   const [sidebarOpen, setSidebarOpen] = useState(false);
import.meta.env.VITE_API_URL   const location = useLocation();
import.meta.env.VITE_API_URL   const navigate = useNavigate();
import.meta.env.VITE_API_URL   const { admin, logout } = useAdminAuth();
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   const handleLogout = async () => {
import.meta.env.VITE_API_URL     await logout();
import.meta.env.VITE_API_URL     navigate('/admin/login');
import.meta.env.VITE_API_URL   };
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL   return (
import.meta.env.VITE_API_URL     <div className="min-h-screen bg-slate-50 flex">
import.meta.env.VITE_API_URL       {/* Mobile Sidebar Overlay */}
import.meta.env.VITE_API_URL       {sidebarOpen && (
import.meta.env.VITE_API_URL         <div 
import.meta.env.VITE_API_URL           className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
import.meta.env.VITE_API_URL           onClick={() => setSidebarOpen(false)}
import.meta.env.VITE_API_URL         />
import.meta.env.VITE_API_URL       )}
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Sidebar */}
import.meta.env.VITE_API_URL       <aside className={cn(
import.meta.env.VITE_API_URL         "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transition-transform lg:translate-x-0 lg:static lg:inset-0",
import.meta.env.VITE_API_URL         sidebarOpen ? "translate-x-0" : "-translate-x-full"
import.meta.env.VITE_API_URL       )}>
import.meta.env.VITE_API_URL         <div className="h-full flex flex-col">
import.meta.env.VITE_API_URL           {/* Logo */}
import.meta.env.VITE_API_URL           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
import.meta.env.VITE_API_URL             <Link to="/admin/dashboard" className="flex items-center gap-2">
import.meta.env.VITE_API_URL               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
import.meta.env.VITE_API_URL                 <ShieldCheck className="w-6 h-6 text-white" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="flex flex-col">
import.meta.env.VITE_API_URL                 <span className="text-xl font-black text-slate-900 tracking-tight">TrataTudo</span>
import.meta.env.VITE_API_URL                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Admin Portal</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </Link>
import.meta.env.VITE_API_URL             <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
import.meta.env.VITE_API_URL               <X className="w-6 h-6 text-slate-400" />
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* Navigation */}
import.meta.env.VITE_API_URL           <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
import.meta.env.VITE_API_URL             {navigation.map((item) => {
import.meta.env.VITE_API_URL               const isActive = location.pathname === item.href;
import.meta.env.VITE_API_URL               return (
import.meta.env.VITE_API_URL                 <Link
import.meta.env.VITE_API_URL                   key={item.name}
import.meta.env.VITE_API_URL                   to={item.href}
import.meta.env.VITE_API_URL                   className={cn(
import.meta.env.VITE_API_URL                     "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
import.meta.env.VITE_API_URL                     isActive 
import.meta.env.VITE_API_URL                       ? "bg-primary text-white shadow-lg shadow-primary/20" 
import.meta.env.VITE_API_URL                       : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
import.meta.env.VITE_API_URL                   )}
import.meta.env.VITE_API_URL                 >
import.meta.env.VITE_API_URL                   <item.icon className={cn(
import.meta.env.VITE_API_URL                     "w-5 h-5 transition-colors",
import.meta.env.VITE_API_URL                     isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
import.meta.env.VITE_API_URL                   )} />
import.meta.env.VITE_API_URL                   {item.name}
import.meta.env.VITE_API_URL                 </Link>
import.meta.env.VITE_API_URL               );
import.meta.env.VITE_API_URL             })}
import.meta.env.VITE_API_URL           </nav>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           {/* User Profile */}
import.meta.env.VITE_API_URL           <div className="p-4 border-t border-slate-100">
import.meta.env.VITE_API_URL             <div className="bg-slate-50 rounded-2xl p-4">
import.meta.env.VITE_API_URL               <div className="flex items-center gap-3 mb-4">
import.meta.env.VITE_API_URL                 <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
import.meta.env.VITE_API_URL                   <User className="w-5 h-5 text-slate-400" />
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL                 <div className="flex flex-col min-w-0">
import.meta.env.VITE_API_URL                   <span className="text-sm font-bold text-slate-900 truncate">{admin?.email}</span>
import.meta.env.VITE_API_URL                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{admin?.role}</span>
import.meta.env.VITE_API_URL                 </div>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <button 
import.meta.env.VITE_API_URL                 onClick={handleLogout}
import.meta.env.VITE_API_URL                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
import.meta.env.VITE_API_URL               >
import.meta.env.VITE_API_URL                 <LogOut className="w-4 h-4" />
import.meta.env.VITE_API_URL                 Sair
import.meta.env.VITE_API_URL               </button>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </div>
import.meta.env.VITE_API_URL       </aside>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL       {/* Main Content */}
import.meta.env.VITE_API_URL       <div className="flex-1 flex flex-col min-w-0">
import.meta.env.VITE_API_URL         {/* Topbar */}
import.meta.env.VITE_API_URL         <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
import.meta.env.VITE_API_URL           <div className="flex items-center gap-4">
import.meta.env.VITE_API_URL             <button 
import.meta.env.VITE_API_URL               className="lg:hidden p-2 hover:bg-slate-50 rounded-lg"
import.meta.env.VITE_API_URL               onClick={() => setSidebarOpen(true)}
import.meta.env.VITE_API_URL             >
import.meta.env.VITE_API_URL               <Menu className="w-6 h-6 text-slate-600" />
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl w-80">
import.meta.env.VITE_API_URL               <Search className="w-4 h-4 text-slate-400" />
import.meta.env.VITE_API_URL               <input 
import.meta.env.VITE_API_URL                 type="text" 
import.meta.env.VITE_API_URL                 placeholder="Pesquisar..." 
import.meta.env.VITE_API_URL                 className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-400 w-full"
import.meta.env.VITE_API_URL               />
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL           <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL             <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors relative">
import.meta.env.VITE_API_URL               <Bell className="w-5 h-5" />
import.meta.env.VITE_API_URL               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
import.meta.env.VITE_API_URL             </button>
import.meta.env.VITE_API_URL             <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />
import.meta.env.VITE_API_URL             <div className="flex items-center gap-3">
import.meta.env.VITE_API_URL               <div className="flex flex-col items-end hidden sm:flex">
import.meta.env.VITE_API_URL                 <span className="text-sm font-bold text-slate-900">Administrador</span>
import.meta.env.VITE_API_URL                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
import.meta.env.VITE_API_URL                 <ShieldCheck className="w-6 h-6 text-white" />
import.meta.env.VITE_API_URL               </div>
import.meta.env.VITE_API_URL             </div>
import.meta.env.VITE_API_URL           </div>
import.meta.env.VITE_API_URL         </header>
import.meta.env.VITE_API_URL 
import.meta.env.VITE_API_URL         {/* Page Content */}
import.meta.env.VITE_API_URL         <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
import.meta.env.VITE_API_URL           {children}
import.meta.env.VITE_API_URL         </main>
import.meta.env.VITE_API_URL       </div>
import.meta.env.VITE_API_URL     </div>
import.meta.env.VITE_API_URL   );
import.meta.env.VITE_API_URL }
