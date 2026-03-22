import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Smartphone, 
  MessageSquare, 
  ClipboardList, 
  CreditCard, 
  FileText, 
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Search,
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAdminAuth } from '../../lib/auth/AdminAuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/admin/clients', icon: Users },
  { name: 'Instâncias', href: '/admin/instances', icon: Smartphone },
  { name: 'Mensagens', href: '/admin/messages', icon: MessageSquare },
  { name: 'Tickets', href: '/admin/tickets', icon: ClipboardList },
  { name: 'Subscrições', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Logs', href: '/admin/logs', icon: FileText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transition-transform lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight">TrataTudo</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Admin Portal</span>
              </div>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate">{admin?.email}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{admin?.role}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl w-80">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-400 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-slate-900">Administrador</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
