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
  const { signOut } = useAuth();
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
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, area: 'dashboard' },
    { name: 'Conversas', href: '/app/whatsapp', icon: MessageSquare, area: 'whatsapp' },
    { name: 'Tickets', href: '/app/tickets', icon: Ticket, area: 'tickets' },
    { name: 'Pedidos', href: '/app/requests', icon: ClipboardList, area: 'tickets' },
    { name: 'Reclamações', href: '/app/complaints', icon: AlertCircle, area: 'tickets' },
    { name: 'Vendas', href: '/app/sales', icon: TrendingUp, area: 'tickets' },
    { name: 'Clientes', href: '/app/clients', icon: Users, area: 'clients' },
    { name: 'Agenda', href: '/app/calendar', icon: Calendar, area: 'calendar' },
    { name: 'Tarefas', href: '/app/tasks', icon: CheckSquare, area: 'tasks' },
    { name: 'Documentos', href: '/app/documents', icon: FileText, area: 'documents' },
    { name: 'Email', href: '/app/emails', icon: Mail, area: 'emails' },
    { name: 'Automações', href: '/app/automations', icon: Zap, area: 'automations' },
    { name: 'Financeiro', href: '/app/financial', icon: Receipt, area: 'financial' },
    { name: 'Equipa', href: '/app/team', icon: Users, area: 'team' },
    { name: 'Relatórios', href: '/app/reports', icon: BarChart3, area: 'dashboard' },
    { name: 'IA', href: '/app/ai', icon: Bot, area: 'dashboard' },
    { name: 'Instância', href: '/app/instancia', icon: Smartphone, area: 'whatsapp' },
    { name: 'Faturação', href: '/app/subscription', icon: CreditCard, area: 'billing' },
    { name: 'Atividade', href: '/app/activity', icon: Activity, area: 'dashboard' },
    { name: 'Saúde', href: '/app/system-health', icon: ShieldCheck, area: 'dashboard' },
    { name: 'Definições', href: '/app/settings', icon: Settings, area: 'settings' },
  ];

  // Filter items based on permissions
  const filteredItems = menuItems.filter(item => canSee(item.area as any));

  return (
    <>
      {/* Mobile Overlay */}
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
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div className="bg-primary p-1.5 rounded-lg shrink-0">
                <MessageSquare className="text-white w-5 h-5" />
              </div>
              <span className={cn(
                "font-display font-bold text-xl transition-opacity duration-300",
                !isOpen && "lg:opacity-0"
              )}>
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

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {filteredItems.map((item) => {
              const [itemPath, itemQuery] = item.href.split('?');
              const isActive = location.pathname === itemPath && 
                              (itemQuery ? location.search.includes(itemQuery) : location.search === '');
              return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    )}
                  >
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-white" : "group-hover:text-primary"
                  )} />
                  <span className={cn(
                    "font-medium whitespace-nowrap transition-opacity duration-300",
                    !isOpen && "lg:opacity-0"
                  )}>
                    {item.name}
                  </span>
                  {!isOpen && (
                    <div className="hidden lg:block absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group",
                !isOpen && "lg:justify-center"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={cn(
                "font-medium transition-opacity duration-300",
                !isOpen && "lg:hidden"
              )}>
                Sair
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
