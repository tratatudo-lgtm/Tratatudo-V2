
import React from 'react';
import { cn } from '../../lib/utils';

interface RestaurantStatusBadgeProps {
  status: string;
  type?: 'order' | 'reservation' | 'payment' | 'ticket';
  className?: string;
}

export function RestaurantStatusBadge({ status, type = 'order', className }: RestaurantStatusBadgeProps) {
  const getStatusConfig = (status: string, type: string) => {
    const s = status.toLowerCase();
    
    if (type === 'order') {
      switch (s) {
        case 'pending':
        case 'pendente':
          return { label: 'Pendente', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
        case 'preparing':
        case 'preparação':
        case 'em preparação':
          return { label: 'Em Preparação', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
        case 'ready':
        case 'pronto':
          return { label: 'Pronto', bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' };
        case 'completed':
        case 'concluído':
          return { label: 'Concluído', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
        case 'cancelled':
        case 'cancelado':
          return { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
        default:
          return { label: status, bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' };
      }
    }

    if (type === 'reservation') {
      switch (s) {
        case 'pending':
        case 'pendente':
          return { label: 'Pendente', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
        case 'confirmed':
        case 'confirmada':
          return { label: 'Confirmada', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
        case 'completed':
        case 'concluída':
          return { label: 'Concluída', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
        case 'cancelled':
        case 'cancelada':
          return { label: 'Cancelada', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
        default:
          return { label: status, bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' };
      }
    }

    if (type === 'payment') {
      switch (s) {
        case 'paid':
        case 'pago':
          return { label: 'Pago', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
        case 'pending':
        case 'pendente':
          return { label: 'Pendente', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
        case 'failed':
        case 'falhou':
          return { label: 'Falhou', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
        default:
          return { label: status, bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' };
      }
    }

    return { label: status, bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' };
  };

  const config = getStatusConfig(status, type);

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-transparent",
      config.bg,
      config.text,
      className
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full", config.dot)}></div>
      {config.label}
    </div>
  );
}
