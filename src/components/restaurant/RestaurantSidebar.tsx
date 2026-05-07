
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CalendarDays, 
  MessageSquare, 
  Users, 
  UtensilsCrossed, 
  CreditCard, 
  AlertCircle, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth/AuthContext';

interface RestaurantSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onItemClick?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/app/restaurant/dashboard' },
  { icon: ShoppingBag, label: 'Pedidos', href: '/app/restaurant/orders' },
  { icon: CalendarDays, label: 'Reservas', href: '/app/restaurant/reservations' },
  { icon: MessageSquare, label: 'Conversas', href: '/app/restaurant/conversations' },
  { icon: Users, label: 'Clientes', href: '/app/restaurant/customers' },
  { icon: UtensilsCrossed, label: 'Ementa', href: '/app/restaurant/menu' },
  { icon: CreditCard, label: 'Pagamentos', href: '/app/restaurant/payments' },
  { icon: AlertCircle, label: 'Reclamações', href: '/app/restaurant/tickets' },
  { icon: Settings, label: 'Definições', href: '/app/restaurant/settings' },
];

export function RestaurantSidebar({ isOpen, setIsOpen, onItemClick }: RestaurantSidebarProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "h-full bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
      isOpen ? "w-64" : "w-20"
    )}>
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-display font-black text-slate-900 leading-none">PORTAL</h1>
              <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Restaurante</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 shrink-0",
              isOpen ? "" : "mx-auto"
            )} />
            {isOpen && <span className="font-bold text-sm">{item.label}</span>}
            
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Footer */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        {isOpen && (
          <div className="px-2 py-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Restaurante</p>
            <p className="text-sm font-bold text-slate-900 px-2 truncate">{user?.company_name || 'O Meu Restaurante'}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group relative",
            isOpen ? "" : "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span className="font-bold text-sm">Sair</span>}
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Sair
            </div>
          )}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
