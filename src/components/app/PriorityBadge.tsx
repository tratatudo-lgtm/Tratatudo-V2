import React from 'react';
import { cn } from '../../lib/utils';

interface PriorityBadgeProps {
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'baixa':
        return 'bg-slate-50 text-slate-700 border-slate-100';
      case 'média':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'alta':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'urgente':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
      getPriorityStyles(priority),
      className
    )}>
      {priority}
    </span>
  );
};
