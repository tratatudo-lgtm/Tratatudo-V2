import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Ticket,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Mail,
  Receipt,
  Zap,
  BarChart3,
  Bot,
  Smartphone,
  CreditCard,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';
import { usePermissions } from '../../lib/usePermissions';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { canSee } = usePermissions();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, area: 'dashboard', feature: 'dashboard' },
    { name: 'Conversas', href: '/app/whatsapp', icon: MessageSquare, area: 'whatsapp', feature: 'whatsapp' },
    { name: 'Tickets', href: '/app/tickets', icon: Ticket, area: 'tickets', feature: 'tickets' },
    { name: 'Pedidos', href: '/app/requests', icon: ClipboardList, area: 'tickets', feature: 'tickets' },
    { name: 'Reclamações', href: '/app/complaints', icon: AlertCircle, area: 'tickets', feature: 'tickets' },
    { name: 'Vendas', href: '/app/sales', icon: TrendingUp, area: 'tickets', feature: 'tickets' },
    { name: 'Clientes', href: '/app/clients', icon: Users, area: 'clients', feature: 'clients' },
    { name: 'Agenda', href: '/app/calendar', icon: Calendar, area: 'calendar', feature: 'calendar' },
    { name: 'Tarefas', href: '/app/tasks', icon: CheckSquare, area: 'tasks', feature: 'tasks' },
    { name: 'Documentos', href: '/app/documents', icon: FileText, area: 'documents', feature: 'documents' },
    { name: 'Email', href: '/app/emails', icon: Mail, area: 'emails', feature: 'emails' },
    { name: 'Automações', href: '/app/automations', icon: Zap, area: 'automations', feature: 'automations' },
    { name: 'Financeiro', href: '/app/financial', icon: Receipt, area: 'financial', feature: 'financial' },
    { name: 'Equipa', href: '/app/team', icon: Users, area: 'team', feature: 'team' },
    { name: 'Relatórios', href: '/app/reports', icon: BarChart3, area: 'dashboard', feature: 'reports' },
    { name: 'IA', href: '/app/ai', icon: Bot, area: 'dashboard', feature: 'ai' },
    { name: 'Instância', href: '/app/instancia', icon: Smartphone, area: 'whatsapp', feature: 'instance' },
    { name: 'Faturação', href: '/app/subscription', icon: CreditCard, area: 'billing', feature: 'billing' },
    { name: 'Atividade', href: '/app/activity', icon: Activity, area: 'dashboard', feature: 'activity' },
    { name: 'Saúde', href: '/app/system-health', icon: ShieldCheck, area: 'dashboard', feature: 'system_health' },
    { name: 'Definições', href: '/app/settings', icon: Settings, area: 'settings', feature: 'settings' },
  ];

  const filteredItems = menuItems.filter(item => {
    const featureAllowed = user?.features ? user.features[item.feature] !== false : true;
    return canSee(item.area as any) && featureAllowed;
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div className="bg-primary p-1.5 rounded-lg shrink-0">
                <MessageSquare className="text-white w-5 h-5" />
              </div>
              <span
                className={cn(
                  "font-display font-bold text-xl transition-opacity duration-300",
                  !isOpen && "lg:opacity-0"
                )}
              >
                Trata<span className="text-primary">Tudo</span>
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden ml-auto p-2 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1">
            {filteredItems.map((item) => {
              const [itemPath] = item.href.split('?');
              const isActive = location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span
                    className={cn(
                      "transition-opacity duration-300 whitespace-nowrap",
                      !isOpen && "lg:opacity-0"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span
                className={cn(
                  "transition-opacity duration-300 whitespace-nowrap",
                  !isOpen && "lg:opacity-0"
                )}
              >
                Terminar sessão
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
