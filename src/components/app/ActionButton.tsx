import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ label, icon: Icon, onClick, variant = 'primary', className }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm shadow-slate-200',
    outline: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-600'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95",
        variants[variant],
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};
