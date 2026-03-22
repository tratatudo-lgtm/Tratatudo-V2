import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ClipboardList, 
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Mail,
  Receipt,
  BarChart3,
  Bot,
  Smartphone, 
  CreditCard, 
  Settings, 
  LogOut,
  X
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
    { name: 'Mensagens', href: '/app/messages', icon: MessageSquare, area: 'mensagens' },
    { name: 'Pedidos', href: '/app/tickets?area=pedidos', icon: ClipboardList, area: 'pedidos' },
    { name: 'Reclamações', href: '/app/tickets?area=reclamacoes', icon: AlertCircle, area: 'reclamacoes' },
    { name: 'Vendas', href: '/app/tickets?area=vendas', icon: TrendingUp, area: 'vendas' },
    { name: 'Clientes', href: '/app/clients', icon: Users, area: 'clientes' },
    { name: 'Agenda', href: '/app/agenda', icon: Calendar, area: 'agenda' },
    { name: 'Tarefas', href: '/app/tasks', icon: CheckSquare, area: 'tarefas' },
    { name: 'Documentos', href: '/app/documents', icon: FileText, area: 'documentos' },
    { name: 'Email', href: '/app/email', icon: Mail, area: 'email' },
    { name: 'Financeiro', href: '/app/financial', icon: Receipt, area: 'faturas' },
    { name: 'Equipa', href: '/app/team', icon: Users, area: 'equipa' },
    { name: 'Relatórios', href: '/app/reports', icon: BarChart3, area: 'relatorios' },
    { name: 'IA', href: '/app/ai', icon: Bot, area: 'ia' },
    { name: 'Instância', href: '/app/instancia', icon: Smartphone, area: 'instancia' },
    { name: 'Subscrição', href: '/app/subscription', icon: CreditCard, area: 'subscricao' },
    { name: 'Definições', href: '/app/settings', icon: Settings, area: 'definicoes' },
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
