import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
      case 'novo':
      case 'agendado':
      case 'invited':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'em_progresso':
      case 'em análise':
      case 'active':
      case 'ativo':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'concluída':
      case 'concluído':
      case 'resolvido':
      case 'realizado':
      case 'pago':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelada':
      case 'cancelado':
      case 'atrasado':
      case 'inactive':
      case 'inativo':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
      getStatusStyles(status),
      className
    )}>
      {status.replace('_', ' ')}
    </span>
  );
};
